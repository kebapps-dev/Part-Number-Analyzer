(function(){
    const fileInput = document.getElementById('cl_file');
    const openNativeBtn = document.getElementById('cl_open_native');
    const selectedFilenameSpan = document.getElementById('cl_selected_filename');
    const submitBtn = document.getElementById('cl_submit');
    const clearBtn = document.getElementById('cl_clear');
    const statusSpan = document.getElementById('cl_status');
    const createTemplateBtn = document.getElementById('cl_create_template');

    // Will hold a FileSystemFileHandle when user picks a file via the native picker
    let fileHandle = null;

    function getFormDataArray(){
        // Add a human-readable date/time as the first column, keep ISO timestamp as the last column
        const notesRaw = (document.getElementById('cl_notes').value || '');
        // Replace line breaks in notes with commas (trim lines and remove empty)
        const notesJoined = notesRaw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).join(', ');

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
            notesJoined,
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

    // Create a new workbook template with headers and formatting
    if (createTemplateBtn) {
        createTemplateBtn.addEventListener('click', async ()=>{
            statusSpan.textContent = '';
            try {
                const header = ['Date/Time','Name','Company','Phone','Email','Location','Machine Type','OEM','New Install','Mat. Number','Serial Number','Found From','Notes','Timestamp'];
                const aoa = [header];
                const ws = XLSX.utils.aoa_to_sheet(aoa);
                // Set header font size and column widths
                for (let c = 0; c < header.length; c++){
                    const addr = XLSX.utils.encode_cell({c: c, r: 0});
                    ws[addr] = ws[addr] || {t:'s', v: header[c]};
                    ws[addr].s = ws[addr].s || {};
                    ws[addr].s.font = Object.assign({}, ws[addr].s.font || {}, {sz: 16});
                }
                ws['!cols'] = new Array(header.length).fill({wch: 15});

                const wb = {SheetNames: ['Sheet1'], Sheets: {'Sheet1': ws}};
                const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array', cellStyles: true});

                // Offer to save via native save picker when available
                if (window.showSaveFilePicker) {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: 'CallLog.xlsx',
                            types: [{description: 'Excel', accept: {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']}}]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(new Blob([wbout], {type: 'application/octet-stream'}));
                        await writable.close();
                        // remember handle for subsequent appends
                        fileHandle = handle;
                        selectedFilenameSpan.textContent = handle.name || '';
                        alert('Template workbook saved. You can now use "Overwrite Existing Workbook" to open it for appending.');
                        statusSpan.textContent = 'Template created';
                        return;
                    } catch (err) {
                        console.warn('Save via native picker cancelled or failed', err);
                        // fallthrough to download
                    }
                }

                // Fallback: download the generated workbook
                const blob = new Blob([wbout], {type: 'application/octet-stream'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'CallLog.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                alert('Template workbook download started. Save it and then use the file selector or "Overwrite Existing Workbook" to open it.');
                statusSpan.textContent = 'Template downloaded';
            } catch (err) {
                console.error('Failed to create template', err);
                alert('Failed to create template: ' + (err && err.message ? err.message : 'Unknown error'));
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
                // refresh rows after adding header
                rows = XLSX.utils.sheet_to_json(ws, {header:1});
            }

            // Ensure header styling (bold) and set column widths
            const headerRow = rows[0] || [];
            const colCount = Math.max(headerRow.length, getFormDataArray().length);

            for (let c = 0; c < colCount; c++){
                const addr = XLSX.utils.encode_cell({c: c, r: 0});
                const cell = ws[addr];
                if (cell) {
                    cell.s = cell.s || {};
                    cell.s.font = Object.assign({}, cell.s.font || {}, {sz: 16});
                } else {
                    ws[addr] = {t: 's', v: (headerRow[c] || ''), s: {font: {sz: 16}}};
                }
            }
            // Set column widths to 15 characters
            ws['!cols'] = new Array(colCount).fill({wch: 15});

            // Prepare row to append
            const row = getFormDataArray();

            // Append at first empty row (after existing rows)
            XLSX.utils.sheet_add_aoa(ws, [row], {origin:-1});

            // Write workbook back to array
            // Determine filename from the native file handle if present, otherwise from the input file
            const filename = (fileHandle && fileHandle.name) ? fileHandle.name : (inputFile ? inputFile.name : 'workbook.xlsx');
            // Choose bookType based on extension
            const ext = filename.split('.').pop().toLowerCase();
            const bookType = (ext === 'xls') ? 'xls' : 'xlsx';
            const wbout = XLSX.write(wb, {bookType:bookType, type:'array', cellStyles: true});

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
                                    console.error('Native write failed', writeErr);
                                    // Ask user whether to fall back to download
                                    const reason = (writeErr && writeErr.message) ? writeErr.message : 'unknown error';
                                    const doDownload = confirm('Failed to write the workbook directly ("' + reason + '").\n\nWould you like to download the modified workbook instead so you can save/replace the original file?\n\nClick OK to download, Cancel to abort.');
                                    if (doDownload) {
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
                                        alert('A modified workbook download has been started — save it to replace the original file if desired.');
                                        statusSpan.textContent = 'Submitted (download fallback)';
                                    } else {
                                        // User chose not to download; abort and keep in-memory changes only
                                        alert('Write aborted. Your changes were not saved to disk.');
                                        statusSpan.textContent = 'Write aborted';
                                    }
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
