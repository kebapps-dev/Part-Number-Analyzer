// Leadscrew formulas (SI base units: N, m, rad/s → Nm, W)
const leadscrewformulas = {
  screwTorque: (force, lead) => (force * lead) / (2 * Math.PI),
  motorTorque: (screwTorque, gearboxRatio, efficiency) => screwTorque / (gearboxRatio * efficiency),
  motorPower: (motorTorque, angularSpeed) => motorTorque * angularSpeed
};

if (typeof window !== 'undefined') window.leadscrewformulas = leadscrewformulas;

function findClosestLeadscrewMotor() {
  const lead = getValueWithUnit('leadscrewLead'); // m
  const force = getValueWithUnit('leadscrewForce'); // N
  const speed = getValueWithUnit('leadscrewRotSpeed'); // rad/s
  const ratio = getValueWithUnit('leadscrewRatio'); // dimensionless
  const eff = Math.max(0.01, (getValueWithUnit('leadscrewEff') || 100) / 100); // dimensionless

  const torque = leadscrewformulas.motorTorque(leadscrewformulas.screwTorque(force, lead), ratio, eff);
  const power = leadscrewformulas.motorPower(torque, speed);

  displayStandardResults({
    [`Required Motor Speed (${window.selectedResultUnits?.speed || 'RPM'})`]: 
      convertResultValue(speed, 'speed', window.selectedResultUnits?.speed || 'RPM').toFixed(3),
    [`Required Motor Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(torque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Required Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(power, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3)
  });
}

// Leadscrew sizing suggestions
function getLeadscrewSizingSuggestions() {
  return `<b>Leadscrew Sizing Tips:</b><ul>
    <li>Verify leadscrew pitch/lead for accurate speed and torque calculations.</li>
    <li>Include axial force and gearbox ratio for proper motor selection.</li>
    <li>Account for efficiency losses in the leadscrew and gearbox.</li>
    <li>Consider duty cycle and required positioning accuracy.</li>
  </ul>`;
}

// Leadscrew formulas display
function getLeadscrewFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( v = \\text{lead} \\cdot \\frac{RPM}{60} \\)</span>
    <span class="formula"><b>(2)</b> \\( T = \\frac{F \\cdot \\text{lead}}{2\\pi} \\)</span>
    <span class="formula"><b>(3)</b> \\( T_{motor} = \\frac{T}{i \\cdot \\eta} \\)</span>
    <span class="formula"><b>(4)</b> \\( P = T_{motor} \\cdot \\omega \\)</span>
  `;
}

// Leadscrew result unit mappings
function getLeadscrewResultUnitMappings() {
  return {
    'Required Motor Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Required Motor Speed': { type: 'speed', component: 'motor', defaultUnit: 'RPM' }
  };
}

