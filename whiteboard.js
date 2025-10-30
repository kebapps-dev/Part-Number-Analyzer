// whiteboard.js
// Simple shared editable whiteboard with autosave to localStorage and cross-tab sync via BroadcastChannel
(function(){
  const STORAGE_KEY = 'sharedWhiteboardContentV1';
  const CHANNEL_NAME = 'shared-whiteboard-channel';
  const AUTO_SAVE_INTERVAL = 5000; // periodic autosave (ms)
  let saveTimer = null;
  let lastSaved = null;
  let bc = null;
  let rows = [];
  // Remote sync (REST) configuration
  let remoteEnabled = false;
  let remoteUrl = '';
  let remotePath = 'whiteboard/shared';
  let remoteLastTs = 0;

  function el(id){ return document.getElementById(id); }

  function ensureStyles(){
    // Inject CSS link for whiteboard (so removing file is easy)
    const href = 'whiteboard.css';
    if (!document.querySelector(`link[href="${href}"]`)){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function buildUI(){
    if (el('whiteboardPanel')) return; // already built
    ensureStyles();

    const panel = document.createElement('div');
    panel.id = 'whiteboardPanel';
    panel.classList.add('whiteboard-panel');

    // Always mount into drive-error-help. If missing, create a hidden container so we have a host.
    const EMBED_ID = 'drive-error-help';
    let embedContainer = document.getElementById(EMBED_ID);
    if (!embedContainer){
      embedContainer = document.createElement('div');
      embedContainer.id = EMBED_ID;
      embedContainer.className = 'container-right';
      embedContainer.style.display = 'none';
      document.body.appendChild(embedContainer);
    }
    const mountTarget = embedContainer;
    panel.classList.add('whiteboard-embedded');

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'whiteboard-toolbar';

    const title = document.createElement('span');
    title.className = 'whiteboard-title';
    title.textContent = 'Shared Whiteboard (table)';

    const actions = document.createElement('div');
    actions.className = 'whiteboard-actions';

    const addRowBtn = document.createElement('button');
    addRowBtn.id = 'wbAddRow';
    addRowBtn.className = 'button';
    addRowBtn.textContent = 'Add Row';

    const clearBtn = document.createElement('button');
    clearBtn.id = 'wbClear';
    clearBtn.className = 'button';
    clearBtn.textContent = 'Clear';

    const exportBtn = document.createElement('button');
    exportBtn.id = 'wbExport';
    exportBtn.className = 'button';
    exportBtn.textContent = 'Export';

    const importFile = document.createElement('input');
    importFile.type = 'file';
    importFile.accept = 'application/json,text/*';
    importFile.id = 'wbImportFile';
    importFile.style.display = 'none';

    const importBtn = document.createElement('button');
    importBtn.id = 'wbImportBtn';
    importBtn.className = 'button';
    importBtn.textContent = 'Import';

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'wbToggle';
    toggleBtn.className = 'button';
    toggleBtn.textContent = 'Hide';

    actions.appendChild(addRowBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(exportBtn);
    actions.appendChild(importBtn);
    actions.appendChild(importFile);
    // Quick-save (force save to localStorage)
    const saveBtn = document.createElement('button');
    saveBtn.id = 'wbSave';
    saveBtn.className = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', ()=> saveContent('manual'));
    actions.appendChild(saveBtn);

    // Copy JSON to clipboard
    const copyBtn = document.createElement('button');
    copyBtn.id = 'wbCopy';
    copyBtn.className = 'button';
    copyBtn.textContent = 'Copy JSON';
    copyBtn.addEventListener('click', ()=>{
      try {
        const txt = JSON.stringify(rows, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(()=> alert('Whiteboard JSON copied to clipboard'))
            .catch(()=> { prompt('Copy failed — here is the JSON:', txt); });
        } else {
          prompt('Copy the JSON below:', txt);
        }
      } catch (e) { alert('Failed to copy JSON'); }
    });
    actions.appendChild(copyBtn);

    actions.appendChild(toggleBtn);

    //toolbar.appendChild(title);
    toolbar.appendChild(actions);

    // Content area will hold the table
    const content = document.createElement('div');
    content.id = 'whiteboardContent';
    content.className = 'whiteboard-content';
    content.setAttribute('aria-label','Shared whiteboard table');

  const status = document.createElement('div');
  status.className = 'whiteboard-status';
  status.innerHTML = 'Last saved: <span id="wbSavedTime">never</span> <span style="margin-left:12px;">Remote: <span id="wbRemoteStatus">off</span></span>';

    panel.appendChild(content);
    panel.appendChild(toolbar);
    panel.appendChild(status);

    mountTarget.appendChild(panel);

    // If the embed container is hidden on load (display:none), measuring scrollHeight will be 0.
    // Observe the container and re-run textarea sizing once it becomes visible.
    try {
      const observerTarget = embedContainer;
      const resizeWhenVisible = () => {
        const wrapper = el('whiteboardContent');
        if (!wrapper) return;
        if (getComputedStyle(observerTarget).display !== 'none'){
          wrapper.querySelectorAll('textarea').forEach(autoResizeTextarea);
        }
      };
      const mo = new MutationObserver(resizeWhenVisible);
      mo.observe(observerTarget, { attributes: true, attributeFilter: ['style', 'class'] });
      // try once after a short delay too (in case CSS loads later)
      setTimeout(resizeWhenVisible, 250);
      // also try on window focus (user may have toggled visibility from another tab)
      window.addEventListener('focus', resizeWhenVisible);
    } catch (e) { /* ignore */ }

    // Attach events
    addRowBtn.addEventListener('click', ()=> addRow('',''));
    clearBtn.addEventListener('click', clearWhiteboard);
    exportBtn.addEventListener('click', exportWhiteboard);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if (f) importWhiteboard(f);
      e.target.value = '';
    });
    toggleBtn.addEventListener('click', togglePanel);

    // initial render
    renderTable();
  }

  function renderTable(){
    const wrapper = el('whiteboardContent');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'whiteboard-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Error Code','Troubleshooting',''].forEach(h=>{
      const th = document.createElement('th'); th.textContent = h; headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rows.forEach((r, idx) => {
      const tr = document.createElement('tr');

      const tdA = document.createElement('td');
      const inputA = document.createElement('input');
      inputA.type = 'text'; inputA.value = r.left || '';
      inputA.addEventListener('input', ()=>{ rows[idx].left = inputA.value; scheduleSave(); broadcastUpdate(); });
      tdA.appendChild(inputA);

  const tdB = document.createElement('td');
  const textareaB = document.createElement('textarea');
  textareaB.rows = 3;
  textareaB.value = r.right || '';
  textareaB.addEventListener('input', ()=>{ rows[idx].right = textareaB.value; autoResizeTextarea(textareaB); scheduleSave(); broadcastUpdate(); });
  textareaB.style.width = '100%';
  textareaB.style.overflow = 'hidden';
  tdB.appendChild(textareaB);

      const tdActions = document.createElement('td');
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'button small';
      // Capture the key (Column A value) to identify the row at click-time.
      const deleteKey = String(r.left || '');
      del.addEventListener('click', ()=>{
        if (!confirm(`Delete row for "${deleteKey}"?`)) return;
        const foundIndex = rows.findIndex(item => String(item.left || '') === deleteKey);
        if (foundIndex === -1){
          alert('Could not find the row to delete. It may have been changed by another tab.');
          return;
        }
        rows.splice(foundIndex,1);
        renderTable();
        saveContent('delete');
        broadcastUpdate();
      });
      tdActions.appendChild(del);

      tr.appendChild(tdA); tr.appendChild(tdB); tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);

    // ensure all textareas are sized to fit content
    wrapper.querySelectorAll('textarea').forEach(autoResizeTextarea);
  }

  // resize helper: make textarea grow to fit content (no scrollbar)
  function autoResizeTextarea(el){
    if (!el) return;
    try {
      // prevent manual resize and hide overflow
      el.style.resize = 'none';
      el.style.overflow = 'hidden';
      // reset height so scrollHeight measures correctly
      el.style.height = '0px';
      const measured = el.scrollHeight;
      if (!measured || measured <= 2){
        // likely the container is hidden (display:none) so scrollHeight is 0.
        // Fallback: estimate height from number of lines and computed line-height.
        const lines = (el.value.match(/\n/g) || []).length + 1;
        const cs = window.getComputedStyle(el);
        let lineHeight = parseFloat(cs.lineHeight);
        if (!lineHeight || isNaN(lineHeight)) lineHeight = 18; // sensible default
        const paddingTop = parseFloat(cs.paddingTop) || 4;
        const paddingBottom = parseFloat(cs.paddingBottom) || 4;
        el.style.height = (lines * lineHeight + paddingTop + paddingBottom) + 'px';
      } else {
        // small extra so last line isn't clipped on some browsers
        el.style.height = (measured + 2) + 'px';
      }
    } catch (e) { /* ignore */ }
  }

  function addRow(left, right){
    rows.push({ left: left || '', right: right || '' });
    renderTable();
    // after render, ensure last textarea is sized to fit content and focus it
    const wrapper = el('whiteboardContent');
    if (wrapper){
      const textareas = wrapper.querySelectorAll('textarea');
      if (textareas && textareas.length){
        const last = textareas[textareas.length - 1];
        autoResizeTextarea(last);
        try { last.focus(); } catch(e){}
      }
    }
    scheduleSave();
    broadcastUpdate();
  }

  function loadContent(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { rows = []; renderTable(); updateSavedTime(); return; }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) rows = parsed; else rows = [];
      // Alphabetize by Column A (left) on load so table is sorted when opened
      rows.sort((a,b) => {
        const A = (a && a.left) ? String(a.left) : '';
        const B = (b && b.left) ? String(b.left) : '';
        return A.localeCompare(B, undefined, { sensitivity: 'base', numeric: true });
      });
    } catch (e){ rows = []; }
    renderTable(); updateSavedTime();
    // attempt to initialize remote sync after local load
    try { initRemoteSync(); } catch (e) { /* ignore */ }
  }

  function saveContent(reason){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      lastSaved = new Date();
      updateSavedTime();
      localStorage.setItem(STORAGE_KEY + ':ts', String(lastSaved.getTime()));
      if (bc) bc.postMessage({ type: 'update', rows: rows, ts: Date.now() });
      // Only push to remote when user explicitly presses Save (reason === 'manual').
      // This prevents autosave/interval saves from immediately syncing to the public DB.
      if (remoteEnabled) {
        if (reason === 'manual') {
          // user-initiated save -> push
          pushToRemote();
        } else {
          // mark remote status as unsynced so user knows local changes haven't been pushed
          setRemoteStatus('unsynced');
        }
      }
    } catch (e) {
      console.error('Failed to save whiteboard content', e);
    }
  }

  function scheduleSave(){
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(()=> saveContent('debounce'), 800);
  }

  function periodicSave(){ saveContent('interval'); }

  function updateSavedTime(){
    const span = el('wbSavedTime');
    if (!span) return;
    if (!lastSaved){
      const stored = localStorage.getItem(STORAGE_KEY + ':ts');
      if (stored) lastSaved = new Date(parseInt(stored,10));
    }
    span.textContent = lastSaved ? lastSaved.toLocaleString() : 'never';
  }

  function clearWhiteboard(){
    if (!confirm('Clear the whiteboard? This cannot be undone.')) return;
    rows = [];
    renderTable();
    saveContent('clear');
    broadcastUpdate();
  }

  function exportWhiteboard(){
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'whiteboard.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function importWhiteboard(file){
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)){
          rows = parsed;
          renderTable();
          saveContent('import');
          broadcastUpdate();
        } else {
          alert('Imported file did not contain an array of rows');
        }
      } catch (err){ alert('Failed to import file: invalid JSON'); }
    };
    reader.readAsText(file);
  }

  function togglePanel(){ const panel = el('whiteboardPanel'); const toggleBtn = el('wbToggle'); if (!panel) return; if (panel.classList.contains('hidden')){ panel.classList.remove('hidden'); if (toggleBtn) toggleBtn.textContent = 'Hide'; } else { panel.classList.add('hidden'); if (toggleBtn) toggleBtn.textContent = 'Show'; } }

  function broadcastUpdate(){ if (bc) bc.postMessage({ type: 'editing', rows: rows, ts: Date.now() }); }

  function initBroadcastChannel(){
    if ('BroadcastChannel' in window){
      try {
        bc = new BroadcastChannel(CHANNEL_NAME);
        bc.onmessage = (ev) => {
          if (!ev.data) return;
          if (ev.data.type === 'update' || ev.data.type === 'editing'){
            try {
              const incoming = ev.data.rows;
              if (!Array.isArray(incoming)) return;
              // simple last-write-wins: overwrite local rows and rerender if different
              const local = JSON.stringify(rows || []);
              const inc = JSON.stringify(incoming || []);
              if (local !== inc){ rows = incoming; renderTable(); lastSaved = new Date(); updateSavedTime(); }
            } catch (e){ /* ignore malformed */ }
          }
        };
      } catch (e) { console.warn('BroadcastChannel failed:', e); }
    }
  }

  // ---- Remote REST sync (optional) ----
  function setRemoteStatus(text){
    const s = el('wbRemoteStatus'); if (!s) return;
    // set text and color for quick visual feedback
    s.textContent = text;
    s.style.color = '';
    s.style.fontWeight = '';
    switch(String(text).toLowerCase()){
      case 'unsynced':
        s.style.color = '#c80000'; // red
        s.style.fontWeight = 'bold';
        break;
      case 'error':
        s.style.color = '#c80000';
        s.style.fontWeight = 'bold';
        break;
      case 'synced':
        s.style.color = '#006800'; // green
        s.style.fontWeight = 'bold';
        break;
      case 'updated':
        s.style.color = '#0047ab'; // blue
        s.style.fontWeight = 'bold';
        break;
      case 'connecting':
        s.style.color = '#aa7700'; // amber
        s.style.fontWeight = 'normal';
        break;
      case 'connected':
      case 'off':
      default:
        s.style.color = '';
        s.style.fontWeight = '';
        break;
    }
  }

  function initRemoteSync(){
    try {
      const url = window && window.WHITEBOARD_REMOTE_DB;
      const path = window && window.WHITEBOARD_REMOTE_PATH;
      if (!url) { remoteEnabled = false; setRemoteStatus('off'); return; }
      remoteUrl = String(url).replace(/\/$/, '');
      if (path) remotePath = String(path).replace(/^\/+|\/+$/g, '');
      remoteEnabled = true;
      setRemoteStatus('connecting');
      // fetch initial remote state
      fetchRemoteOnce();
      // poll periodically for remote updates
      setInterval(()=>{ if (remoteEnabled) fetchRemoteOnce(); }, AUTO_SAVE_INTERVAL);
    } catch (e){ console.warn('initRemoteSync failed', e); remoteEnabled = false; setRemoteStatus('error'); }
  }

  async function fetchRemoteOnce(){
    if (!remoteEnabled || !remoteUrl) return;
    const full = `${remoteUrl}/${remotePath}.json`;
    try {
      const resp = await fetch(full, { cache: 'no-store' });
      if (!resp.ok){ setRemoteStatus('error'); return; }
      const body = await resp.json();
      if (!body) { setRemoteStatus('connected'); return; }
      let incomingRows = null;
      let ts = 0;
      if (Array.isArray(body)) { incomingRows = body; ts = Date.now(); }
      else if (body.rows && Array.isArray(body.rows)) { incomingRows = body.rows; ts = body.ts || Date.now(); }
      else if (body.rows && typeof body.rows === 'string') { try { incomingRows = JSON.parse(body.rows); } catch(e){ incomingRows = []; } ts = body.ts || Date.now(); }
      else { setRemoteStatus('connected'); return; }

      // Only apply if remote timestamp is newer than our last known remote timestamp
      if (ts && ts <= remoteLastTs) { setRemoteStatus('connected'); return; }
      remoteLastTs = ts || Date.now();
      if (Array.isArray(incomingRows)){
        rows = incomingRows;
        renderTable();
        lastSaved = new Date(remoteLastTs);
        updateSavedTime();
        setRemoteStatus('updated');
      }
    } catch (e){ console.warn('fetchRemoteOnce failed', e); setRemoteStatus('error'); }
  }

  function pushToRemote(){
    if (!remoteEnabled || !remoteUrl) return;
    const full = `${remoteUrl}/${remotePath}.json`;
    const payload = { rows: rows, ts: Date.now() };
    try {
      fetch(full, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(resp => {
          if (!resp.ok) { console.warn('pushToRemote failed', resp.status); setRemoteStatus('error'); }
          else { remoteLastTs = payload.ts; setRemoteStatus('synced'); }
        })
        .catch(err => { console.warn('pushToRemote error', err); setRemoteStatus('error'); });
    } catch (e){ console.warn('pushToRemote exception', e); setRemoteStatus('error'); }
  }

  // init on load
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { buildUI(); initBroadcastChannel(); loadContent(); setInterval(periodicSave, AUTO_SAVE_INTERVAL); window.addEventListener('beforeunload', ()=> saveContent('unload')); });
  } else {
    buildUI(); initBroadcastChannel(); loadContent(); setInterval(periodicSave, AUTO_SAVE_INTERVAL); window.addEventListener('beforeunload', ()=> saveContent('unload'));
  }
  
})();
