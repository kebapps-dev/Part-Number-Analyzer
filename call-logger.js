(function(){
    const fileInput = document.getElementById('cl_file');
    const openNativeBtn = document.getElementById('cl_open_native');
    const selectedFilenameSpan = document.getElementById('cl_selected_filename');
    const submitBtn = document.getElementById('cl_submit');
    const clearBtn = document.getElementById('cl_clear');
    const statusSpan = document.getElementById('cl_status');

    // Will hold a FileSystemFileHandle when user picks a file via the native picker
    let fileHandle = null;

    function getFormDataArray(){
        // Add a human-readable date/time as the first column, keep ISO timestamp as the last column
        return [
            new Date().toLocaleString(),
            document.getElementById('cl_name').value || '',
            document.getElementById('cl_company').value || '',
            document.getElementById('cl_phone').value || '',
            document.getElementById('cl_email').value || '',
            document.getElementById('cl_location').value || '',
            document.getElementById('cl_machine').value || '',
            document.getElementById('cl_oem').value || '',
            document.getElementById('cl_newinstall').value || '',
            document.getElementById('cl_matno').value || '',
            document.getElementById('cl_serial').value || '',
            document.getElementById('cl_found').value || '',
            document.getElementById('cl_notes').value || '',
            new Date().toISOString()
        ];
    }

    async function readFileAsArrayBuffer(fileOrHandle){
        // Accept either a File object (from <input>) or a FileSystemFileHandle
        if (!fileOrHandle) return null;
        if (fileOrHandle.getFile) {
            // FileSystemFileHandle
            const f = await fileOrHandle.getFile();
            return await f.arrayBuffer();
        }
        return new Promise((resolve,reject)=>{
            const reader = new FileReader();
            reader.onload = (e)=> resolve(e.target.result);
            reader.onerror = (e)=> reject(e);
            reader.readAsArrayBuffer(fileOrHandle);
        });
    }

    // Native open button: prefer File System Access API when available (Chrome, Edge, etc.)
    if (openNativeBtn) {
        openNativeBtn.addEventListener('click', async ()=>{
            statusSpan.textContent = '';
            // feature detect
            if (window.showOpenFilePicker) {
                try {
                    const [handle] = await window.showOpenFilePicker({
                        types: [{
                            description: 'Excel',
                            accept: {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls']}
                        }],
                        excludeAcceptAllOption: false,
                        multiple: false
                    });
                    fileHandle = handle;
                    // Display chosen filename
                    selectedFilenameSpan.textContent = handle.name || '';
                    // Clear any file input selection to avoid ambiguity
                    if (fileInput) fileInput.value = '';
                } catch (err) {
                    console.warn('User cancelled native picker or error', err);
                }
            } else {
                alert('Native file overwrite is not supported in this browser. Use the file selector instead.');
            }
        });
    }

    submitBtn.addEventListener('click', async ()=>{
        statusSpan.textContent = '';
                        // Prefer fileHandle (native) if present, otherwise fall back to file input
                        const inputFile = fileInput.files && fileInput.files[0];
                        if (!fileHandle && !inputFile){
                            alert('Please select a local Excel workbook (.xls or .xlsx) to append the log to, either via the file input or the "Open workbook (native)" button.');
                            return;
                        }

                        try {
                            const data = await readFileAsArrayBuffer(fileHandle || inputFile);
            // Read workbook
            const wb = XLSX.read(data, {type:'array'});
            let sheetName = wb.SheetNames && wb.SheetNames[0];
            if (!sheetName){
                // create a sheet
                sheetName = 'Sheet1';
                wb.SheetNames.push(sheetName);
                wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet([]);
            }
            const ws = wb.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(ws, {header:1});

            // If sheet is empty, optionally add header row
                            if (rows.length === 0 || (rows.length ===1 && rows[0].length===0)){
                                const header = ['Date/Time','Name','Company','Phone','Email','Location','Machine Type','OEM','New Install','Mat. Number','Serial Number','Found From','Notes','Timestamp'];
                                XLSX.utils.sheet_add_aoa(ws, [header], {origin:0});
                            }

            // Prepare row to append
            const row = getFormDataArray();

            // Append at first empty row (after existing rows)
            XLSX.utils.sheet_add_aoa(ws, [row], {origin:-1});

            // Write workbook back to array
            const filename = file.name;
            // Choose bookType based on extension
            const ext = filename.split('.').pop().toLowerCase();
            const bookType = (ext === 'xls') ? 'xls' : 'xlsx';
            const wbout = XLSX.write(wb, {bookType:bookType, type:'array'});

                            // If we have a native file handle that supports createWritable, write directly (overwrite)
                            if (fileHandle && fileHandle.createWritable) {
                                try {
                                    const blob = new Blob([wbout], {type: 'application/octet-stream'});
                                    const writable = await fileHandle.createWritable();
                                    await writable.write(blob);
                                    await writable.close();
                                    alert('Log successfully written to the selected workbook.');
                                    statusSpan.textContent = 'Submitted';
                                } catch (writeErr) {
                                    console.error('Native write failed, falling back to download', writeErr);
                                    // Fallback to download
                                    const blob = new Blob([wbout], {type: 'application/octet-stream'});
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(url);
                                    alert('Native write failed; a modified workbook download has been started — save it to replace the original file if desired.');
                                    statusSpan.textContent = 'Submitted (download fallback)';
                                }
                            } else {
                                // Fallback: trigger download so user can save/replace the original file
                                const blob = new Blob([wbout], {type: 'application/octet-stream'});
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                // Suggest same filename (user may need to overwrite)
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);

                                alert('Log successfully submitted. A modified workbook download has been started — save it to replace the original file if desired.');
                                statusSpan.textContent = 'Submitted';
                            }
        } catch (err){
            console.error('Call Logger submit error', err);
            alert('Failed to submit log: ' + (err && err.message ? err.message : 'Unknown error'));
        }
    });

    clearBtn.addEventListener('click', ()=>{
        const ok = confirm('Are you sure you want to clear all inputs?');
        if (!ok) return;
        // Clear inputs
        ['cl_name','cl_company','cl_phone','cl_email','cl_location','cl_machine','cl_oem','cl_matno','cl_serial','cl_found','cl_notes'].forEach(id=>{
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        // reset select
        const sel = document.getElementById('cl_newinstall'); if (sel) sel.value = 'No';
        statusSpan.textContent = '';
    });
})();
