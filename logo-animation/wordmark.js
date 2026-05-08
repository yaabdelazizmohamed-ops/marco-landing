/**
 * Marco — wordmark scroll behavior
 *
 * OPEN [Marco]  →  cuando el usuario está en el top de la página (scrollY ≤ umbral).
 * CLOSED [Σ]    →  en cuanto el navbar recibe la clase .scrolled (scroll hacia abajo).
 *
 * Solo afecta a .navbar .nav-brand; el footer usa nb-active en el HTML directamente.
 */
(function () {
  'use strict';

  var navBrands = document.querySelectorAll('.navbar .nav-brand');
  var THRESHOLD = 50; // px — mismo umbral que añade .scrolled al navbar

  function sync() {
    var atTop = window.pageYOffset <= THRESHOLD;
    navBrands.forEach(function (brand) {
      brand.classList.toggle('nb-active', atTop);
    });
  }

  // Estado inicial correcto desde el primer render
  sync();

  window.addEventListener('scroll', sync, { passive: true });
})();
