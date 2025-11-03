// Generic Rotary Motor Sizing Application
// Now uses standardized results display from main.js

function findClosestGenericRotaryMotor() {
    // Check for empty input boxes and reset state if needed
    const inputIds = [
        "genericMomentOfInertia",
        "genericRequiredSpeed", 
        "genericAccelTime",
        "genericRunTime",
        "genericDecelTime",
        "genericRestTime",
        "genericFrictionTorque"
    ];
    let hasEmpty = false;
    for (const id of inputIds) {
        const el = document.getElementById(id);
        if (!el || el.value === "" || el.value === null) {
            hasEmpty = true;
            break;
        }
    }
    if (hasEmpty) {
        // Reset standardized display state
        startingValues = [];
        showSegments = false;
    }

    const resultsDiv = document.getElementById("results");
    
    // Check if all required elements exist before proceeding
    const requiredElements = [
        "genericMomentOfInertia", 
        "genericRequiredSpeed", 
        "genericAccelTime", "genericRunTime", "genericDecelTime", "genericRestTime",
        "genericFrictionTorque"
    ];
    
    for (const id of requiredElements) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Required element ${id} not found in DOM`);
            return;
        }
    }
    
    const rmsresults = sizeGenericRotaryMotor(
        {
            inertia : getValueWithUnit("genericMomentOfInertia"), // kg·m²
            targetSpeed : getValueWithUnit("genericRequiredSpeed"), // rad/s
            accelTime : parseFloat(document.getElementById("genericAccelTime").value), // s
            runTime : parseFloat(document.getElementById("genericRunTime").value), // s
            decelTime : parseFloat(document.getElementById("genericDecelTime").value), // s
            restTime : parseFloat(document.getElementById("genericRestTime").value), // s
            frictionTorque : getValueWithUnit("genericFrictionTorque") // Nm
        }
    );

    const powerUnit = window.selectedResultUnits?.power || "kW";
    const torqueUnit = window.selectedResultUnits?.torque || "Nm";

    const outputs = {

       [`(1) Accel Torque (${torqueUnit})`]: parseFloat(convertResultValue(rmsresults.accelTorque, 'torque', torqueUnit).toFixed(3)),
       [`(2) RMS Torque (${torqueUnit})`]: parseFloat(convertResultValue(rmsresults.rmsTorque, 'torque', torqueUnit).toFixed(3)),
       [`(3) Required Motor Power (${powerUnit})`]: parseFloat(convertResultValue(rmsresults.contPower, 'power', powerUnit).toFixed(3))
    };
    displayStandardResults(outputs);
}

function sizeGenericRotaryMotor(params) {
    const {
      inertia,              // kg·m²
      targetSpeed,          // rad/s
      accelTime,            // s
      runTime,              // s
      decelTime,            // s
      restTime,             // s
      frictionTorque,       // Nm
    } = params;

    const totalCycleTime = accelTime + runTime + decelTime + restTime;
    const g = 9.81;

    // Acceleration torque = J * α = J * ω / t
    const accelTorque = (inertia * (targetSpeed / accelTime)) + frictionTorque; // Nm

    // RMS Torque Calculation
    const rmsTorque = Math.sqrt(
      (
        (accelTorque ** 2 * accelTime) +
        (frictionTorque ** 2 * runTime) +
        (accelTorque ** 2 * decelTime) +
        (0 ** 2 * restTime)
      ) / totalCycleTime
    );
   
    // Continuous power (W)
    const contPower = rmsTorque * targetSpeed;
   
    return {
      targetSpeed: targetSpeed,
      accelTorque: accelTorque,
      rmsTorque: rmsTorque,
      contPower: contPower,
      contPowerHP: contPower / 745.7
    };
}

