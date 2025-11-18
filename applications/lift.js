// Lift formulas (SI base units: kg, m, m/s, s → N, Nm, rad/s, W)
const liftformulas = {
  rotationalspeed: (maxSpeed, drumDiameter) => (2 * maxSpeed) / drumDiameter,
  forcegravity: (mass, gravity = 9.81) => mass * gravity,
  drumtorque: (force, drumDiameter) => force * (drumDiameter / 2),
  peakacceleration: (maxSpeed, accelDecelTime) => maxSpeed / accelDecelTime,
  peakdrumtorque: (drumDiameter, mass, linearAccel) => (drumDiameter / 2) * mass * (linearAccel + 9.81),
  motorpower: (torque, angularSpeed) => torque * angularSpeed
};

function findClosestLiftMotor() {
  const loadWeight = getValueWithUnit('loadWeight');
  const maxSpeed = getValueWithUnit('maxSpeed');
  const drumDiameter = getValueWithUnit('drumDiameter');
  const gearRatio = parseFloat(document.getElementById('gearboxRatioLift').value);
  const gearEfficiency = parseFloat(document.getElementById('gearboxEfficiencyPercent').value) / 100 || 1.0;
  const accelDecelTime = parseFloat(document.getElementById('accelDecelTime').value);
  const motorEfficiency = parseFloat(document.getElementById('motorEfficiencyPercent').value) / 100;
  const safetyFactor = parseFloat(document.getElementById('safetyFactor').value);

  const gravityForce = liftformulas.forcegravity(loadWeight);
  const gearOutputSpeed = liftformulas.rotationalspeed(maxSpeed, drumDiameter);
  const motorSpeed = gearOutputSpeed * gearRatio;
  const loadTorque = liftformulas.drumtorque(gravityForce, drumDiameter);
  const peakAccel = liftformulas.peakacceleration(maxSpeed, accelDecelTime);
  const loadPeakTorque = liftformulas.peakdrumtorque(drumDiameter, loadWeight, peakAccel);
  const motorTorque = loadTorque / gearRatio;
  const motorPeakTorque = loadPeakTorque / gearRatio;
  const loadPower = loadTorque * gearOutputSpeed;
  const requiredMotorPower = (loadPower * safetyFactor) / (gearEfficiency * motorEfficiency);

  displayStandardResults({
    [`Motor Speed (${window.selectedResultUnits?.speed || 'RPM'})`]: 
      convertResultValue(motorSpeed, 'speed', window.selectedResultUnits?.speed || 'RPM').toFixed(2),
    [`Motor Required Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(motorTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Motor Peak Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(motorPeakTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Required Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(requiredMotorPower, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3),
    [`Gearbox Output Speed (${window.selectedResultUnits?.speed || 'RPM'})`]: 
      convertResultValue(gearOutputSpeed, 'speed', window.selectedResultUnits?.speed || 'RPM').toFixed(2),
    [`Gearbox Required Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(loadTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Gearbox Peak Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(loadPeakTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3)
  });
}

// Lift sizing suggestions
function getLiftSizingSuggestions() {
  return `<b>Lift Sizing Tips:</b><ul>
    <li>Include load mass, counterweight (if any), and cable/chain mass.</li>
    <li>Account for gearbox and motor efficiency losses in power calculation.</li>
    <li>Peak torque must handle acceleration and deceleration loads.</li>
    <li>Apply appropriate safety factor for the application.</li>
  </ul>`;
}

// Lift formulas display
function getLiftFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( F_{gravity} = m \\cdot g \\)</span>
    <span class="formula"><b>(2)</b> \\( \\omega_{drum} = \\frac{2 \\cdot v_{max}}{D_{drum}} \\)</span>
    <span class="formula"><b>(3)</b> \\( T_{drum} = F_{gravity} \\cdot \\frac{D_{drum}}{2} \\)</span>
    <span class="formula"><b>(4)</b> \\( T_{peak} = \\frac{D_{drum}}{2} \\cdot m \\cdot (a_{peak} + g) \\)</span>
    <span class="formula"><b>(5)</b> \\( P_{motor} = \\frac{P_{load} \\cdot SF}{\\eta_{gearbox} \\cdot \\eta_{motor}} \\)</span>
  `;
}

// Lift result unit mappings
function getLiftResultUnitMappings() {
  return {
    'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Motor Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Motor Peak Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Motor Speed': { type: 'speed', component: 'motor', defaultUnit: 'RPM' },
    'Gearbox Required Torque': { type: 'torque', component: 'system', defaultUnit: 'Nm' },
    'Gearbox Peak Torque': { type: 'torque', component: 'system', defaultUnit: 'Nm' },
    'Gearbox Output Speed': { type: 'speed', component: 'system', defaultUnit: 'RPM' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    liftformulas,
    findClosestLiftMotor,
    getLiftSizingSuggestions,
    getLiftFormulas,
    getLiftResultUnitMappings
  });
}

  