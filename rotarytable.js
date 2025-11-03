function findClosestRotaryTableMotor() {
  const resultsDiv = document.getElementById("results");
  
  // Get values with proper unit conversion where applicable
  const rotationalMoveDistance = parseFloat(document.getElementById("rotationalMoveDistance").value);
  const totalMoveTime = parseFloat(document.getElementById("totalMoveTime").value);
  const accelTime = parseFloat(document.getElementById("accelTime").value);
  const decelTime = parseFloat(document.getElementById("decelTime").value);
  const gearboxRatioRotary = parseFloat(document.getElementById("gearboxRatioRotary").value);
  const massIndexTable = getValueWithUnit ? (getValueWithUnit("massIndexTable") || parseFloat(document.getElementById("massIndexTable").value)) : parseFloat(document.getElementById("massIndexTable").value);
  const radiusIndexTable = getValueWithUnit ? (getValueWithUnit("radiusIndexTable") || parseFloat(document.getElementById("radiusIndexTable").value)) : parseFloat(document.getElementById("radiusIndexTable").value);
  const loadInertia = getValueWithUnit ? (getValueWithUnit("loadInertia") || parseFloat(document.getElementById("loadInertia").value)) : parseFloat(document.getElementById("loadInertia").value);
  const frictionTorque = getValueWithUnit ? (getValueWithUnit("frictionTorque") || parseFloat(document.getElementById("frictionTorque").value)) : parseFloat(document.getElementById("frictionTorque").value);
  const dwellTime = parseFloat(document.getElementById("dwellTime").value);
  const motorInertia = getValueWithUnit ? (getValueWithUnit("motorInertia") || parseFloat(document.getElementById("motorInertia").value)) : parseFloat(document.getElementById("motorInertia").value);
  const gearboxInertia = getValueWithUnit ? (getValueWithUnit("gearboxInertia") || parseFloat(document.getElementById("gearboxInertia").value)) : parseFloat(document.getElementById("gearboxInertia").value);
  const brakeInertia = getValueWithUnit ? (getValueWithUnit("brakeInertia") || parseFloat(document.getElementById("brakeInertia").value)) : parseFloat(document.getElementById("brakeInertia").value);
  console.log("Rotary Table inputs (converted):", { 
    rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatioRotary,
    massIndexTable, radiusIndexTable, loadInertia, frictionTorque, dwellTime,
    motorInertia, gearboxInertia, brakeInertia
  });
  
  const maxAngularSpeed = rotarytableformulas.maxangularspeed(
    rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatioRotary);
  const maxRotationalSpeed = rotarytableformulas.maxrotationalspeed(
    maxAngularSpeed, gearboxRatioRotary);
  const motorAcceleration = rotarytableformulas.motoracceleration(
    maxAngularSpeed, accelTime, gearboxRatioRotary);
  const motorDeceleration = rotarytableformulas.motordeceleration(
    maxAngularSpeed, decelTime, gearboxRatioRotary);

  const rotaryTableInertia = rotarytableformulas.rotaryTableInertia(
    massIndexTable, radiusIndexTable);
  const reflectedInertia = rotarytableformulas.reflectedInertia(
    rotaryTableInertia, loadInertia, gearboxRatioRotary);

  const torqueConstantFriction = rotarytableformulas.torqueConstantFriction(
    frictionTorque, gearboxRatioRotary);
  const torqueRequiredAcceleration = rotarytableformulas.torqueRequiredAcceleration(
    reflectedInertia, motorInertia, gearboxInertia, brakeInertia, motorAcceleration, torqueConstantFriction);
  const torqueRequiredDeceleration = rotarytableformulas.torqueRequiredDeceleration(
    reflectedInertia, motorInertia, gearboxInertia, brakeInertia, motorDeceleration, torqueConstantFriction);
  const torqueRequiredConstantSpeed = rotarytableformulas.torqueRequiredConstantSpeed(
    torqueConstantFriction);
  const constantRunTime = rotarytableformulas.constantRunTime(
    totalMoveTime, accelTime, decelTime);
  const torqueRmsMotor = rotarytableformulas.torqueRmsMotor(
    torqueRequiredAcceleration, torqueRequiredDeceleration, torqueRequiredConstantSpeed,
    accelTime, decelTime, constantRunTime, totalMoveTime, dwellTime);


  // Get selected result units from stored preferences (with fallbacks)
  const torqueUnit = window.selectedResultUnits?.torque || "Nm";
  const inertiaUnit = window.selectedResultUnits?.inertia || "kg·m²";

  // Convert power, torque, and force results to selected units

  // Use standardized results display
  const outputs = {
    "(1) Maximum Angular Speed": `${maxAngularSpeed.toFixed(2)} rad/s`,
    "(2) Maximum Motor Rotational Speed": `${maxRotationalSpeed.toFixed(2)} RPM`,
    [`(3) Rotary Table Inertia (${inertiaUnit})`]: parseFloat(convertResultValue(rotaryTableInertia, 'inertia', inertiaUnit).toFixed(2)),
    [`(4) Inertia Reflected to Motor (${inertiaUnit})`]: parseFloat(convertResultValue(reflectedInertia, 'inertia', inertiaUnit).toFixed(2)),
    [`(5) Constant Speed Torque (${torqueUnit})`]: parseFloat(convertResultValue(torqueRequiredConstantSpeed, 'torque', torqueUnit).toFixed(2)),
    [`(6) Acceleration Torque (${torqueUnit})`]: parseFloat(convertResultValue(torqueRequiredAcceleration, 'torque', torqueUnit).toFixed(2)),
    [`Deceleration Torque (${torqueUnit})`]: parseFloat(convertResultValue(torqueRequiredDeceleration, 'torque', torqueUnit).toFixed(2)),
    [`(7) Calculated RMS Torque (${torqueUnit})`]: parseFloat(convertResultValue(torqueRmsMotor, 'torque', torqueUnit).toFixed(2)),
    
  };
  displayStandardResults(outputs);
}