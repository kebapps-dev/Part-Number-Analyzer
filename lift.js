function findClosestLiftMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion
  const loadWeight = getValueWithUnit ? (getValueWithUnit("loadWeight") || parseFloat(document.getElementById("loadWeight").value)) : parseFloat(document.getElementById("loadWeight").value);
  const maxSpeed = getValueWithUnit ? (getValueWithUnit("maxSpeed") || parseFloat(document.getElementById("maxSpeed").value)) : parseFloat(document.getElementById("maxSpeed").value);
  const drumDiameter = getValueWithUnit ? (getValueWithUnit("drumDiameter") || parseFloat(document.getElementById("drumDiameter").value)) : parseFloat(document.getElementById("drumDiameter").value);
  const gearboxRatioLift = parseFloat(document.getElementById("gearboxRatioLift").value);
  const accelDecelTime = parseFloat(document.getElementById("accelDecelTime").value);
  const motorEfficiencyPercent = parseFloat(document.getElementById("motorEfficiencyPercent").value) / 100.0;
  const safetyFactor = parseFloat(document.getElementById("safetyFactor").value);

  console.log("Lift inputs (converted):", { loadWeight, maxSpeed, drumDiameter, gearboxRatioLift, accelDecelTime });
  
  const forceGravity = formulas.forcegravity(loadWeight);
  const gearboxOutputSpeed = formulas.rotationalspeed(maxSpeed, drumDiameter);
  const motorSpeed = gearboxOutputSpeed * gearboxRatioLift;
  const loadRequiredTorque = formulas.drumtorque(forceGravity, drumDiameter);
  const loadRequiredPeakTorque = formulas.peakdrumtorque(
    forceGravity,
    drumDiameter,
    loadWeight,
    formulas.peakacceleration(maxSpeed, accelDecelTime)
  );

  //motor specs (apply safety factor and efficiency)
  const motorRequiredTorque = (loadRequiredTorque / gearboxRatioLift) * safetyFactor;
  const motorRequiredPeakTorque = (loadRequiredPeakTorque / gearboxRatioLift) * safetyFactor;
  // Power required at the shaft (with safety factor)
  const shaftPowerKw = formulas.motorpowerkw(loadRequiredTorque * safetyFactor, gearboxOutputSpeed);
  // Actual required input power to the motor (account for efficiency)
  const requiredMotorPowerKw = shaftPowerKw / motorEfficiencyPercent;

  // Get selected result units from stored preferences
  const powerUnit = window.selectedResultUnits?.power || "kW";
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";

  // Convert kW values to watts (base unit) for convertResultValue function
  const requiredMotorPowerWatts = requiredMotorPowerKw * 1000; // Convert kW to W

  // Create outputs with unit-convertible results (include units in key names for inline dropdowns)
  const outputs = {
    "(1) Motor Speed": `${motorSpeed.toFixed(2)} RPM`,
    [`(2) Motor Required Torque`]: parseFloat(convertResultValue(motorRequiredTorque, 'torque', torqueUnit).toFixed(3)),
    [`(3) Motor Required Peak Torque`]: parseFloat(convertResultValue(motorRequiredPeakTorque, 'torque', torqueUnit).toFixed(3)),
    [`(4) Motor Required Power`]: parseFloat(convertResultValue(requiredMotorPowerWatts, 'power', powerUnit).toFixed(3)),
    "Gearbox Output Speed": `${gearboxOutputSpeed.toFixed(2)} RPM`,
    [`Gearbox Required Torque`]: parseFloat(convertResultValue(loadRequiredTorque, 'torque', torqueUnit).toFixed(3)),
    [`Gearbox Required Peak Torque`]: parseFloat(convertResultValue(loadRequiredPeakTorque, 'torque', torqueUnit).toFixed(3)),
  };
  
  displayStandardResults(outputs);

}

  