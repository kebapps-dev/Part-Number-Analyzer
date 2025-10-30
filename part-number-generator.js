// Dynamically update footer product line name
const productLineNames = {
    S6: 'S6-K / A / P',
    F6: 'F6-K / A / P',
    G6: 'G6-G / K / L / P',
    F5: 'F5-A / B / C / D / E...',
    F4: 'F4-C / F / S / Si',
};
const productLineYears = {
    S6: '2018',
    F6: '2015',
    G6: '2016',
    F5: '2002',
    F4: '1996',
};
function updateFooterProductLine() {
    const productLineSelect = document.getElementById('productLine');
    const footerProductLine = document.getElementById('footer-productline');
    const footerProductYear = document.getElementById('footer-productyear');
    const footerProductDate = document.getElementById('footer-productdate');

    if (productLineSelect && footerProductLine) {
        const selected = productLineSelect.value;
        footerProductLine.textContent = productLineNames[selected] || selected;
        footerProductDate.textContent = productLineYears[selected] || '2025';
    }
}



// Config: scalable field mapping for each product line
const scalableConfig = {
    G6: [
        { id: 'g6-power', len: 2 },
        { id: 'productLine', len: 2 },
        { id: 'g6-control', len: 1 },
        { id: 'g6-emi', len: 1 },
        { id: 'g6-housing', len: 1 },
        { id: 'g6-voltage', len: 1 },
        { id: 'g6-overload', len: 1 },
        { id: 'g6-controlkbd', len: 1 },
        { id: 'g6-heatsink', len: 1 }
    ],
    F5: [
        { id: 'f5-power', len: 2 },
        { id: 'productLine', len: 2 },
        { id: 'f5-control', len: 1 },
        { id: 'f5-accessory', len: 1 },      
        { id: 'f5-housing', len: 1 },
        { id: 'f5-voltage', len: 1 },
        { id: 'f5-overload', len: 1 },
        { id: 'f5-encoder', len: 1 },
        { id: 'f5-cooling', len: 1 },
    ],
    S6: [
        { id: 's6-power', len: 2 },
        { id: 'productLine', len: 2 },
        { id: 's6-controltype', len: 1 },
        { id: 's6-safetymodule', len: 1 },
        { id: 's6-housing', len: 1 },
        { id: 's6-version', len: 1 },
        { id: 's6-typecontrol', len: 1 },
        { id: 's6-reserved1', len: 1 },
        { id: 's6-reserved2', len: 1 },
    ],
    F6: [
        { id: 'f6-inverter', len: 2 },
        { id: 'productLine', len: 2 },
        { id: 'f6-control', len: 1 },
        { id: 'f6-equipment', len: 1 },
        { id: 'f6-housing', len: 1 },
        { id: 'f6-voltage', len: 1 },
        { id: 'f6-switching', len: 1 },
        { id: 'f6-heatsink', len: 1 },
        { id: 'f6-board', len: 1 },
        { id: 'f6-extra', len: 1 }
    ],
    F4: [
        { id: 'f4-size', len: 2 },
        { id: 'productLine', len: 2 },
        { id: 'f4-control', len: 1 }, 
        { id: 'f4-accessory', len: 1 },
        { id: 'f4-housing', len: 1 },
        { id: 'f4-input', len: 1 },
        { id: 'f4-supply', len: 1 },
        { id: 'f4-clock', len: 1 },
        { id: 'f4-options', len: 1 }
    ]
};

// --- Scalable part number sync logic ---
function setInputsFromPartNumber(partNumber, productLine) {
    partNumber = partNumber.replace(/-/g, '');
    const config = scalableConfig[productLine];
    if (!config) return;
    let pos = 0;
    for (const field of config) {
        const value = partNumber.substr(pos, field.len);
        pos += field.len;
        const el = document.getElementById(field.id);
        if (el) {
            // Skip 'not valid' logic for productLine select
            if (field.id === 'productLine') {
                el.value = value;
                el.style.background = '';
                continue;
            }
            let found = false;
            for (let i = 0; i < el.options.length; i++) {
                if (el.options[i].value === value) {
                    el.value = value;
                    found = true;
                    el.style.background = '';
                    break;
                }
            }
            if (!found) {
                // Add or update a 'not valid' option
                let invalidOption = Array.from(el.options).find(opt => opt.value === '__notvalid');
                if (!invalidOption) {
                    invalidOption = document.createElement('option');
                    invalidOption.value = '__notvalid';
                    invalidOption.textContent = 'not valid';
                    el.appendChild(invalidOption);
                }
                el.value = '__notvalid';
                el.style.background = '#ffe5e5'; // light red
            } else {
                el.style.background = '';
            }
        }
    }
}

function getPartNumberFromInputs(productLine) {
    const config = scalableConfig[productLine];
    if (!config) return '';
    let part = '';
    for (const field of config) {
        const el = document.getElementById(field.id);
        part += el ? (el.value || '') : '';
    }
    // Insert dash after 7 digits
    return part.length === 11 ? part.slice(0,7) + '-' + part.slice(7) : part;
}

function updatePartNumberInputScalable() {
    const productLine = document.getElementById('productLine').value;
    const partNumber = getPartNumberFromInputs(productLine);
    document.getElementById('decodeInput').value = partNumber;
}

function updateInputsFromPartNumberInput() {
    const partNumber = document.getElementById('decodeInput').value.trim().toUpperCase();
    // Get product line from 3rd and 4th digit
    let detectedProductLine = '';
    if (partNumber.length >= 4) {
        detectedProductLine = partNumber.substr(2,2);
        // Only update if valid
        if (["S6","F6","G6","F5","F4"].includes(detectedProductLine)) {
            const productLineSelect = document.getElementById('productLine');
            if (productLineSelect.value !== detectedProductLine) {
                productLineSelect.value = detectedProductLine;
                showFieldsForProductLine(detectedProductLine);
            }
        }
    }
    const productLine = document.getElementById('productLine').value;
    setInputsFromPartNumber(partNumber, productLine);
}

function showFieldsForProductLine(productLine) {
    // Hide all product fields
    ['g6-fields','f5-fields','s6-fields','f6-fields','f4-fields'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // Show only the selected product line fields
    const showId = productLine.toLowerCase() + '-fields';
    const showEl = document.getElementById(showId);
    if (showEl) showEl.style.display = '';
}

window.addEventListener('DOMContentLoaded', function() {
    Object.values(scalableConfig).flat().forEach(field => {
        const el = document.getElementById(field.id);
        if (el) {
            el.addEventListener('change', updatePartNumberInputScalable);
        }
    });
    const productLineSelect = document.getElementById('productLine');
    if (productLineSelect) {
        productLineSelect.addEventListener('change', function() {
            const productLine = this.value;
            showFieldsForProductLine(productLine);
            updatePartNumberInputScalable();
            updateInputsFromPartNumberInput();
            updateFooterProductLine();
        });
    }
    // Initial display
    showFieldsForProductLine(productLineSelect.value);
    document.getElementById('decodeInput').addEventListener('input', updateInputsFromPartNumberInput);
    updatePartNumberInputScalable();
    updateInputsFromPartNumberInput();
    updateFooterProductLine();
});