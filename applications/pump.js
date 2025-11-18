// Pump formulas (SI base units: m, Pa, s → m², m³, m³/s, N, Nm, rad/s, W)
const pumpformulas = {
  clamparea: (boreDiameter, rodDiameter) => (Math.PI * (boreDiameter / 2) ** 2) - (Math.PI * (rodDiameter / 2) ** 2),
  clampvolume: (clampArea, strokeLength) => clampArea * strokeLength,
  pumpflowrate: (timeOfStroke, clampVolume) => timeOfStroke > 0 ? clampVolume / timeOfStroke : 0,
  pumpdisplacement: (flowRate, angularVelocity) => {
    if (!angularVelocity || angularVelocity === 0) return 0;
    return (flowRate * 2 * Math.PI) / angularVelocity;
  },
  pumpclampingforce: (clampPressure, clampArea) => clampPressure * clampArea,
  motortorque: (pumpDisplacement, clampPressure, efficiency) => {
    if (!pumpDisplacement || pumpDisplacement === 0) return 0;
    return (clampPressure * pumpDisplacement) / (2 * Math.PI * (efficiency || 1));
  },
  motorspeed: (flowRate, pumpDisplacement, efficiency) => {
    if (!pumpDisplacement || pumpDisplacement === 0) return 0;
    const revPerSec = flowRate / (pumpDisplacement * (efficiency || 1));
    return revPerSec * 2 * Math.PI;
  }
};

function findClosestPumpMotor() {
  const boreDiameter = getValueWithUnit('boreDiameter');
  const rodDiameter = getValueWithUnit('rodDiameter');
  const strokeLength = getValueWithUnit('strokeLength');
  const clampPressure = getValueWithUnit('clampPressure');
  const timeOfStroke = parseFloat(document.getElementById('timeOfStroke').value);
  const rpm = getValueWithUnit('rpm');
  const motorEfficiency = parseFloat(document.getElementById('motorEfficiency').value) / 100;
  const safetyFactor = parseFloat(document.getElementById('safetyFactor').value);

  const clampArea = pumpformulas.clamparea(boreDiameter, rodDiameter);
  const clampVolume = pumpformulas.clampvolume(clampArea, strokeLength);
  const flowRate = pumpformulas.pumpflowrate(timeOfStroke, clampVolume);
  const pumpDisplacement = pumpformulas.pumpdisplacement(flowRate, rpm);
  const clampingForce = pumpformulas.pumpclampingforce(clampPressure, clampArea);
  const motorTorque = pumpformulas.motortorque(pumpDisplacement, clampPressure, motorEfficiency);
  const motorSpeed = pumpformulas.motorspeed(flowRate, pumpDisplacement, motorEfficiency);
  const motorTorqueWithSafety = motorTorque * safetyFactor;
  const motorSpeedWithSafety = motorSpeed * safetyFactor;
  const motorPower = motorTorqueWithSafety * motorSpeed;

  displayStandardResults({
    [`Flow Rate Required (${window.selectedResultUnits?.flow || 'L/min'})`]: 
      convertResultValue(flowRate, 'flow', window.selectedResultUnits?.flow || 'L/min').toFixed(3),
    'Pump Displacement Required': `${(pumpDisplacement * 1e6).toFixed(2)} cc/rev`,
    [`Clamping Force (${window.selectedResultUnits?.force || 'kN'})`]: 
      convertResultValue(clampingForce, 'force', window.selectedResultUnits?.force || 'kN').toFixed(3),
    [`Motor Required Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(motorTorqueWithSafety, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    'Motor Required Speed': `${(motorSpeedWithSafety * 60 / (2 * Math.PI)).toFixed(0)} RPM`,
    [`Required Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(motorPower, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3)
  });
}

// Pump sizing suggestions
function getPumpSizingSuggestions() {
  return `<b>Pump Sizing Tips:</b><ul>
    <li>Calculate clamp area considering bore and rod diameters.</li>
    <li>Flow rate determines pump displacement needed at given RPM.</li>
    <li>Motor torque accounts for pressure, displacement, and efficiency.</li>
    <li>Apply safety factor for system variations and peak loads.</li>
  </ul>`;
}

// Pump formulas display
function getPumpFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( A_{clamp} = \\pi \\left(\\frac{D_{bore}}{2}\\right)^2 - \\pi \\left(\\frac{D_{rod}}{2}\\right)^2 \\)</span>
    <span class="formula"><b>(2)</b> \\( V_{clamp} = A_{clamp} \\cdot L_{stroke} \\)</span>
    <span class="formula"><b>(3)</b> \\( Q = \\frac{V_{clamp}}{t_{stroke}} \\)</span>
    <span class="formula"><b>(4)</b> \\( D_{pump} = \\frac{Q \\cdot 2\\pi}{\\omega} \\)</span>
    <span class="formula"><b>(5)</b> \\( F_{clamp} = P_{clamp} \\cdot A_{clamp} \\)</span>
    <span class="formula"><b>(6)</b> \\( T_{motor} = \\frac{P \\cdot D_{pump}}{2\\pi \\cdot \\eta} \\)</span>
  `;
}

// Pump result unit mappings
function getPumpResultUnitMappings() {
  return {
    'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Motor Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Flow Rate Required': { type: 'flow', component: 'system', defaultUnit: 'L/min' },
    'Clamping Force': { type: 'force', component: 'system', defaultUnit: 'kN' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    pumpformulas,
    findClosestPumpMotor,
    getPumpSizingSuggestions,
    getPumpFormulas,
    getPumpResultUnitMappings
  });
}