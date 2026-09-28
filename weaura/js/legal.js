/* =========================================================
   Páginas legais (Política de Privacidade / Termos de Uso)
   Mesmo header, menu mobile e footer do site principal.
   ========================================================= */
(function () {
  "use strict";

  var Config = window.WeAuraConfig;
  var header = document.getElementById("header");
  var hero = document.querySelector(".lp-hero");
  var menu = document.getElementById("mobile-menu");
  var toggle = document.getElementById("menu-toggle");

  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>';

  // Ano atual
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Links de WhatsApp (mesma mensagem padrão do site)
  if (Config) {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      el.setAttribute("href", Config.getWhatsAppLink(Config.WHATSAPP_MESSAGES[el.getAttribute("data-wa")]));
    });
  }

  // Abrindo o arquivo direto no computador, pastas não carregam o index.html sozinhas
  if (location.protocol === "file:") {
    document.querySelectorAll("[data-page-link]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (!h) return;
      var hash = "";
      var i = h.indexOf("#");
      if (i >= 0) { hash = h.slice(i); h = h.slice(0, i); }
      if (h.slice(-1) === "/") a.setAttribute("href", h + "index.html" + hash);
    });
  }

  // Menu mobile
  function setMenu(open) {
    menu.classList.toggle("mobile-menu--open", open);
    header.classList.toggle("header--menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggle.innerHTML = open ? ICON_CLOSE : ICON_MENU;
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && menu) {
    toggle.innerHTML = ICON_MENU;
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("mobile-menu--open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // Header: vira barra flutuante ao rolar; esconde ao descer, volta ao subir
  var lastY = window.scrollY;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    header.classList.toggle("header--solid", y > 40);
    var insideHero = hero && hero.getBoundingClientRect().bottom > header.offsetHeight;
    if (insideHero || menu.classList.contains("mobile-menu--open")) {
      header.classList.remove("nav-hidden");
      lastY = y;
    } else if (Math.abs(y - lastY) > 8) {
      header.classList.toggle("nav-hidden", y > lastY);
      lastY = y;
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();

  // Índice: destaca a seção visível
  var links = Array.prototype.slice.call(document.querySelectorAll(".terms-toc a"));
  if (!("IntersectionObserver" in window) || !links.length) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("is-active"); });
      if (byId[en.target.id]) byId[en.target.id].classList.add("is-active");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  document.querySelectorAll(".terms-section, .terms-contact").forEach(function (s) { io.observe(s); });
})();
