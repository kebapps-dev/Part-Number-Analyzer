// filter-selector.js
// Loads csv/filters.csv and builds a cascading selector UI inside #filter-selector
// Exposes selects for: SideOfVFD -> Product -> Class -> Size
// Displays matching PartNumber, Frequency, Notes, Notes2, Notes3

(function(){
  'use strict';

  function el(id){ return document.getElementById(id); }

  function createOption(value, label){
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label || value;
    return opt;
  }

  function unique(values){
    return Array.from(new Set(values.filter(v => v !== '' && v !== undefined))).sort((a,b)=>{
      // try numeric sort if both are numeric
      const an = Number(a), bn = Number(b);
      if (!isNaN(an) && !isNaN(bn)) return an - bn;
      return String(a).localeCompare(String(b));
    });
  }

  function normalizeRow(row){
    const out = {};
    Object.keys(row).forEach(k=>{
      const key = k.trim();
      out[key] = (row[k] || '').toString().trim();
    });
    return out;
  }

  // The HTML for selects and results is expected to exist in index.html inside
  // the element with id="filter-selector". This file only wires behavior and
  // populates the selects from csv/filters.csv.

  function renderResults(rows){
    const out = el('fs-results');
    out.innerHTML = '';
    if (!rows || rows.length === 0){
      out.textContent = 'No matching product rows.';
      return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.className = 'filter-results-table';

    function th(text){ const h = document.createElement('th'); h.textContent = text; h.style.textAlign = 'left'; h.style.borderBottom = '1px solid #ddd'; h.style.padding = '6px'; return h; }
    function td(text){ const c = document.createElement('td'); c.textContent = text || ''; c.style.padding = '6px'; c.style.borderBottom = '1px solid #f2f2f2'; return c; }

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Part Number','Size','Frequency (Hz)','Power (W)','Notes','',''].forEach(h=> headRow.appendChild(th(h)));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.appendChild(td(r['Part Number']));
        // show Size and Unit together (e.g. "100 mm")
        const sizeVal = (r['Size'] || '').toString().trim();
        const unitVal = (r['Unit'] || '').toString().trim();
        const sizeDisplay = sizeVal && unitVal ? `${sizeVal} ${unitVal}` : (sizeVal || unitVal || '');
      tr.appendChild(td(sizeDisplay));
      tr.appendChild(td(r['Frequency']));

      tr.appendChild(td(r['Power']));
      tr.appendChild(td(r['Notes']));
      tr.appendChild(td(r['Notes2']));
      tr.appendChild(td(r['Notes3']));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    out.appendChild(table);
  }

  // main initializer
  function init(){
    const container = document.getElementById('filter-selector');
    if (!container) return;

    // Ensure required elements are present in the HTML. If not, show a helpful message.
    const requiredIds = ['fs-side','fs-product','fs-class','fs-size','fs-results'];
    const missing = requiredIds.filter(id => !document.getElementById(id));
    if (missing.length){
      container.innerHTML = '<p style="color:darkred;">Error: filter-selector HTML not found. Expected elements: ' + missing.join(', ') + '</p>';
      console.error('filter-selector: missing HTML elements:', missing);
      return;
    }

    // parse csv
    if (!window.Papa){
      console.error('PapaParse is required (already included in index.html).');
      container.innerHTML = '<p style="color:darkred;">Error: PapaParse not loaded. Ensure index.html includes PapaParse.</p>';
      return;
    }

    window.Papa.parse('csv/filters.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results){
        const raw = results.data || [];
        const data = raw.map(normalizeRow);

        // store on window for debug/inspection
        window.__filterSelectorData = data;

        // populate Side select
        const sides = unique(data.map(d=>d['SideOfVFD'] || d['Side'] || d['SideOfVFD']));
        const sideSelect = el('fs-side');
        sideSelect.innerHTML = '';
        sideSelect.appendChild(createOption('','-- select side --'));
        sides.forEach(s=> sideSelect.appendChild(createOption(s)));

        // wire cascade
        const productSelect = el('fs-product');
        const classSelect = el('fs-class');
        const sizeSelect = el('fs-size');

        sideSelect.addEventListener('change', function(){
          const side = this.value;
          productSelect.innerHTML = '';
          productSelect.appendChild(createOption('','-- select product --'));
          classSelect.innerHTML = '';
          classSelect.appendChild(createOption('','-- select class --'));
          sizeSelect.innerHTML = '';
          sizeSelect.appendChild(createOption('','-- select size --'));
          // clear product description when side changes so we don't show a description
          // for a product that belongs to a different side
          const descEl = document.getElementById('fs-product-desc');
          if (descEl) descEl.innerHTML = '';
          renderResults([]);
          if (!side) return;
          const prodOptions = unique(data.filter(d=> (d['SideOfVFD']||d['Side']) === side).map(d=>d['Product']));
          prodOptions.forEach(p=> productSelect.appendChild(createOption(p)));
        });

        productSelect.addEventListener('change', function(){
          const side = sideSelect.value; const prod = this.value;
          classSelect.innerHTML = '';
          classSelect.appendChild(createOption('','-- select class --'));
          sizeSelect.innerHTML = '';
          sizeSelect.appendChild(createOption('','-- select size --'));
          renderResults([]);

          // product description area (populated when a product is selected)
          const descEl = document.getElementById('fs-product-desc');
          if (!prod){ if (descEl) descEl.innerHTML = ''; if (!side) return; }

          // Filter by product and optional side
          const matches = data.filter(d=> (!side || (d['SideOfVFD']||d['Side']) === side) && d['Product'] === prod);

          // Populate class options based on matches
          const classOptions = unique(matches.map(d=>d['Class'] || d['Class']));
          classOptions.forEach(c=> classSelect.appendChild(createOption(c)));

          // Build a simple description: prefer Notes/Notes2/Notes3 from data, fall back to listing classes/sizes
          if (descEl){
            let desc = '';
            if (productSelect.value === 'Sine Filter (Z1)') desc = 
              'Create sinusiodal motor voltages and reduce motor losses';
            if (productSelect.value === 'Motor Choke (Z1/Z2)') desc = 
              'Reduces voltage rise rate dV/dt';
            if (productSelect.value === 'Mains Choke (Z1)') desc = 
              'Reduces harmonics and in-rush current, Increases service life of components and input rectifier stage, and has voltage losses (~4%). KEB requires these with 100HP inverters and up';
            if (productSelect.value === 'Harmonic Filter (Z1)') desc = 
              'Reduces harmonics resulting in sinusoidal current consumption without voltage losses that occur with mains chokes. Usually replaces mains choke as well.';
            if (productSelect.value === 'Central HF Filter (E4/E6)') desc = 
              'Used for high frequency interference suppression of single and multiple axis systems';
            if (productSelect.value === 'Submounted Filters (E6)') desc = 
              'Exclusively for F6 only, and for high frequency interference suppression of single and multiple axis systems, and some options have an integrated mains choke';
            if (productSelect.value === 'HF DC-Filter (E5/E6)') desc = 
              'Designed to suppress interference from individual devices. This device allows larger DC supply networks to be set up, and allows motors with longer cable lengths to be operated without disturbing the DC supply network';
            if (productSelect.value === 'Mains Choke + Sine Filter (Z1)') desc = 
              'Backplate Mounted Mains Choke with Submounted EMC Filter (Z1). The backplane mounting mains choke type is a range extension of the standard mains choke with the reference xxZ1B04-1000 and are designed to work together with the KEB sub-mounted EMC filters type xxE6T60-1150 as they can be placed directly above the drive controller-filter combination and allows a compact electric cabinet design.';
            if (productSelect.value === '-- select product --'){desc = '';}
            descEl.innerHTML = desc;
          }
        });

        classSelect.addEventListener('change', function(){
          const side = sideSelect.value; const prod = productSelect.value; const cls = this.value;
          sizeSelect.innerHTML = '';
          sizeSelect.appendChild(createOption('','-- select size --'));
          renderResults([]);
          if (!side || !prod || !cls) return;
          // Include unit next to size in the option label (e.g. "50 (mm)")
          const filtered = data.filter(d=> (d['SideOfVFD']||d['Side']) === side && d['Product'] === prod && d['Class'] === cls);
          const sizeValues = unique(filtered.map(d=>d['Size']));
          sizeValues.forEach(sz => {
            const match = filtered.find(d => d['Size'] === sz) || {};
            const unit = (match['Unit'] || '').toString().trim();
            const label = unit ? (sz + ' (' + unit + ')') : sz;
            sizeSelect.appendChild(createOption(sz, label));
          });
        });

        sizeSelect.addEventListener('change', function(){
          const side = sideSelect.value; const prod = productSelect.value; const cls = classSelect.value; const size = this.value;
          if (!side || !prod || !cls || !size){ renderResults([]); return; }
          const matches = data.filter(d=> (d['SideOfVFD']||d['Side']) === side && d['Product'] === prod && d['Class'] === cls && d['Size'] === size);
          renderResults(matches);
        });
      },
      error: function(err){
        console.error('Failed to load csv/filters.csv', err);
        const container = document.getElementById('filter-selector');
        if (container) container.innerHTML = '<p style="color:darkred;">Failed to load csv/filters.csv</p>';
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
