document.addEventListener("DOMContentLoaded", function() {
  var h1 = document.getElementsByTagName('h1');
  if (h1.length > 0) {
    h1[0].innerText = h1[0].innerText + ' \'Allo';
  }
}, false);
