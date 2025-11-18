// Rotary Table formulas (SI base units: kg, m, rad, s → kg·m², rad/s, Nm)
const rotarytableformulas = {
  maxangularspeed: (moveDistance, moveTime, accelTime, decelTime, gearRatio) => 
    gearRatio * (moveDistance / (moveTime - 0.5*accelTime - 0.5*decelTime)),
  maxrotationalspeed: (maxAngSpeed, gearRatio) => maxAngSpeed * gearRatio,
  motoracceleration: (maxAngSpeed, accelTime, gearRatio) => gearRatio * maxAngSpeed / accelTime,
  motordeceleration: (maxAngSpeed, decelTime, gearRatio) => gearRatio * maxAngSpeed / decelTime,
  rotaryTableInertia: (mass, radius) => 0.5 * mass * (radius ** 2),
  reflectedInertia: (tableInertia, loadInertia, gearRatio) => (tableInertia + loadInertia) / (gearRatio ** 2),
  torqueConstantFriction: (fricTorque, gearRatio) => fricTorque / gearRatio,
  torqueRequiredAcceleration: (refInertia, motorInertia, gearInertia, brakeInertia, motorAccel, fricTorque) =>
    (refInertia + motorInertia + gearInertia + brakeInertia) * motorAccel + fricTorque,
  torqueRequiredDeceleration: (refInertia, motorInertia, gearInertia, brakeInertia, motorDecel, fricTorque) =>
    (refInertia + motorInertia + gearInertia + brakeInertia) * motorDecel + fricTorque,
  torqueRequiredConstantSpeed: (fricTorque) => fricTorque,
  constantRunTime: (moveTime, accelTime, decelTime) => moveTime - accelTime - decelTime,
  torqueRmsMotor: (accelTorque, decelTorque, constTorque, accelTime, decelTime, runTime, moveTime, dwellTime) =>
    Math.sqrt(((accelTorque ** 2 * accelTime) + (decelTorque ** 2 * decelTime) + (constTorque ** 2 * runTime)) / (dwellTime + moveTime))
};

if (typeof window !== 'undefined') window.rotarytableformulas = rotarytableformulas;

function findClosestRotaryTableMotor() {
  const moveDistance = parseFloat(document.getElementById('rotationalMoveDistance').value);
  const moveTime = parseFloat(document.getElementById('totalMoveTime').value);
  const accelTime = parseFloat(document.getElementById('accelTime').value);
  const decelTime = parseFloat(document.getElementById('decelTime').value);
  const gearRatio = parseFloat(document.getElementById('gearboxRatioRotary').value);
  const mass = getValueWithUnit('massIndexTable');
  const radius = getValueWithUnit('radiusIndexTable');
  const loadInertia = getValueWithUnit('loadInertia');
  const fricTorque = getValueWithUnit('frictionTorque');
  const dwellTime = parseFloat(document.getElementById('dwellTime').value);
  const motorInertia = getValueWithUnit('motorInertia');
  const gearInertia = getValueWithUnit('gearboxInertia');
  const brakeInertia = getValueWithUnit('brakeInertia');

  const maxAngSpeed = rotarytableformulas.maxangularspeed(moveDistance, moveTime, accelTime, decelTime, gearRatio);
  const maxRotSpeed = rotarytableformulas.maxrotationalspeed(maxAngSpeed, gearRatio);
  const motorAccel = rotarytableformulas.motoracceleration(maxAngSpeed, accelTime, gearRatio);
  const motorDecel = rotarytableformulas.motordeceleration(maxAngSpeed, decelTime, gearRatio);
  const tableInertia = rotarytableformulas.rotaryTableInertia(mass, radius);
  const refInertia = rotarytableformulas.reflectedInertia(tableInertia, loadInertia, gearRatio);
  const constFricTorque = rotarytableformulas.torqueConstantFriction(fricTorque, gearRatio);
  const accelTorque = rotarytableformulas.torqueRequiredAcceleration(refInertia, motorInertia, gearInertia, brakeInertia, motorAccel, constFricTorque);
  const decelTorque = rotarytableformulas.torqueRequiredDeceleration(refInertia, motorInertia, gearInertia, brakeInertia, motorDecel, constFricTorque);
  const constSpeedTorque = rotarytableformulas.torqueRequiredConstantSpeed(constFricTorque);
  const runTime = rotarytableformulas.constantRunTime(moveTime, accelTime, decelTime);
  const rmsTorque = rotarytableformulas.torqueRmsMotor(accelTorque, decelTorque, constSpeedTorque, accelTime, decelTime, runTime, moveTime, dwellTime);

  displayStandardResults({
    'Maximum Angular Speed': `${maxAngSpeed.toFixed(2)} rad/s`,
    'Maximum Motor Speed': `${(maxRotSpeed * 60 / (2 * Math.PI)).toFixed(2)} RPM`,
    [`Rotary Table Inertia (${window.selectedResultUnits?.inertia || 'kg·m²'})`]: 
      convertResultValue(tableInertia, 'inertia', window.selectedResultUnits?.inertia || 'kg·m²').toFixed(2),
    [`Reflected Inertia (${window.selectedResultUnits?.inertia || 'kg·m²'})`]: 
      convertResultValue(refInertia, 'inertia', window.selectedResultUnits?.inertia || 'kg·m²').toFixed(2),
    [`Constant Speed Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(constSpeedTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(2),
    [`Acceleration Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(accelTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(2),
    [`Deceleration Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(decelTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(2),
    [`RMS Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(rmsTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(2)
  });
}

// Rotary Table sizing suggestions
function getRotaryTableSizingSuggestions() {
  return `<b>Rotary Table Sizing Tips:</b><ul>
    <li>Include all rotating mass (table, load, fixtures) in inertia calculations.</li>
    <li>Account for gearbox ratio when reflecting inertia to motor shaft.</li>
    <li>RMS torque calculation includes acceleration, constant speed, deceleration, and dwell phases.</li>
    <li>Consider friction torque from bearings and seals.</li>
  </ul>`;
}

// Rotary Table formulas display
function getRotaryTableFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( \\omega_{max} = \\frac{i \\cdot \\theta_{move}}{t_{move} - 0.5t_{accel} - 0.5t_{decel}} \\)</span>
    <span class="formula"><b>(2)</b> \\( J_{table} = 0.5 \\cdot m \\cdot r^2 \\)</span>
    <span class="formula"><b>(3)</b> \\( J_{reflected} = \\frac{J_{table} + J_{load}}{i^2} \\)</span>
    <span class="formula"><b>(4)</b> \\( T_{accel} = (J_{reflected} + J_{motor} + J_{gearbox} + J_{brake}) \\cdot \\alpha + T_{friction} \\)</span>
    <span class="formula"><b>(5)</b> \\( T_{RMS} = \\sqrt{\\frac{T_{accel}^2 \\cdot t_{accel} + T_{decel}^2 \\cdot t_{decel} + T_{const}^2 \\cdot t_{run}}{t_{move} + t_{dwell}}} \\)</span>
  `;
}

// Rotary Table result unit mappings
function getRotaryTableResultUnitMappings() {
  return {
    'RMS Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Acceleration Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Deceleration Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Constant Speed Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Rotary Table Inertia': { type: 'inertia', component: 'system', defaultUnit: 'kg·m²' },
    'Reflected Inertia': { type: 'inertia', component: 'system', defaultUnit: 'kg·m²' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    rotarytableformulas,
    findClosestRotaryTableMotor,
    getRotaryTableSizingSuggestions,
    getRotaryTableFormulas,
    getRotaryTableResultUnitMappings
  });
}