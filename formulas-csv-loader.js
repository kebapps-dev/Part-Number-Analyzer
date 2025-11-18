// formulas-csv-loader.js
// Optional CSV-based formula loader - loads formulas from csv/formulas.csv
// Set window.USE_CSV_FORMULAS = true to enable this instead of formulas.js

(function(){
  'use strict';

  // Only load if enabled
  if (!window.USE_CSV_FORMULAS) {
    console.log('CSV formulas disabled. Using formulas.js (set window.USE_CSV_FORMULAS = true to enable CSV)');
    return;
  }

  console.log('Loading formulas from CSV...');

  // Check if PapaParse is available
  if (!window.Papa) {
    console.error('PapaParse is required for CSV formulas. Please include papaparse in your HTML.');
    return;
  }

  // Parse the CSV and build formula objects
  window.Papa.parse('csv/formulas.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    comments: '#',
    complete: function(results){
      try {
        const rows = results.data || [];
        console.log(`Loaded ${rows.length} formulas from CSV`);

        // Build formula objects grouped by application
        const formulasByApp = {};

        rows.forEach(row => {
          const app = (row.Application || 'general').toLowerCase();
          const name = (row.FormulaName || '').trim();
          const params = (row.Parameters || '').split('|').map(p => p.trim()).filter(p => p);
          const expr = (row.Expression || '').trim();
          const desc = (row.Description || '').trim();
          const unit = (row.Unit || '').trim();

          if (!name || !expr) {
            console.warn('Skipping invalid formula row:', row);
            return;
          }

          // Create the function dynamically
          try {
            // Build function from expression and parameters
            const func = new Function(...params, `return ${expr};`);
            
            // Store metadata
            func.description = desc;
            func.unit = unit;
            func.params = params;

            // Initialize app group if needed
            if (!formulasByApp[app]) {
              formulasByApp[app] = {};
            }

            // Add formula to the group
            formulasByApp[app][name] = func;

          } catch (err) {
            console.error(`Failed to create formula "${name}":`, err);
          }
        });

        // Expose formulas globally (matching formulas.js structure)
        window.formulas = formulasByApp.general || formulasByApp.pump || {};
        window.liftformulas = formulasByApp.lift || {};
        window.rotarytableformulas = formulasByApp.rotarytable || {};
        window.conveyorformulas = formulasByApp.conveyor || {};
        window.genericrotaryformulas = formulasByApp.genericrotary || {};
        window.blowerformulas = formulasByApp.blower || {};
        window.leadscrewformulas = formulasByApp.leadscrew || {};

        // Also merge pump formulas into main formulas object (for backwards compatibility)
        if (formulasByApp.pump) {
          Object.assign(window.formulas, formulasByApp.pump);
        }

        console.log('✓ CSV formulas loaded successfully');
        console.log('Available formula groups:', Object.keys(formulasByApp));

        // Expose a debug helper
        window.__inspectFormula = function(app, name) {
          const appFormulas = formulasByApp[app.toLowerCase()];
          if (!appFormulas) {
            console.log('Available applications:', Object.keys(formulasByApp));
            return;
          }
          const formula = appFormulas[name];
          if (!formula) {
            console.log('Available formulas for ' + app + ':', Object.keys(appFormulas));
            return;
          }
          console.log('Formula:', name);
          console.log('Description:', formula.description);
          console.log('Parameters:', formula.params.join(', '));
          console.log('Unit:', formula.unit);
          console.log('Function:', formula.toString());
        };

      } catch (err) {
        console.error('Error processing formulas CSV:', err);
      }
    },
    error: function(err){
      console.error('Failed to load formulas CSV:', err);
      console.log('Falling back to formulas.js');
    }
  });

})();
