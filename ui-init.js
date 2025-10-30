// ui-init.js
// Small initializer: converts inline KEB styles into reusable classes for cleaner HTML
(function(){
  function $(sel){ return document.querySelector(sel); }
  document.addEventListener('DOMContentLoaded', ()=>{
    // Apply classes for inline label and select group if present
    const kebLabel = document.querySelector('label[for="keb-identifier"]');
    if (kebLabel) kebLabel.classList.add('inline-label');
    // Find the first div that contains keb selects (naive but works for current markup)
    const kebSelects = document.querySelectorAll('#keb-input-model, #keb-input-size, #keb-input-length, #keb-input-cooling, #keb-input-speed');
    if (kebSelects && kebSelects.length){
      // wrap them by adding a class to their parent node if possible
      const parent = kebSelects[0].parentElement;
      if (parent) parent.classList.add('inline-select-group');
    }
  });
})();
