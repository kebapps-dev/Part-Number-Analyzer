// Blower formulas (SI base units: m³/s, Pa, % → W, Nm)
const blowerformulas = {
  fanPower: (airflow, pressure, fanEfficiency) => (airflow * pressure) / (fanEfficiency / 100),
  motorPower: (fanPower, motorEfficiency) => fanPower / (motorEfficiency / 100),
  motorPowerHP: (motorPowerWatts) => motorPowerWatts / 745.7,
  blowerTorque: (motorPowerWatts, rpmRads) => rpmRads && rpmRads > 0 ? motorPowerWatts / rpmRads : 0
};

function findClosestBlowerMotor() {
  const airflow = getValueWithUnit('blowerAirflow');
  const pressure = getValueWithUnit('blowerPressure');
  const fanEff = getValueWithUnit('blowerFanEff');
  const motorEff = getValueWithUnit('blowerMotorEff');
  const speed = getValueWithUnit('blowerRequiredSpeed');

  const fanPower = blowerformulas.fanPower(airflow, pressure, fanEff);
  const motorPower = blowerformulas.motorPower(fanPower, motorEff);
  const torque = blowerformulas.blowerTorque(motorPower, speed);

  displayStandardResults({
    [`Fan Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(fanPower, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3),
    [`Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(motorPower, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3),
    [`Torque Required (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      torque ? convertResultValue(torque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3) : 'N/A (Speed required)'
  });
}

// Blower sizing suggestions
function getBlowerSizingSuggestions() {
  return `<b>Blower Sizing Tips:</b><ul>
    <li>Set airflow and pressure for required blower performance.</li>
    <li>Include fan and motor efficiency for accurate power sizing.</li>
    <li>Check required speed for compatibility with selected motor.</li>
  </ul>`;
}

// Blower formulas display
function getBlowerFormulas() {
  return `
    <span class="formula"><b>(1)</b> \\( P_{fan} = \\frac{Q \\cdot \\Delta P}{\\eta_{fan}/100} \\)</span>
    <span class="formula"><b>(2)</b> \\( P_{motor} = \\frac{P_{fan}}{\\eta_{motor}/100} \\)</span>
    <span class="formula"><b>(3)</b> \\( T_{motor} = \\frac{P_{motor}}{\\omega} = \\frac{P_{motor}}{\\frac{2\\pi \\cdot RPM}{60}} \\)</span>
  `;
}

// Blower result unit mappings
function getBlowerResultUnitMappings() {
  return {
    'Fan Power': { type: 'power', component: 'fan', defaultUnit: 'kW' },
    'Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Torque Required': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    blowerformulas,
    findClosestBlowerMotor,
    getBlowerSizingSuggestions,
    getBlowerFormulas,
    getBlowerResultUnitMappings
  });
}