// Generic Rotary formulas (SI base units: kg·m², rad/s, s → Nm, W)
const genericrotaryformulas = {
  torqueRequiredAcceleration: (inertia, speed, accelTime) => speed * inertia / accelTime,
  torqueRequiredDeceleration: (inertia, speed, decelTime) => speed * inertia / decelTime,
  requiredMotorPowerKw: (torque, speed) => (torque * speed) / 1000,
  requiredMotorPowerHp: (torque, speed) => (torque * speed) / 745.7,
  rmsTorque: (accelTorque, fricTorque, accelTime, runTime, decelTime, restTime) => {
    const total = accelTime + runTime + decelTime + restTime;
    return Math.sqrt(((accelTorque ** 2 * accelTime) + (fricTorque ** 2 * runTime) + (accelTorque ** 2 * decelTime)) / total);
  }
};

function findClosestGenericRotaryMotor() {
  const inertia = getValueWithUnit('genericMomentOfInertia');
  const speed = getValueWithUnit('genericRequiredSpeed');
  const accelTime = parseFloat(document.getElementById('genericAccelTime').value);
  const runTime = parseFloat(document.getElementById('genericRunTime').value);
  const decelTime = parseFloat(document.getElementById('genericDecelTime').value);
  const restTime = parseFloat(document.getElementById('genericRestTime').value);
  const fricTorque = getValueWithUnit('genericFrictionTorque');

  const accelTorque = genericrotaryformulas.torqueRequiredAcceleration(inertia, speed, accelTime) + fricTorque;
  const rmsTorque = genericrotaryformulas.rmsTorque(accelTorque, fricTorque, accelTime, runTime, decelTime, restTime);
  const power = rmsTorque * speed;

  displayStandardResults({
    [`Accel Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(accelTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`RMS Torque (${window.selectedResultUnits?.torque || 'Nm'})`]: 
      convertResultValue(rmsTorque, 'torque', window.selectedResultUnits?.torque || 'Nm').toFixed(3),
    [`Required Motor Power (${window.selectedResultUnits?.power || 'kW'})`]: 
      convertResultValue(power, 'power', window.selectedResultUnits?.power || 'kW').toFixed(3)
  });
}

// Generic Rotary sizing suggestions
function getGenericRotarySizingSuggestions() {
  return `<b>Generic Rotary Sizing Tips:</b><ul>
    <li>Ensure moment of inertia includes all rotating components.</li>
    <li>RMS torque accounts for acceleration, run, deceleration, and rest phases.</li>
    <li>Consider friction torque for continuous operation.</li>
  </ul>`;
}

// Generic Rotary formulas display
function getGenericRotaryFormulas() {
  return `
        <span class="formula">\\( \\omega = 2\\pi \\cdot \\frac{\\text{RPM}}{60} \\)</span>
        <span class="formula">\\( \\alpha = J \\cdot \\frac{\\omega}{t} \\)</span>
        <span class="formula"><b>(1)</b> \\( T_{accel} = (J \\cdot \\alpha) + T_{friction} \\)</span>
        <span class="formula"><b>(2)</b> \\( T_{rms} = \\sqrt{\\frac{T_{accel}^2 t_{accel} + T_{friction}^2 t_{run} + T_{decel}^2 t_{decel} + T_{rest}^2 t_{rest}}{t_{cycle}}} \\)</span>
        <span class="formula"><b>(3)</b> \\( P = T_{rms} \\cdot \\omega \\)</span>
    `;
}

// Generic Rotary result unit mappings
function getGenericRotaryResultUnitMappings() {
  return {
    'Required Motor Power': { type: 'power', component: 'motor', defaultUnit: 'kW' },
    'Accel Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' },
    'RMS Torque': { type: 'torque', component: 'motor', defaultUnit: 'Nm' }
  };
}

// Expose to window
if (typeof window !== 'undefined') {
  Object.assign(window, {
    genericrotaryformulas,
    findClosestGenericRotaryMotor,
    getGenericRotarySizingSuggestions,
    getGenericRotaryFormulas,
    getGenericRotaryResultUnitMappings
  });
}

