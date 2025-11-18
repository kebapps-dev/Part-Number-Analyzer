const assert = require('assert');
const { formulas, rotarytableformulas, conveyorformulas } = require('../formulas');

function approxEqual(a, b, tol = 1e-9) {
  return Math.abs(a - b) <= tol;
}

let failures = 0;
function ok(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failures++;
  } else {
    console.log('OK:', msg);
  }
}

console.log('Running formulas tests...');

// Test 1: clamp area
const bore = 0.05; // m
const rod = 0.02; // m
const area = formulas.clamparea(bore, rod);
const expectedArea = Math.PI * (Math.pow(bore/2, 2) - Math.pow(rod/2, 2));
ok(approxEqual(area, expectedArea, 1e-12), `clamparea(${bore}, ${rod}) ≈ ${expectedArea} (got ${area})`);

// Test 2: pump flow rate
const clampVol = 0.001; // m^3
const tStroke = 2; // s
const flow = formulas.pumpflowrate(tStroke, clampVol);
ok(approxEqual(flow, 0.0005, 1e-12), `pumpflowrate -> ${flow} m^3/s`);

// Test 3: pump displacement and conversions
const omega = 100; // rad/s
const displacement = formulas.pumpdisplacement(flow, omega); // m^3/rev
// Expected: (flow * 2π) / omega
const expectedDisp = (flow * 2 * Math.PI) / omega;
ok(approxEqual(displacement, expectedDisp, 1e-12), `pumpdisplacement -> ${displacement} m^3/rev`);
// in cc/rev expected
const dispCc = displacement * 1e6;
const expectedDispCc = expectedDisp * 1e6;
ok(approxEqual(dispCc, expectedDispCc, 1e-9), `pumpdisplacement cc/rev -> ${dispCc}`);

// Test 4: motorspeed and motortorque
const eff = 0.9;
const revsPerSec = flow / (displacement * eff);
const omegaExpected = revsPerSec * 2 * Math.PI;
const motorspeed = formulas.motorspeed(flow, displacement, eff);
ok(approxEqual(motorspeed, omegaExpected, 1e-12), `motorspeed rad/s -> ${motorspeed}`);

// Torque: T = P * V / (2π * eta) with P=clampPressure
const clampPressure = 1e5; // Pa
const torque = formulas.motortorque(displacement, clampPressure, eff);
const torqueExpected = (clampPressure * displacement) / (2 * Math.PI * eff);
ok(approxEqual(torque, torqueExpected, 1e-12), `motortorque -> ${torque}`);

// Test 5: conveyor linearToRotationalSpeed conversion correctness
const beltSpeed = 1.0; // m/s
const rollerDiameter = 0.2; // m
const omegaRoller = conveyorformulas.linearToRotationalSpeed(beltSpeed, rollerDiameter); // rad/s
const expectedOmega = (beltSpeed * 2) / rollerDiameter;
ok(approxEqual(omegaRoller, expectedOmega, 1e-12), `linearToRotationalSpeed -> ${omegaRoller}`);

// Test 6: rotarytable maxangularspeed & maxrotationalspeed relationship
const rotMove = Math.PI/2; // rad
const totalMove = 2; // s
const accel = 0.5; const decel = 0.5; const gr = 1;
const maxAng = rotarytableformulas.maxangularspeed(rotMove, totalMove, accel, decel, gr);
const maxRot = rotarytableformulas.maxrotationalspeed(maxAng, gr);
ok(approxEqual(maxRot, maxAng * gr, 1e-12), `maxrotationalspeed -> ${maxRot}`);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(2);
}

console.log('All tests passed');
process.exit(0);
