const formulas = {
  areaOfCircle: radius => Math.PI * radius * radius, // radius: m

  flowRate: (volume, time) => volume / time, // volume: m³, time: s

  //pump calculations (updated to work with metric base units)
  clamparea: (boreDiameter, rodDiameter) => 
    (Math.PI*(boreDiameter/2)**2)-(Math.PI*(rodDiameter/2)**2), // boreDiameter: m, rodDiameter: m → m²
  clampvolume: (clamparea, strokeLength) => 
    clamparea * strokeLength, // clamparea: m², strokeLength: m → m³
  pumpflowrate: (timeOfStroke, clampvolume) => 
    timeOfStroke > 0 ? (clampvolume / timeOfStroke) : 0, // timeOfStroke: s, clampvolume: m³ → m³/s (base flow unit)
  // Returns pump displacement in m³ per revolution (base unit). Callers that want cc/rev should multiply by 1e6.
  pumpdisplacement: (pumpflowrate, angularVelocity) => {
    if (!angularVelocity || angularVelocity === 0) return 0;
    // pumpflowrate: m³/s, angularVelocity: rad/s
    // rev/s = angularVelocity / (2π)
    // displacement (m³/rev) = flow (m³/s) / rev/s = flow * (2π) / angularVelocity
    return (pumpflowrate * 2 * Math.PI) / angularVelocity; // m³/rev
  },
  pumpclampingforce: (clampPressure, clamparea) => 
    clampPressure * clamparea, // clampPressure: Pa, clamparea: m² → N
  // selectedPumpDisplacement: m³/rev (base), clampPressure: Pa, volefficiency: decimal (0..1)
  // Torque (Nm) = (Pressure * Volume per rev) / (2π * efficiency)
  motortorque: (selectedPumpDisplacement, clampPressure, volefficiency) => {
    if (!selectedPumpDisplacement || selectedPumpDisplacement === 0) return 0;
    return (clampPressure * selectedPumpDisplacement) / (2 * Math.PI * (volefficiency || 1)); // Nm
  },
  // Returns motor angular speed in rad/s (base). Clamping flow in m³/s, displacement in m³/rev.
  motorspeed: (clampingFlowRate, selectedPumpDisplacement, volefficiency) => {
    if (!selectedPumpDisplacement || selectedPumpDisplacement === 0) return 0;
    // rev/s = flow / (displacement * efficiency)
    const revPerSec = clampingFlowRate / (selectedPumpDisplacement * (volefficiency || 1));
    return revPerSec * 2 * Math.PI; // rad/s
  },
};
const liftformulas = {
// //lift calculations
  rotationalspeed: (maxSpeed, drumDiameter) => 
      (2 * maxSpeed) / drumDiameter, // maxSpeed: m/s, drumDiameter: m → rad/s
  forcegravity: (mass, gravity = 9.81) => mass * gravity, // mass: kg, gravity: m/s² → N
  drumtorque: (forcegravity, drumDiameter) => 
    forcegravity * (drumDiameter/2), // forcegravity: N, drumDiameter: m → Nm
  peakacceleration: (maxSpeed, accelDecelTime) => 
    maxSpeed / accelDecelTime, // maxSpeed: m/s, accelDecelTime: s → m/s²
  peakdrumtorque: (drumDiameter, mass, angularAcceleration) =>
    (drumDiameter / 2) * mass * ((angularAcceleration) + 9.81),
    // forcegravity: N
    // drumDiameter: m
    // mass: kg
    // angularAcceleration: rad/s² → Nm
 // Returns power in kW (matching the function name). Inputs: torque (Nm), angularspeed (rad/s)
  motorpower: (torque, angularspeed) => 
    (torque * angularspeed), // torque: Nm, angularspeed: rad/s → kW
};

const rotarytableformulas = {
  //https://www.kebamerica.com/blog/how-do-i-size-a-motor-for-my-application-rotary-index-table/
  maxangularspeed: (rotationalMoveDistance, totalMoveTime, accelTime, decelTime, gearboxRatio) => 
    gearboxRatio * (rotationalMoveDistance / (totalMoveTime - 0.5*accelTime - 0.5*decelTime)), // rotationalMoveDistance: rad, totalMoveTime: s, accelTime: s, decelTime: s, gearboxRatio: dimensionless → rad/s
  maxrotationalspeed: (maxAngularSpeed, gearboxRatio) =>
    // Return angular speed in rad/s (base). Callers should convert to RPM for display.
    maxAngularSpeed * gearboxRatio, // maxAngularSpeed: rad/s, gearboxRatio: dimensionless → rad/s
  
  motoracceleration: (maxAngularSpeed, accelTime, gearboxRatio) => 
    gearboxRatio * maxAngularSpeed / accelTime, // maxAngularSpeed: rad/s, accelTime: s, gearboxRatio: dimensionless → rad/s²

  motordeceleration: (maxAngularSpeed, decelTime, gearboxRatio) => 
    gearboxRatio * maxAngularSpeed / decelTime, // maxAngularSpeed: rad/s, decelTime: s, gearboxRatio: dimensionless → rad/s²

  rotaryTableInertia: (massIndexTable, radiusIndexTable) => 
    0.5 * massIndexTable * (radiusIndexTable ** 2), // massIndexTable: kg, radiusIndexTable: m → kg·m²
  reflectedInertia: (rotaryTableInertia, loadInertia, gearboxRatio) =>
    ((rotaryTableInertia + loadInertia) / (gearboxRatio ** 2)), // rotaryTableInertia: kg·m², loadInertia: kg·m², gearboxRatio: dimensionless → kg·m²

  torqueConstantFriction: (frictionTorque, gearboxRatio) => frictionTorque / gearboxRatio, // frictionTorque: Nm, gearboxRatio: dimensionless → Nm
  torqueRequiredAcceleration: (reflectedInertia, motorInertia, gearboxInertia, brakeInertia, motorAcceleration, torqueConstantFriction) =>
    ((reflectedInertia + motorInertia + gearboxInertia + brakeInertia) * motorAcceleration) + torqueConstantFriction, // reflectedInertia: kg·m², motorAcceleration: rad/s², torqueConstantFriction: Nm → Nm
  torqueRequiredDeceleration: (reflectedInertia, motorInertia, gearboxInertia, brakeInertia, motorDeceleration, torqueConstantFriction) =>
    ((reflectedInertia + motorInertia + gearboxInertia + brakeInertia) * motorDeceleration) + torqueConstantFriction, // reflectedInertia: kg·m², motorDeceleration: rad/s², torqueConstantFriction: Nm → Nm
  torqueRequiredConstantSpeed: (torqueConstantFriction) =>
    torqueConstantFriction, // torqueConstantFriction: Nm → Nm
  
  constantRunTime: (moveTime, accelTime, decelTime) =>
    moveTime - accelTime - decelTime, // moveTime: s, accelTime: s, decelTime: s → s
  torqueRmsMotor: (torqueRequiredAcceleration, torqueRequiredDeceleration, torqueRequiredConstantSpeed, accelTime, decelTime, constantRunTime, moveTime, dwellTime) =>
    Math.sqrt((((torqueRequiredAcceleration ** 2) * accelTime) + ((torqueRequiredDeceleration ** 2) * decelTime) + ((torqueRequiredConstantSpeed ** 2) * constantRunTime)) / (dwellTime + moveTime)), // all torques: Nm, all times: s → Nm
  };


  const conveyorformulas = {
    frictionalForce: (loadMass, frictionCoefficient) => loadMass * frictionCoefficient * 9.81, // loadMass: kg, frictionCoefficient: dimensionless → N
    inclineForce: (loadMass, inclineAngle) => loadMass * 9.81 * Math.abs(Math.sin(inclineAngle)), // loadMass: kg, inclineAngle: rad → N
    totalForce: (frictionalForce, inclineForce) => frictionalForce + inclineForce, // frictionalForce: N, inclineForce: N → N
  // Convert linear belt speed (m/s) to angular speed (rad/s) at roller
  // rev/s = beltSpeed / (π * rollerDiameter)
  // rad/s = rev/s * 2π = beltSpeed * 2 / rollerDiameter
  linearToRotationalSpeed: (beltSpeed, rollerDiameter) => (beltSpeed * 2) / rollerDiameter, // beltSpeed: m/s, rollerDiameter: m → rad/s
  
    requiredMotorPowerKw: (totalForce, beltSpeed) => (totalForce * beltSpeed), // totalForce: N, beltSpeed: m/s → W
    requiredMotorPowerHp: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 745.7, // totalForce: N, beltSpeed: m/s → hp
    requiredTorque: (totalForce, rollerDiameter) => (totalForce * rollerDiameter) / 2, // totalForce: N, rollerDiameter: m → Nm
  };

  const genericrotaryformulas = {
    torqueRequiredAcceleration: (momentOfInertia, angularSpeed, accelTime) => 
      angularSpeed * momentOfInertia / accelTime, // momentOfInertia: kg·m², angularSpeed: rad/s, accelTime: s → Nm
    torqueRequiredDeceleration: (momentOfInertia, angularSpeed, decelTime) => 
      angularSpeed * momentOfInertia / decelTime, // momentOfInertia: kg·m², angularSpeed: rad/s, decelTime: s → Nm
    requiredMotorPowerKw : (torque, angularSpeed) => 
      (torque * angularSpeed) / 1000, // torque: Nm, angularSpeed: rad/s → kW
    requiredMotorPowerHp : (torque, angularSpeed) => 
      (torque * angularSpeed) / 745.7, // torque: Nm, angularSpeed: rad/s → hp
  };

  const blowerformulas = {
    // Calculate fan power
    fanPower: (airflow, pressure, fanEfficiency) => (airflow * pressure) / (fanEfficiency / 100), // airflow: m³/s, pressure: Pa, fanEfficiency: % → W
    // Calculate motor power
    motorPower: (fanPower, motorEfficiency) => fanPower / (motorEfficiency / 100), // fanPower: W, motorEfficiency: % → W
    // Convert motor power to HP
    motorPowerHP: (motorPowerWatts) => motorPowerWatts / 745.7, // motorPowerWatts: W → HP
    // Calculate torque from motor power and speed
    blowerTorque: (motorPowerWatts, rpmRads) => { // motorPowerWatts: W, rpmRads: rad/s → Nm
      if (rpmRads && rpmRads > 0) {
        return motorPowerWatts / rpmRads; // Nm
      }
      return 0;
    }
  };

// Export formulas for Node-based tests (no effect in browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formulas,
    rotarytableformulas,
    conveyorformulas,
    genericrotaryformulas,
    blowerformulas
  };
}
  



