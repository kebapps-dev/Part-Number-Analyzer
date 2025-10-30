
    // Brusatori
    const brusatoriInput = document.getElementById('brusatori-identifier');
    const brusatoriResultDiv = document.getElementById('brusatori-code-result');
    const brusatoriRatedMatNoDiv = document.getElementById('brusatori-rated-matno-result');
    const brusatoriCmatTypeCodeDiv = document.getElementById('brusatori-cmat-type-code-result');
    const brusatoriConfigurableOptionsDiv = document.getElementById('brusatori-configurable-options-result');
    const brusatoriCheckboxesContainer = document.getElementById('brusatori-checkboxes-container');
    const brusatoriWithfeatherkey = document.getElementById('brusatori-withfeatherkey');
    const brusatoriWithbrake = document.getElementById('brusatori-withbrake');
    const brusatoriEncoder = document.getElementById('brusatori-encoder');
    const brusatoriAdditionaloptions = document.getElementById('brusatori-additionaloptions');

    function updateBrusatoriOutputs() {
        const matNo = brusatoriInput.value;
        const identifier = getIdentifierBrusatori(matNo);

        // Show checkboxes if input is not empty
        brusatoriCheckboxesContainer.style.display = matNo ? "block" : "none";

        if (identifier === "NOT VALID") {
            brusatoriResultDiv.textContent = "NOT VALID";
            brusatoriRatedMatNoDiv.textContent = "";
            brusatoriCmatTypeCodeDiv.textContent = "";
            brusatoriConfigurableOptionsDiv.textContent = "";
        } else {
            brusatoriResultDiv.textContent = identifier;
            brusatoriRatedMatNoDiv.textContent = getRatedMaterialNumberBrusatori(matNo);
            brusatoriCmatTypeCodeDiv.textContent = "00SM000-CMAT";
            brusatoriConfigurableOptionsDiv.textContent = getConfigurableOptions(
                "brusatori",
                brusatoriWithfeatherkey,
                brusatoriWithbrake,
                brusatoriEncoder,
                brusatoriAdditionaloptions
            );
        }
    }

    brusatoriInput.addEventListener('input', updateBrusatoriOutputs);
    brusatoriWithfeatherkey.addEventListener('change', updateBrusatoriOutputs);
    brusatoriWithbrake.addEventListener('change', updateBrusatoriOutputs);
    brusatoriEncoder.addEventListener('change', updateBrusatoriOutputs);
    brusatoriAdditionaloptions.addEventListener('change', updateBrusatoriOutputs);

    // KEB
    //const kebInput = document.getElementById('keb-identifier');
    const kebModel = document.getElementById('keb-input-model');
    const kebSize = document.getElementById('keb-input-size');
    const kebLength = document.getElementById('keb-input-length');
    const kebCooling = document.getElementById('keb-input-cooling');
    const kebSpeed = document.getElementById('keb-input-speed');
    const kebResultDiv = document.getElementById('keb-code-result');
    const kebRatedMatNoDiv = document.getElementById('keb-rated-matno-result');
    const kebCmatTypeCodeDiv = document.getElementById('keb-cmat-type-code-result');
    const kebConfigurableOptionsDiv = document.getElementById('keb-configurable-options-result');
    const kebCheckboxesContainer = document.getElementById('keb-checkboxes-container');
    const kebWithfeatherkey = document.getElementById('keb-withfeatherkey');
    const kebWithbrake = document.getElementById('keb-withbrake');
    const kebEncoder = document.getElementById('keb-encoder');
    const kebAdditionaloptions = document.getElementById('keb-additionaloptions');

    function updateKebOutputs() {
        //const matNo = kebInput.value;
        const identifier = getIdentifierKEB(
            kebModel.value,
            kebSize.value,
            kebLength.value,
            kebCooling.value,
            kebSpeed.value
        );

        // Show checkboxes if input is not empty
        kebCheckboxesContainer.style.display =  "block";

        if (identifier === "NOT VALID") {
            kebResultDiv.textContent = "NOT VALID";
            kebRatedMatNoDiv.textContent = "";
            kebCmatTypeCodeDiv.textContent = "";
            kebConfigurableOptionsDiv.textContent = "";
        } else {
            kebResultDiv.textContent = identifier;
            kebRatedMatNoDiv.textContent = getRatedMaterialNumberKEB(kebSize.value,kebLength.value,);
            kebCmatTypeCodeDiv.textContent = "00SM000-CMAT";
            kebConfigurableOptionsDiv.textContent = getConfigurableOptions(
                "keb",
                kebWithfeatherkey,
                kebWithbrake,
                kebEncoder,
                kebAdditionaloptions
            );
        }
    }

    //kebInput.addEventListener('input', updateKebOutputs);
    kebModel.addEventListener('change', updateKebOutputs);
    kebSize.addEventListener('change', updateKebOutputs);
    kebLength.addEventListener('change', updateKebOutputs);
    kebCooling.addEventListener('change', updateKebOutputs);
    kebSpeed.addEventListener('change', updateKebOutputs);
    kebWithfeatherkey.addEventListener('change', updateKebOutputs);
    kebWithbrake.addEventListener('change', updateKebOutputs);
    kebEncoder.addEventListener('change', updateKebOutputs);
    kebAdditionaloptions.addEventListener('change', updateKebOutputs);

    window.addEventListener('DOMContentLoaded', function() {
        // ...existing code...
        updateKebOutputs();
        updateBrusatoriOutputs();
    });
//     // Add this function to load and parse the CSV, and update the datalist
// function loadKebSuggestions() {
//     fetch('dl4motors.csv')
//         .then(response => response.text())
//         .then(text => {
//             const lines = text.split('\n');
//             const datalist = document.getElementById('keb-identifier-suggestions');
//             datalist.innerHTML = '';
//             lines.forEach(line => {
//                 const value = line.trim();
//                 if (value) {
//                     const option = document.createElement('option');
//                     option.value = value;
//                     datalist.appendChild(option);
//                 }
//             });
//         });
// }

// // Call this once on page load
// window.addEventListener('DOMContentLoaded', loadKebSuggestions);

function getCode1(matNo) {
    if (matNo && matNo.charAt(0) === "0") {
        return "CS";
    } else if (matNo && matNo.charAt(0).toUpperCase() === "V") {
        return "CF";
    } else {
        return "";
    }
}

function getCode2(matNo) {
    if (!matNo) return "";
    // Remove the first occurrence of a single quote
    const cleaned = matNo.replace("'", "");
    const char = cleaned.charAt(1);
    if (char === "7") {
        return "SE";
    } else if (char === "8") {
        return "SF";
    } else if (char === "9") {
        return "SG";
    } else {
        return "";
    }
}

function getCode3(matNo) {
    if (!matNo) return "";
    // Remove the first occurrence of a single quote
    const cleaned = matNo.replace("'", "");
    const char = cleaned.charAt(2);
    switch (char) {
        case "1":
            return "L1";
        case "2":
            return "L2";
        case "3":
            return "L3";
        case "4":
            return "L4";
        case "5":
            return "L5";
        case "6":
            return "L6";
        case "7":
            return "L7";
        case "8":
            return "L8";
        default:
            return "";
    }
}

function getCode4(matNo) {
    if (!matNo) return "";
    // Remove the first occurrence of a single quote
    const cleaned = matNo.replace("'", "");
    const chars = cleaned.substr(3, 2); // 4th and 5th characters (0-based index)
    switch (chars) {
        case "10":
            return "SP10";
        case "15":
            return "SP15";
        case "20":
            return "SP20";
        case "28":
            return "SP30";
        case "30":
            return "SP30";
        default:
            return "";
    }
}

function getCode5(matNo) {
    if (!matNo) return "";
    // Remove the first occurrence of a single quote
    const cleaned = matNo.replace("'", "");
    const char = cleaned.charAt(5); // 6th character (0-based index)
    if (char === "4") {
        return "V4";
    } else {
        return "";
    }
}

function getRatedMaterialNumberBrusatori(matNo) {
    if (!matNo) return "";
    // Remove the first occurrence of a single quote
    const cleaned = matNo.replace("'", "");
    // M10 = code3, M9 = code2
    const m10 = getCode3(matNo);
    const m9 = getCode2(matNo);
    // Get the second character of each code (index 1)
    const m10Char = m10.length > 1 ? m10.charAt(1) : "";
    const m9Char = m9.length > 1 ? m9.charAt(1) : "";
    if (!m10Char || !m9Char) return "";
    return `CMSM4${m10Char}${m9Char}-xxxx`;
}

function getRatedMaterialNumberKEB(kebSize, kebLength) {
    if (!kebSize || !kebLength) return "";
    // Get the second character of each input (index 1)
    const sizeChar = kebSize.length > 1 ? kebSize.charAt(1) : "";
    const lengthChar = kebLength.length > 1 ? kebLength.charAt(1) : "";
    if (!sizeChar || !lengthChar) return "";
    return `CMSM4${lengthChar}${sizeChar}-xxxx`;
}

function getIdentifierBrusatori(matNo) {
    const code1 = getCode1(matNo);
    const code2 = getCode2(matNo);
    const code3 = getCode3(matNo);
    const code4 = getCode4(matNo);
    const code5 = getCode5(matNo);
    if (!code1 || !code2 || !code3 || !code4 || !code5) {
        return "NOT VALID";
    }
    return [code5, code2, code3, code1, code4].join(" ");
}
// function getIdentifierKEB(matNo) {
//     if (!matNo) return "NOT VALID";
//     let chunks;
//     // If matNo contains spaces, dashes, or underscores, split on those
//     if (/[\s\-_]/.test(matNo)) {
//         chunks = matNo.trim().split(/[\s\-_]+/);
//     } else {
//         // No delimiters: use fixed lengths [2,2,2,2,4]
//         if (matNo.length < 12) return "NOT VALID";
//         chunks = [
//             matNo.substr(0, 2),
//             matNo.substr(2, 2),
//             matNo.substr(4, 2),
//             matNo.substr(6, 2),
//             matNo.substr(8, 4)
//         ];
//     }
//     if (chunks.length < 5 || chunks.some(c => !c)) {
//         return "NOT VALID";
//     }
//     // Return the identifier in the same order as entered
//     return chunks.slice(0, 5).join(" ");
// }

function getIdentifierKEB(model, size, length, cooling, speed) { //for individual inputs
    if (!model || !size || !length || !cooling || !speed) {
        return "NOT VALID";
    }
    return [model, size, length, cooling, speed].join(" ");
}

function getConfigurableOptions(inputtype,withfeatherkey, withbrake, encoder, additionaloptions) {
    const options = [];
    let identifiervalue = "";
    // Get the value of the identifier output from index.html and remove spaces
    if(inputtype === "keb") {
        identifierValue = document.getElementById('keb-code-result').textContent || "";
    } else {
        identifierValue = document.getElementById('brusatori-code-result').textContent || "";
    }
    identifierValue = identifierValue.replace(/\s+/g, "");
    options.push(identifierValue);
    options.push("-");

    // Feather key logic
    if (withfeatherkey && withfeatherkey.checked) {
        options.push("FK");
    } else {
        options.push("FKN");
    }
    // With brake logic
    if (withbrake && withbrake.checked) {
        options.push("BR");
    } else {
        options.push("BRN");
    }
    // Encoder logic (4 cases)
    switch (encoder.value) {
        case "resolver":
            options.push("ENC01");
            break;
        case "SRS50":
            options.push("ENC04");
            break;
        case "SRM50":
            options.push("ENC05");
            break;
        case "No encoder":
            options.push("ENC00");
            break;
    }
    // additional options logic (8 cases)
    switch (additionaloptions.value) {
        case "Without":
            options.push("OP00");
            break;
        case "IP65":
            options.push("OP01");
            break;
        case "IM B35":
            options.push("OP02");
            break;
        case "IP65/IM B35":
            options.push("OP03");
            break;
        case "Special Shaft":
            options.push("OP04");
            break;
        case "IP65/Special Shaft":
            options.push("OP05");
            break;
        case "IM B35/Special Shaft":
            options.push("OP06");
            break;
        case "IP65/IM B35/Special Shaft":
            options.push("OP07");
            break;
    }
    return options.join("");
}
