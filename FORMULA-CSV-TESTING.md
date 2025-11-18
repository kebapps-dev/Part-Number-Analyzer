# CSV Formula System - Testing Guide

## What This Is
An **optional** CSV-based formula system that lets you edit formulas in Excel instead of JavaScript. The original `formulas.js` is **not touched** - this runs in parallel.

---

## Files Created
1. **csv/formulas.csv** - All formulas in Excel-editable format
2. **formulas-csv-loader.js** - Loader script that reads the CSV
3. **FORMULA-CSV-TESTING.md** - This file

---

## How to Test It

### Step 1: Enable CSV Formulas
In your `index.html`, **before** the `formulas.js` script tag, add:

```html
<!-- Enable CSV-based formulas (optional - remove to use formulas.js) -->
<script>
  window.USE_CSV_FORMULAS = true;  // Set to false or remove to disable
</script>
<script src="formulas-csv-loader.js"></script>
```

### Step 2: Open the Application
1. Serve your project: `python -m http.server 8000`
2. Open browser console (F12)
3. You should see: `✓ CSV formulas loaded successfully`

### Step 3: Test Calculations
Try a calculation in your Application Calculator - it should work exactly the same as before.

---

## How to Edit Formulas in Excel

1. Open **csv/formulas.csv** in Excel
2. Edit any formula in the `Expression` column
3. Add new rows for new formulas
4. Save the file
5. Refresh your browser - changes take effect immediately!

### CSV Column Reference:
- **Application** - Group name (Pump, Lift, Conveyor, etc.)
- **FormulaName** - Function name (e.g., `clamparea`)
- **Description** - What the formula does
- **Parameters** - Input names separated by `|` (e.g., `mass|gravity`)
- **Unit** - Output unit (e.g., `m²`, `Nm`, `rad/s`)
- **Expression** - JavaScript formula (e.g., `mass * (gravity || 9.81)`)

---

## How to Switch Back to formulas.js

**Option 1: Remove the toggle**
Delete or comment out these lines in `index.html`:
```html
<!-- <script>window.USE_CSV_FORMULAS = true;</script> -->
<!-- <script src="formulas-csv-loader.js"></script> -->
```

**Option 2: Set the flag to false**
```html
<script>
  window.USE_CSV_FORMULAS = false;  // Uses formulas.js
</script>
```

---

## Debugging Helpers

Open browser console and try:

```javascript
// See what formula groups are loaded
console.log(Object.keys(window.formulas));

// Inspect a specific formula
__inspectFormula('Pump', 'clamparea');

// Test a formula directly
formulas.clamparea(0.1, 0.05);  // Should return area in m²
```

---

## Advantages of CSV System
✓ Edit formulas in Excel (no JavaScript knowledge needed)  
✓ Easy to add/remove formulas without touching code  
✓ See all formulas in one spreadsheet view  
✓ Can be version-controlled and shared easily  
✓ Mistakes are caught at load time (not runtime)

## When to Use Each System

**Use formulas.js when:**
- You need complex logic (multi-line functions)
- You want type safety and IDE autocomplete
- Formulas rarely change

**Use CSV formulas when:**
- Multiple people edit formulas
- Formulas change frequently
- Non-programmers maintain formulas
- You want to document all formulas in one place

---

## Removing This System Completely

If you decide you don't like it, just delete:
1. `csv/formulas.csv`
2. `formulas-csv-loader.js`
3. `FORMULA-CSV-TESTING.md` (this file)
4. The toggle script from `index.html`

Your original `formulas.js` will work exactly as before!
