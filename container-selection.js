// Handles left container selection (only one selectable at a time)
document.addEventListener('DOMContentLoaded', function() {
  var leftContainers = document.querySelectorAll('.selectable-container');
  var drivePnAnalyzer = document.getElementById('drive-pn-analyzer');
  var applicationCalculator = document.getElementById('application-calculator');
  var brusatoriToDl4 = document.getElementById('brusatori-to-dl4');
  var driveErrorHelp = document.getElementById('drive-error-help');
  var driveTroubleshootingFAQ = document.getElementById('drive-troubleshooting-faq');
  // Add more right containers here if needed

  leftContainers.forEach(function(el) {
    el.addEventListener('click', function() {
      leftContainers.forEach(function(other) {
        other.classList.remove('selected');
      });
      el.classList.add('selected');

      // Show/hide right display based on selection
      if (el.id === 'container-left') {
        if (drivePnAnalyzer){
          drivePnAnalyzer.style.display = '';
        }
        if (applicationCalculator) {
          applicationCalculator.style.display = 'none'; 
        }
        if (brusatoriToDl4) {
          brusatoriToDl4.style.display = 'none'; 
        }
        if (driveErrorHelp) {
          driveErrorHelp.style.display = 'none';
        }       
        if (driveTroubleshootingFAQ) {
          driveTroubleshootingFAQ.style.display = 'none';
        }
        var selects = drivePnAnalyzer.querySelectorAll('select');
        selects.forEach(function(select) {
          select.style.marginBottom = '18px';
          select.style.width = '100%';
        });
        document.getElementById('productLine').style.marginBottom = '0px';

      } else if (el.id === 'container-left-bottom') {
        if (drivePnAnalyzer) drivePnAnalyzer.style.display = 'none';
        if (applicationCalculator) applicationCalculator.style.display = '';
        applicationCalculator.querySelectorAll('select').forEach(function(select) {
          });
        if (brusatoriToDl4) {
          brusatoriToDl4.style.display = 'none'; 
        }
        if (driveErrorHelp) {
          driveErrorHelp.style.display = 'none';
        }
        if (driveTroubleshootingFAQ) {
          driveTroubleshootingFAQ.style.display = 'none';
        }
      } else if (el.id === 'container-left-brusatori-to-dl4') {
        if (drivePnAnalyzer){
          drivePnAnalyzer.style.display = 'none';
        }
        if (applicationCalculator) {
          applicationCalculator.style.display = 'none'; 
        }
        if (brusatoriToDl4) {
          brusatoriToDl4.style.display = '';
        }
        if (driveErrorHelp) {
          driveErrorHelp.style.display = 'none';
        }
        if (driveTroubleshootingFAQ) {
          driveTroubleshootingFAQ.style.display = 'none';
        }
      } else if (el.id === 'container-left-drive-error-help') {
        if (drivePnAnalyzer){
          drivePnAnalyzer.style.display = 'none';
        }
        if (applicationCalculator) {
          applicationCalculator.style.display = 'none'; 
        }
        if (brusatoriToDl4) {
          brusatoriToDl4.style.display = 'none';
        }
        if (driveErrorHelp) {
          driveErrorHelp.style.display = '';
        }
        if (driveTroubleshootingFAQ) {
          driveTroubleshootingFAQ.style.display = 'none';
        }
      } else if (el.id === 'container-left-drive-troubleshooting-faq') {
        if (drivePnAnalyzer){
          drivePnAnalyzer.style.display = 'none';
        }
        if (applicationCalculator) {
          applicationCalculator.style.display = 'none'; 
        }
        if (brusatoriToDl4) {
          brusatoriToDl4.style.display = 'none';
        }
        if (driveErrorHelp) {
          driveErrorHelp.style.display = 'none';
        }
        if (driveTroubleshootingFAQ) {
          driveTroubleshootingFAQ.style.display = '';
        }
      } else {
        if (drivePnAnalyzer) drivePnAnalyzer.style.display = 'none';
        if (applicationCalculator) applicationCalculator.style.display = 'none';
        if (brusatoriToDl4) brusatoriToDl4.style.display = 'none';
        if (driveErrorHelp) {driveErrorHelp.style.display = 'none';}
        if (driveTroubleshootingFAQ) {driveTroubleshootingFAQ.style.display = 'none';}
    };
  });

  // Optionally, select the first container by default, 0 based index
  if (leftContainers[1]) {
    leftContainers[1].click();
  }
});});
