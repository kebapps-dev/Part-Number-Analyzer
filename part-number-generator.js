    function decodeF6(part) {
        // Accept dash before last 4 digits: e.g. 16F6A32-3511
        const dashMatch = part.match(/^(\w{7})-(\w{4})$/);
        let p = part;
        if (dashMatch) p = dashMatch[1] + dashMatch[2];
        if (p.length !== 11) {
            return { error: 'Format error', details: ['F6 part number must be exactly 11 characters (excluding dash)'] };
        }
        // Get allowed values from DOM
        const allowed = {
            'Inverter Size': Array.from(document.getElementById('f6-inverter').options).map(o => o.value),
            'Series': ['F6'],
            'Control Type': Array.from(document.getElementById('f6-control').options).map(o => o.value),
            'Equipment': Array.from(document.getElementById('f6-equipment').options).map(o => o.value),
            'Housing': Array.from(document.getElementById('f6-housing').options).map(o => o.value),
            'Voltage/Connection Type': Array.from(document.getElementById('f6-voltage').options).map(o => o.value),
            'Switching': Array.from(document.getElementById('f6-switching').options).map(o => o.value),
            'Heat Sink': Array.from(document.getElementById('f6-heatsink').options).map(o => o.value),
            'Control Board': Array.from(document.getElementById('f6-board').options).map(o => o.value)
        };
        // Parse fields
        const fields = {
            'Inverter Size': p.slice(0,2),
            'Series': p.slice(2,4),
            'Control Type': p[4],
            'Equipment': p[5],
            'Housing': p[6],
            'Voltage/Connection Type': p[7],
            'Switching': p[8],
            'Heat Sink': p[9],
            'Control Board': p[10]
        };
        let issues = [];
        if (!allowed['Inverter Size'].includes(fields['Inverter Size'])) issues.push(`Position 1-2: '${fields['Inverter Size']}' not allowed`);
        if (!allowed['Series'].includes(fields['Series'])) issues.push(`Position 3-4: '${fields['Series']}' not allowed`);
        if (!allowed['Control Type'].includes(fields['Control Type'])) issues.push(`Position 5: '${fields['Control Type']}' not allowed`);
        if (!allowed['Equipment'].includes(fields['Equipment'])) issues.push(`Position 6: '${fields['Equipment']}' not allowed`);
        if (!allowed['Housing'].includes(fields['Housing'])) issues.push(`Position 7: '${fields['Housing']}' not allowed`);
        if (!allowed['Voltage/Connection Type'].includes(fields['Voltage/Connection Type'])) issues.push(`Position 8: '${fields['Voltage/Connection Type']}' not allowed`);
        if (!allowed['Switching'].includes(fields['Switching'])) issues.push(`Position 9: '${fields['Switching']}' not allowed`);
        if (!allowed['Heat Sink'].includes(fields['Heat Sink'])) issues.push(`Position 10: '${fields['Heat Sink']}' not allowed`);
        if (!allowed['Control Board'].includes(fields['Control Board'])) issues.push(`Position 11: '${fields['Control Board']}' not allowed`);
        if (issues.length) {
            return { error: 'Format error', details: issues };
        }
        return fields;
    }
// Show/hide product line fields and part number decoding logic
document.addEventListener('DOMContentLoaded', function() {
    const productLineSelect = document.getElementById('productLine');
    const g6Fields = document.getElementById('g6-fields');
    const f5Fields = document.getElementById('f5-fields');
    const s6Fields = document.getElementById('s6-fields');
    const f6Fields = document.getElementById('f6-fields');

    function updateFields() {
        const val = productLineSelect.value;
        if (val === 'G6') {
            g6Fields.style.display = '';
            f5Fields.style.display = 'none';
            s6Fields.style.display = 'none';
            f6Fields.style.display = 'none';
        } else if (val === 'F5') {
            g6Fields.style.display = 'none';
            f5Fields.style.display = '';
            s6Fields.style.display = 'none';
            f6Fields.style.display = 'none';
        } else if (val === 'S6') {
            g6Fields.style.display = 'none';
            f5Fields.style.display = 'none';
            s6Fields.style.display = '';
            f6Fields.style.display = 'none';
        } else if (val === 'F6') {
            g6Fields.style.display = 'none';
            f5Fields.style.display = 'none';
            s6Fields.style.display = 'none';
            f6Fields.style.display = '';
        } else {
            g6Fields.style.display = 'none';
            f5Fields.style.display = 'none';
            s6Fields.style.display = 'none';
            f6Fields.style.display = 'none';
        }
    }
    productLineSelect.addEventListener('change', updateFields);
    updateFields();

    // Part number decoding logic
    const decodeBtn = document.getElementById('decodeBtn');
    const decodeInput = document.getElementById('decodeInput');
    const decodeResult = document.getElementById('decodeResult');

    function decodeG6(part) {
        const dashMatch = part.match(/^(\w{7})-(\w{4})$/);
        let p = part;
        if (dashMatch) p = dashMatch[1] + dashMatch[2];
        if (p.length !== 11) {
            return { error: 'Format error', details: ['Part number must be exactly 11 characters (excluding dash)'] };
        }
        // Get allowed values from DOM
        const allowed = {
            'Inverter Size': Array.from(document.getElementById('power').options).map(o => o.value),
            'Series': ['G6'],
            'Control Type': Array.from(document.getElementById('control').options).map(o => o.value),
            'Equipment': Array.from(document.getElementById('emi').options).map(o => o.value),
            'Housing': Array.from(document.getElementById('housing').options).map(o => o.value),
            'Voltage/Connection': Array.from(document.getElementById('voltage').options).map(o => o.value),
            'Heat Sink': Array.from(document.getElementById('heatsink').options).map(o => o.value),
            'Switching/Current/Overload': Array.from(document.getElementById('overload').options).map(o => o.value),
            'Extra': [''] // Not validated
        };
        // Parse fields
        const fields = {
            'Inverter Size': p.slice(0,2),
            'Series': p.slice(2,4),
            'Control Type': p[4],
            'Equipment': p[5],
            'Housing': p[6],
            'Voltage/Connection': p[7],
            'Heat Sink': p[8],
            'Switching/Current/Overload': p[9],
            'Extra': p[10]
        };
        let issues = [];
        // Validate each field
        if (!allowed['Inverter Size'].includes(fields['Inverter Size'])) issues.push(`Position 1-2: '${fields['Inverter Size']}' not allowed`);
        if (!allowed['Series'].includes(fields['Series'])) issues.push(`Position 3-4: '${fields['Series']}' not allowed`);
        if (!allowed['Control Type'].includes(fields['Control Type'])) issues.push(`Position 5: '${fields['Control Type']}' not allowed`);
        if (!allowed['Equipment'].includes(fields['Equipment'])) issues.push(`Position 6: '${fields['Equipment']}' not allowed`);
        if (!allowed['Housing'].includes(fields['Housing'])) issues.push(`Position 7: '${fields['Housing']}' not allowed`);
        if (!allowed['Voltage/Connection'].includes(fields['Voltage/Connection'])) issues.push(`Position 8: '${fields['Voltage/Connection']}' not allowed`);
        if (!allowed['Heat Sink'].includes(fields['Heat Sink'])) issues.push(`Position 9: '${fields['Heat Sink']}' not allowed`);
        if (!allowed['Switching/Current/Overload'].includes(fields['Switching/Current/Overload'])) issues.push(`Position 10: '${fields['Switching/Current/Overload']}' not allowed`);
        // Extra is not validated
        if (issues.length) {
            return { error: 'Format error', details: issues };
        }
        return fields;
    }

    function decodeF5(part) {
        const dashMatch = part.match(/^(\w{7})-(\w{4})$/);
        let p = part;
        if (dashMatch) p = dashMatch[1] + dashMatch[2];
        if (p.length !== 11) {
            return { error: 'Format error', details: ['Part number must be exactly 11 characters (excluding dash)'] };
        }
        // Get allowed values from DOM
        const allowed = {
            'Inverter Size': Array.from(document.getElementById('f5-power').options).map(o => o.value),
            'Series': ['F5'],
            'Control Type': Array.from(document.getElementById('f5-control').options).map(o => o.value),
            'Accessory': Array.from(document.getElementById('f5-accessory').options).map(o => o.value),
            'Housing': Array.from(document.getElementById('f5-housing').options).map(o => o.value),
            'Input': Array.from(document.getElementById('f5-voltage').options).map(o => o.value),
            'Cooling': Array.from(document.getElementById('f5-cooling').options).map(o => o.value),
            'Switching/Current/Overload': Array.from(document.getElementById('f5-overload').options).map(o => o.value),
            'Extra': [''] // Not validated
        };
        // Parse fields
        const fields = {
            'Inverter Size': p.slice(0,2),
            'Series': p.slice(2,4),
            'Control Type': p[4],
            'Accessory': p[5],
            'Housing': p[6],
            'Input': p[7],
            'Cooling': p[8],
            'Switching/Current/Overload': p[9],
            'Extra': p[10]
        };
        let issues = [];
        if (!allowed['Inverter Size'].includes(fields['Inverter Size'])) issues.push(`Position 1-2: '${fields['Inverter Size']}' not allowed`);
        if (!allowed['Series'].includes(fields['Series'])) issues.push(`Position 3-4: '${fields['Series']}' not allowed`);
        if (!allowed['Control Type'].includes(fields['Control Type'])) issues.push(`Position 5: '${fields['Control Type']}' not allowed`);
        if (!allowed['Accessory'].includes(fields['Accessory'])) issues.push(`Position 6: '${fields['Accessory']}' not allowed`);
        if (!allowed['Housing'].includes(fields['Housing'])) issues.push(`Position 7: '${fields['Housing']}' not allowed`);
        if (!allowed['Input'].includes(fields['Input'])) issues.push(`Position 8: '${fields['Input']}' not allowed`);
        if (!allowed['Cooling'].includes(fields['Cooling'])) issues.push(`Position 9: '${fields['Cooling']}' not allowed`);
        if (!allowed['Switching/Current/Overload'].includes(fields['Switching/Current/Overload'])) issues.push(`Position 10: '${fields['Switching/Current/Overload']}' not allowed`);
        // Extra is not validated
        if (issues.length) {
            return { error: 'Format error', details: issues };
        }
        return fields;
    }

    function decodeS6(part) {
    // Accept dash before last 4 digits: e.g. 10S6A32-1100
    const dashMatch = part.match(/^(\w{7})-(\w{4})$/);
    let p = part;
    if (dashMatch) p = dashMatch[1] + dashMatch[2];
    // S6: [size][series][control][safety][housing][version][typecontrol][reserved1][reserved2]
    // Example: 10S6A321100 or 10S6A321A00
    let issues = [];
    if (p.length !== 11) {
        return { error: 'Format error', details: ['S6 part number must be exactly 11 characters (excluding dash)'] };
    }
    // Get allowed values from DOM
    const allowed = {
        'Device Size': Array.from(document.getElementById('s6-power').options).map(o => o.value),
        'Series': ['S6'],
        'Control Type': Array.from(document.getElementById('s6-controltype').options).map(o => o.value),
        'Safety Module': Array.from(document.getElementById('s6-safetymodule').options).map(o => o.value),
        'Housing': Array.from(document.getElementById('s6-housing').options).map(o => o.value),
        'Version Power Unit': Array.from(document.getElementById('s6-version').options).map(o => o.value),
        'Type of Control': Array.from(document.getElementById('s6-typecontrol').options).map(o => o.value),
        'Reserved1': Array.from(document.getElementById('s6-reserved1').options).map(o => o.value),
        'Reserved2': Array.from(document.getElementById('s6-reserved2').options).map(o => o.value)
    };
    // Parse fields
    const fields = {
        'Device Size': p.slice(0,2),
        'Series': p.slice(2,4),
        'Control Type': p[4],
        'Safety Module': p[5],
        'Housing': p[6],
        'Version Power Unit': p[7],
        'Type of Control': p[8],
        'Reserved1': p[9],
        'Reserved2': p[10]
    };
    // Validate each field
    if (!allowed['Device Size'].includes(fields['Device Size'])) issues.push(`Position 1-2: '${fields['Device Size']}' not allowed`);
    if (!allowed['Series'].includes(fields['Series'])) issues.push(`Position 3-4: '${fields['Series']}' not allowed`);
    if (!allowed['Control Type'].includes(fields['Control Type'])) issues.push(`Position 5: '${fields['Control Type']}' not allowed`);
    if (!allowed['Safety Module'].includes(fields['Safety Module'])) issues.push(`Position 6: '${fields['Safety Module']}' not allowed`);
    if (!allowed['Housing'].includes(fields['Housing'])) issues.push(`Position 7: '${fields['Housing']}' not allowed`);
    if (!allowed['Version Power Unit'].includes(fields['Version Power Unit'])) issues.push(`Position 8: '${fields['Version Power Unit']}' not allowed`);
    if (!allowed['Type of Control'].includes(fields['Type of Control'])) issues.push(`Position 9: '${fields['Type of Control']}' not allowed`);
    if (!allowed['Reserved1'].includes(fields['Reserved1'])) issues.push(`Position 10: '${fields['Reserved1']}' not allowed`);
    if (!allowed['Reserved2'].includes(fields['Reserved2'])) issues.push(`Position 11: '${fields['Reserved2']}' not allowed`);
    if (issues.length) {
        return { error: 'Format error', details: issues };
    }
    return fields;
    }

    decodeBtn.addEventListener('click', function() {
        // Always force uppercase for decoding
        decodeInput.value = decodeInput.value.toUpperCase();
        const val = decodeInput.value.trim();
        let config = null;
        let type = null;
        if (val.includes('G6')) {
            config = decodeG6(val);
            type = 'G6';
        } else if (val.includes('F5')) {
            config = decodeF5(val);
            type = 'F5';
        } else if (val.includes('S6')) {
            config = decodeS6(val);
            type = 'S6';
        } else if (val.includes('F6')) {
            config = decodeF6(val);
            type = 'F6';
        }
        if (config && !config.error) {
            decodeResult.style.display = 'none';
            if (type === 'G6') {
                document.getElementById('productLine').value = 'G6';
                document.getElementById('power').value = config['Inverter Size'];
                document.getElementById('voltage').value = config['Voltage/Connection'];
                document.getElementById('housing').value = config['Housing'];
                document.getElementById('emi').value = config['Equipment'];
                document.getElementById('heatsink').value = config['Heat Sink'];
                document.getElementById('overload').value = config['Switching/Current/Overload'];
                document.getElementById('control').value = config['Control Type'];
                g6Fields.style.display = '';
                f5Fields.style.display = 'none';
                s6Fields.style.display = 'none';
                f6Fields.style.display = 'none';
            } else if (type === 'F5') {
                document.getElementById('productLine').value = 'F5';
                document.getElementById('f5-power').value = config['Inverter Size'];
                document.getElementById('f5-voltage').value = config['Input'];
                document.getElementById('f5-housing').value = config['Housing'];
                document.getElementById('f5-accessory').value = config['Accessory'];
                document.getElementById('f5-cooling').value = config['Cooling'];
                document.getElementById('f5-overload').value = config['Switching/Current/Overload'];
                document.getElementById('f5-control').value = config['Control Type'];
                g6Fields.style.display = 'none';
                f5Fields.style.display = '';
                s6Fields.style.display = 'none';
                f6Fields.style.display = 'none';
            } else if (type === 'S6') {
                document.getElementById('productLine').value = 'S6';
                document.getElementById('s6-power').value = config['Device Size'];
                document.getElementById('s6-controltype').value = config['Control Type'];
                document.getElementById('s6-safetymodule').value = config['Safety Module'];
                document.getElementById('s6-housing').value = config['Housing'];
                document.getElementById('s6-version').value = config['Version Power Unit'];
                document.getElementById('s6-typecontrol').value = config['Type of Control'];
                document.getElementById('s6-reserved1').value = config['Reserved1'];
                document.getElementById('s6-reserved2').value = config['Reserved2'];
                g6Fields.style.display = 'none';
                f5Fields.style.display = 'none';
                s6Fields.style.display = '';
                f6Fields.style.display = 'none';
            } else if (type === 'F6') {
                document.getElementById('productLine').value = 'F6';
                document.getElementById('f6-inverter').value = config['Inverter Size'];
                document.getElementById('f6-series').value = config['Series'];
                document.getElementById('f6-control').value = config['Control Type'];
                document.getElementById('f6-equipment').value = config['Equipment'];
                document.getElementById('f6-housing').value = config['Housing'];
                document.getElementById('f6-voltage').value = config['Voltage/Connection Type'];
                document.getElementById('f6-switching').value = config['Switching'];
                document.getElementById('f6-heatsink').value = config['Heat Sink'];
                document.getElementById('f6-board').value = config['Control Board'];
                g6Fields.style.display = 'none';
                f5Fields.style.display = 'none';
                s6Fields.style.display = 'none';
                f6Fields.style.display = '';
            }
        } else if (config && config.error) {
            decodeResult.style.display = '';
            decodeResult.innerHTML = 'Could not decode part number. Issues found:<br>' + config.details.map(d => '- ' + d).join('<br>');
        } else {
            decodeResult.style.display = '';
            decodeResult.textContent = 'Could not decode part number. Please check the format.';
        }
    });
});// part-number-generator.js
// Calculates the part number based on selected options from the form

// Map of which fields are valid for each product line (or other config)
const partNumberConfig = {
    S6: ['productLine', 'voltage', 'power', 'type', 'emi', 'housing', 'gtr7', 'heatsink', 'overload', 'control', 'safety'],
    F6: ['productLine', 'voltage', 'power', 'type', 'emi', 'housing', 'gtr7', 'heatsink', 'overload', 'control', 'safety'],
    G6: ['productLine', 'voltage', 'power', 'type', 'emi', 'housing', 'gtr7', 'heatsink', 'overload', 'control', 'safety'],
    // Add more product lines/configs as needed, and remove fields that are not valid for them
};

function generatePartNumber(options) {
    // First part: (two digit size)(product line)(control letter)(safety one number code)(housing size)
    let controlLetter = options.control ? options.control.charAt(0).toUpperCase() : '';
    let safetyCode = '';
    if (options.safety) {
        const match = options.safety.match(/\d+/);
        safetyCode = match ? match[0] : options.safety;
    }
    const firstPart = options.power + options.productLine + controlLetter + safetyCode + options.housing;

    // Second part: (internal filter option 1 or 0)(control type 1 letter)(heatsink type)(overload characteristic)
    // Internal filter: 1 = Internal EMI Filter, 0 = No Internal EMI Filter
    let emiCode = '';
    if (options.emi) {
        emiCode = (options.emi === 'internal') ? '1' : '0';
    }
    // Control type: first letter (already extracted above as controlLetter)
    // Heatsink type: use as-is
    // Overload characteristic: use as-is
    const secondPart = emiCode + controlLetter + (options.heatsink || '') + (options.overload || '');

    return firstPart + '-' + secondPart;
}

// Attach event listener after DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partForm');
    const resultDiv = document.getElementById('result');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const options = {
            productLine: document.getElementById('productLine').value,
            voltage: document.getElementById('voltage').value,
            power: document.getElementById('power').value,
            type: document.getElementById('type').value,
            emi: document.getElementById('emi').value,
            housing: document.getElementById('housing').value,
            gtr7: document.getElementById('gtr7').value,
            heatsink: document.getElementById('heatsink').value,
            overload: document.getElementById('overload').value,
            control: document.getElementById('control').value,
            safety: document.getElementById('safety').value
        };
    const partNumber = generatePartNumber(options);
    resultDiv.style.display = 'block';
    resultDiv.textContent = 'Generated Part Number: ' + partNumber;
    });
});
