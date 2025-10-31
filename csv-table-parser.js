// csv-table-parser.js
// Externalized CSV importer that populates the Troubleshooting FAQ table
(function(){
  // Small CSV importer for the Troubleshooting FAQ table
  const fileInput = document.getElementById('faqCsvFile');
  const faqHead = document.getElementById('faqHead');
  const faqBody = document.getElementById('faqBody');
  const clearBtn = document.getElementById('faqClearBtn');

  function renderFaqTable(rows){
    if (!faqHead || !faqBody) return;
    faqHead.innerHTML = '';
    faqBody.innerHTML = '';
    if (!rows || !rows.length){
      faqHead.innerHTML = '<tr><th>No data</th></tr>';
      return;
    }
    // build header from object keys of the first row
    const keys = Object.keys(rows[0]);
    const tr = document.createElement('tr');
    keys.forEach(k=>{ const th = document.createElement('th'); th.textContent = k; tr.appendChild(th); });
    faqHead.appendChild(tr);

    rows.forEach(r=>{
      const tr = document.createElement('tr');
      keys.forEach(k=>{
        const td = document.createElement('td');
        // show empty string for null/undefined
        td.textContent = (r[k] === null || typeof r[k] === 'undefined') ? '' : String(r[k]);
        tr.appendChild(td);
      });
      faqBody.appendChild(tr);
    });
  }

  function parseFile(file){
    if (!file) return;
    if (window.Papa && Papa.parse){
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: function(results){
          if (results && results.data) renderFaqTable(results.data);
        },
        error: function(err){ console.warn('CSV parse error', err); alert('Failed to parse CSV: ' + (err && err.message ? err.message : err)); }
      });
    } else {
      // fallback: read as text and do a very small parser
      const reader = new FileReader();
      reader.onload = function(e){
        try {
          const text = e.target.result || '';
          const lines = text.split(/\r?\n/).filter(l=>l.trim());
          if (!lines.length) return renderFaqTable([]);
          const headers = lines[0].split(',').map(h=>h.trim());
          const data = lines.slice(1).map(line=>{
            const cols = line.split(',');
            const obj = {};
            headers.forEach((h,i)=> obj[h] = (cols[i]||'').trim());
            return obj;
          });
          renderFaqTable(data);
        } catch (e){ console.warn(e); alert('Failed to parse CSV'); }
      };
      reader.readAsText(file);
    }
  }

  if (fileInput){
    fileInput.addEventListener('change', function(e){
      const f = e.target.files && e.target.files[0];
      if (f) parseFile(f);
    });
  }
  if (clearBtn){
    clearBtn.addEventListener('click', function(){ if (faqHead) faqHead.innerHTML=''; if (faqBody) faqBody.innerHTML=''; if (fileInput) fileInput.value = ''; });
  }

  // Attempt to load the default CSV on page load
  function loadDefault(){
    // allow the page to override the URL via window.CSV_TABLE_URL
    const url = (window && window.CSV_TABLE_URL) ? String(window.CSV_TABLE_URL) : 'csv/diode-test-table.csv';
    // Prefer Papa.parse download (handles large files and edge cases)
    if (window.Papa && Papa.parse){
      try {
        Papa.parse(url, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: function(results){
            if (results && results.data) renderFaqTable(results.data);
            else renderFaqTable([]);
          },
          error: function(err){
            console.warn('Papa.parse download failed, falling back to fetch', err);
            // fallback to fetch
            fetch(url).then(r=> r.text()).then(t=>{
              const tmpFile = new File([t], 'diode-test-table.csv', { type: 'text/csv' });
              parseFile(tmpFile);
            }).catch(e=>{ console.warn('Fallback fetch failed', e); renderFaqTable([]); });
          }
        });
        return;
      } catch (e){ console.warn('Papa.parse download exception', e); }
    }
    // If Papa isn't available or download attempt failed, fetch manually
    fetch(url).then(resp=>{
      if (!resp.ok) { console.warn('Failed to fetch CSV', resp.status); renderFaqTable([]); return ''; }
      return resp.text();
    }).then(text=>{
      if (text) {
        const tmpFile = new File([text], 'diode-test-table.csv', { type: 'text/csv' });
        parseFile(tmpFile);
      }
    }).catch(err=>{ console.warn('Failed to load default CSV', err); renderFaqTable([]); });
  }

  // run loader after a short delay to ensure DOM is ready
  setTimeout(loadDefault, 50);

})();
