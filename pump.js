// Pump calculation engine - follows Generic Rotary standard pattern
// No CSV loading, pure calculations using formulas.js

function findClosestPumpMotor() {
  const resultsDiv = document.getElementById("results");
  
  console.log("findClosestPumpMotor called");
  
  // Check if all required input elements exist
  const requiredInputs = ["boreDiameter", "rodDiameter", "strokeLength", "clampPressure", "timeOfStroke", "rpm", "safetyFactor"];
  for (const inputId of requiredInputs) {
    const element = document.getElementById(inputId);
    if (!element) {
      console.error(`Missing input element: ${inputId}`);
      resultsDiv.innerHTML = `<p>Error: Missing input field ${inputId}. Please check the application setup.</p>`;
      return;
    }
  }
  
  // Get values with unit conversion where applicable
  const boreDiameter = getValueWithUnit ? (getValueWithUnit("boreDiameter") || parseFloat(document.getElementById("boreDiameter").value)) : parseFloat(document.getElementById("boreDiameter").value);
  const rodDiameter = getValueWithUnit ? (getValueWithUnit("rodDiameter") || parseFloat(document.getElementById("rodDiameter").value)) : parseFloat(document.getElementById("rodDiameter").value);
  const strokeLength = getValueWithUnit ? (getValueWithUnit("strokeLength") || parseFloat(document.getElementById("strokeLength").value)) : parseFloat(document.getElementById("strokeLength").value);
  const clampPressure = getValueWithUnit ? (getValueWithUnit("clampPressure") || parseFloat(document.getElementById("clampPressure").value)) : parseFloat(document.getElementById("clampPressure").value);
  const timeOfStroke = parseFloat(document.getElementById("timeOfStroke").value);
  const rpm = getValueWithUnit ? (getValueWithUnit("rpm") || parseFloat(document.getElementById("rpm").value)) : parseFloat(document.getElementById("rpm").value);
  const motorEfficiencyPercent = parseFloat(document.getElementById("motorEfficiency").value) / 100.0;
  const safetyFactor = parseFloat(document.getElementById("safetyFactor").value);
  
  console.log("Input values:", { boreDiameter, rodDiameter, strokeLength, clampPressure, rpm, timeOfStroke, safetyFactor });
  
  // Check if formulas object exists
  if (typeof formulas === 'undefined') {
    console.error("Formulas object not found");
    resultsDiv.innerHTML = "<p>Error: Formulas not loaded. Please check if formulas.js is loaded.</p>";
    return;
  }
  
  const pumpResults = sizePumpMotor({
    boreDiameter,
    rodDiameter,
    strokeLength,
    clampPressure,
    timeOfStroke,
    rpm,
    safetyFactor,
    motorEfficiencyPercent
  });

  // Validate results
  if (isNaN(parseFloat(pumpResults.pumpDisplacement))) {
    resultsDiv.innerHTML = "<p>Please enter valid numbers for all pump inputs.</p>";
    return;
  }

  // Get selected result units from stored preferences (with fallbacks)
  const powerUnit = window.selectedResultUnits?.power || "kW";
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";
  const flowUnit = window.selectedResultUnits?.flow || "L/min";
  const forceUnit = window.selectedResultUnits?.force || "kN";
  // Convert power and torque results to selected units
  const motorPowerDisplay = convertResultValue(pumpResults.motorPower, 'power', powerUnit);
  const motorTorqueDisplay = convertResultValue(pumpResults.motorTorqueWithSafety, 'torque', torqueUnit);
  const flowRateDisplay = convertResultValue(pumpResults.flowRate, 'flow', flowUnit);
  const clampingForceDisplay = convertResultValue(pumpResults.clampingForce, 'force', forceUnit);

  // Use standardized results display with converted values and units
  const outputs = {
    // "Clamp Area": pumpResults.clampArea,
    // "Clamp Volume": pumpResults.clampVolume,
    [`(1) Flow Rate Required (${flowUnit})`]: parseFloat(flowRateDisplay.toFixed(3)),
    "(2) Pump Displacement Required": parseFloat(pumpResults.pumpDisplacement.toFixed(2)) + ' cc/rev',
    [`(3) Clamping Force (${forceUnit})`]: parseFloat(clampingForceDisplay.toFixed(3)),
    // "Motor Torque Required": pumpResults.motorTorque,
    // "Motor Speed Required": pumpResults.motorSpeed,
    [`(4) Motor Required Torque (${torqueUnit})`]: parseFloat(motorTorqueDisplay.toFixed(3)),
    "Motor Required Speed": parseFloat(pumpResults.motorSpeedWithSafety.toFixed(0)) + ' RPM',
    [`(5) Required Motor Power (${powerUnit})`]: parseFloat(motorPowerDisplay.toFixed(3))
  };
  displayStandardResults(outputs);
}

function sizePumpMotor(params) {
  const {
    boreDiameter,        // converted to base units
    rodDiameter,         // converted to base units  
    strokeLength,        // converted to base units
    clampPressure,       // converted to base units
    timeOfStroke,        // seconds
    rpm,                 // RPM
    safetyFactor,         // multiplier (e.g., 1.5 for 50% margin)
    motorEfficiencyPercent //%
  } = params;

  // Calculate using formulas from formulas.js
  const clampArea = formulas.clamparea(boreDiameter, rodDiameter);
  const clampVolume = formulas.clampvolume(clampArea, strokeLength); // Fixed: correct parameter order
  const flowRate = formulas.pumpflowrate(timeOfStroke, clampVolume);
  const pumpDisplacement = formulas.pumpdisplacement(flowRate, rpm);
  const clampingForce = formulas.pumpclampingforce(clampPressure, clampArea);
  
  // Add debugging to see what values we're getting
  console.log("Pump calculation debug:", {
    boreDiameter, rodDiameter, strokeLength, clampPressure, timeOfStroke, rpm,
    clampArea, clampVolume, flowRate, pumpDisplacement, clampingForce
  });
  
  // Motor calculations
  const motorTorque = formulas.motortorque(pumpDisplacement, clampPressure, motorEfficiencyPercent);
  const motorSpeed = formulas.motorspeed(flowRate, pumpDisplacement, motorEfficiencyPercent);
  
  // Apply safety factor
  const motorTorqueWithSafety = motorTorque * safetyFactor;
  const motorSpeedWithSafety = motorSpeed * safetyFactor;
  
  // Calculate motor power
  const motorPowerWatts = motorTorque * motorSpeed * safetyFactor; // motorSpeedWithSafety already in rad/s


  return {
    clampArea: clampArea,
    clampVolume: clampVolume,
    flowRate: flowRate,
    pumpDisplacement: pumpDisplacement,
    clampingForce: clampingForce,
    motorTorque: motorTorque,
    motorSpeed: motorSpeed,
    motorTorqueWithSafety: motorTorqueWithSafety,
    motorSpeedWithSafety: motorSpeedWithSafety,
    motorPower: motorPowerWatts
  };
}