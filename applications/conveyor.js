// Conveyor formulas (SI base units: kg, rad, m/s → N, W, Nm)
const conveyorformulas = {
  frictionalForce: (loadMass, frictionCoefficient) => loadMass * frictionCoefficient * 9.81,
  inclineForce: (loadMass, inclineAngle) => loadMass * 9.81 * Math.abs(Math.sin(inclineAngle)),
  totalForce: (frictionalForce, inclineForce) => frictionalForce + inclineForce,
  linearToRotationalSpeed: (beltSpeed, rollerDiameter) => (beltSpeed * 2) / rollerDiameter,
  requiredMotorPowerKw: (totalForce, beltSpeed) => totalForce * beltSpeed,
  requiredMotorPowerHp: (totalForce, beltSpeed) => (totalForce * beltSpeed) / 745.7,
  requiredTorque: (totalForce, rollerDiameter) => (totalForce * rollerDiameter) / 2
};

function findClosestConveyorMotor() {
  const mass = getValueWithUnit('loadMass');
  const friction = parseFloat(document.getElementById('frictionCoefficient').value);
  const angle = getValueWithUnit('conveyorInclineAngle');
  const speed = getValueWithUnit('beltSpeed');
  const diameter = getValueWithUnit('rollerDiameter');

  const fricForce = conveyorformulas.frictionalForce(mass, friction);
  const inclForce = conveyorformulas.inclineForce(mass, angle);
  const totalForce = conveyorformulas.totalForce(fricForce, inclForce);
  const rotSpeed = conveyorformulas.linearToRotationalSpeed(speed, diameter);
  const power = conveyorformulas.requiredMotorPowerKw(totalForce, speed);
  const torque = conveyorformulas.requiredTorque(totalForce, diameter);

  displayStandardResults({
    [`Frictional Force (${window.selectedResultUnits?.force || 'N'})`]: 
      convertResultValue(fricForce, 'force', window.selectedResultUnits?.force || 'N').toFixed(2),
    [`Incline Force (${window.selectedResultUnits?.force || 'N'})`]: 
      convertResultValue(inclForce, 'force', window.selectedResultUnits?.force || 'N').toFixed(2),
    [`Total Force (${window.selectedResultUnits?.force || 'N'})`]: 
      convertResultValue(totalForce, 'force', window.selectedResultUnits?.force || 'N').toFixed(2),
    [`Required Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(torque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Required Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(power, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3)
  });
}

// Conveyor sizing suggestions
function getConveyorSizingSuggestions() {
  return `<b>Conveyor Sizing Tips:</b><ul>
    <li>Calculate belt speed and load mass for power requirements.</li>
    <li>Consider incline angle and friction coefficient.</li>
    <li>Check roller diameter for correct speed conversion.</li>
  </ul>`;
}

// Conveyor formulas display
function getConveyorFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( F_{friction} = m_{load} \\cdot g \\cdot\\mu_{friction} \\)</span>
    <span class="formula"><b>(2)</b> \\( F_{incline} = m_{load} \\cdot g \\cdot \\sin(\\theta) \\)</span>
    <span class="formula"><b>(3)</b> \\( RPM = \\frac{v_{belt} \\cdot 60}{\\pi \\cdot D_{roller}} \\)</span>
    <span class="formula"><b>(4)</b> \\( T_{motor} = \\frac{F_{total} \\cdot D_{roller}}{2} \\)</span>
    <span class="formula"><b>(5)</b> \\( P = F_{belt} \\cdot v_{belt} \\)</span>
  `;
}

// Conveyor result unit mappings
function getConveyorResultUnitMappings() {
  return {
    'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Required Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'Total Force': { type: 'force', component: 'system', defaultUnit: 'N' },
    'Frictional Force': { type: 'force', component: 'system', defaultUnit: 'N' },
    'Incline Force': { type: 'force', component: 'system', defaultUnit: 'N' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    conveyorformulas,
    findClosestConveyorMotor,
    getConveyorSizingSuggestions,
    getConveyorFormulas,
    getConveyorResultUnitMappings
  });
}

if (typeof window !== 'undefined') window.getConveyorResultUnitMappings = getConveyorResultUnitMappings;