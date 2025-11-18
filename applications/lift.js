function findClosestLiftMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion
  const loadWeight = getValueWithUnit ? (getValueWithUnit("loadWeight") || parseFloat(document.getElementById("loadWeight").value)) : parseFloat(document.getElementById("loadWeight").value);
  const maxSpeed = getValueWithUnit ? (getValueWithUnit("maxSpeed") || parseFloat(document.getElementById("maxSpeed").value)) : parseFloat(document.getElementById("maxSpeed").value);
  const drumDiameter = getValueWithUnit ? (getValueWithUnit("drumDiameter") || parseFloat(document.getElementById("drumDiameter").value)) : parseFloat(document.getElementById("drumDiameter").value);
  const gearboxRatioLift = parseFloat(document.getElementById("gearboxRatioLift").value);
  const gearboxEfficiencyPercent = parseFloat(document.getElementById("gearboxEfficiencyPercent").value) / 100.0 || 1.0;
  const accelDecelTime = parseFloat(document.getElementById("accelDecelTime").value);
  const motorEfficiencyPercent = parseFloat(document.getElementById("motorEfficiencyPercent").value) / 100.0;
  const safetyFactor = parseFloat(document.getElementById("safetyFactor").value);

  console.log("Lift inputs (converted):", { loadWeight, maxSpeed, drumDiameter, gearboxRatioLift, accelDecelTime });
  
  const forceGravity = liftformulas.forcegravity(loadWeight);
  const gearboxOutputSpeed = liftformulas.rotationalspeed(maxSpeed, drumDiameter); //rad/s
  const motorSpeed = gearboxOutputSpeed * gearboxRatioLift; //rad/s
  const loadRequiredTorque = liftformulas.drumtorque(forceGravity, drumDiameter);
  const loadRequiredPeakTorque = liftformulas.peakdrumtorque(
    drumDiameter,
    loadWeight,
    liftformulas.peakacceleration(maxSpeed, accelDecelTime) //m/s²
  );

  //motor specs (apply safety factor and efficiency)
  // Motor torque without safety factor (torque seen at motor shaft = load torque / gearbox ratio)
  const motorRequiredTorque = (loadRequiredTorque / gearboxRatioLift);
  const motorRequiredPeakTorque = (loadRequiredPeakTorque / gearboxRatioLift);

  // Compute required motor input power using: P_motor_input = (T_load * ω_load * safetyFactor) / (gearboxEfficiency * motorEfficiency)
  // where T_load and ω_load are the torque and angular speed at the gearbox output (drum side).
  // Units: T_load (Nm), ω_load (rad/s) -> numerator in Watts. gearboxEfficiency and motorEfficiency are fractions (0..1).
  const loadPower = loadRequiredTorque * gearboxOutputSpeed; // W (shaft power at gearbox output)
  const requiredMotorPower = (loadPower * safetyFactor) / (gearboxEfficiencyPercent * motorEfficiencyPercent);

  // Also compute the ideal motor shaft power (for reference) and keep motorRequiredTorque values for torque displays
  const motorShaftPowerIdeal = motorRequiredTorque * motorSpeed; // W

  // Get selected result units from stored preferences
  const powerUnit = window.selectedResultUnits?.power || "kW";
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";
  const speedUnit = window.selectedResultUnits?.speed || "RPM";

  // Create outputs with unit-convertible results (include units in key names for inline dropdowns)
  const outputs = {
    [`(1) Motor Speed`]: parseFloat(convertResultValue(motorSpeed, 'speed', speedUnit)).toFixed(2),
    [`(2) Motor Required Torque`]: parseFloat(convertResultValue(motorRequiredTorque, 'torque', torqueUnit)).toFixed(3),
    [`(3) Motor Required Peak Torque`]: parseFloat(convertResultValue(motorRequiredPeakTorque, 'torque', torqueUnit)).toFixed(3),
    [`(4) Motor Required Power`]: parseFloat(convertResultValue(requiredMotorPower, 'power', powerUnit)).toFixed(3),
    // gearboxOutputSpeed is rad/s (base) — convert to RPM for display
    [`Gearbox Output Speed`]: parseFloat(convertResultValue(gearboxOutputSpeed, 'speed', speedUnit)).toFixed(2),
    [`Gearbox Required Torque`]: parseFloat(convertResultValue(loadRequiredTorque, 'torque', torqueUnit)).toFixed(3),
    [`Gearbox Required Peak Torque`]: parseFloat(convertResultValue(loadRequiredPeakTorque, 'torque', torqueUnit)).toFixed(3),
  };
  
  displayStandardResults(outputs);

}

  