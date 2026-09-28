(function () {
  "use strict";

  var Icons = window.WeAuraIcons;
  var Config = window.WeAuraConfig;
  var Data = window.WeAuraData;

  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    renderServices();
    renderProcess();
    renderProjects();
    renderFooter();
    wireWhatsAppLinks();
    setupHeaderScroll();
    setupMobileMenu();
    setupServices();
    setupJourney();
    setupProjectForm();
    setupProjectModal();
  });

  function renderNav() {
    var links = Data.NAV_LINKS.map(function (link) {
      return '<li><a href="' + link.href + '">' + link.label + "</a></li>";
    }).join("");

    document.getElementById("nav-links").innerHTML = links;

    var mobileList = document.getElementById("mobile-nav-links");
    mobileList.innerHTML = Data.NAV_LINKS.map(function (link) {
      return '<li><a href="' + link.href + '" class="mobile-nav-link">' + link.label + "</a></li>";
    }).join("");

    mobileList.querySelectorAll(".mobile-nav-link").forEach(function (a) {
      a.addEventListener("click", closeMobileMenu);
    });
  }


  /* ---------- Serviços: lista + palco com previews ---------- */

  function k(cls) {
    return '<span class="k ' + cls + '"></span>';
  }
  function repeat(str, n) {
    var out = "";
    for (var i = 0; i < n; i++) out += str;
    return out;
  }
  function browser(inner) {
    return (
      '<div class="mk mk--browser"><div class="mk__bar"><i></i><i></i><i></i><span class="mk__url"></span></div>' +
      '<div class="mk__body">' + inner + "</div></div>"
    );
  }
  function phone(inner) {
    return '<div class="mk mk--phone"><span class="mk__notch"></span><div class="mk__body">' + inner + "</div></div>";
  }

  // Cada preview é um esboço abstrato (blocos, não texto) do que o serviço entrega.
  // [data-piece] = partes que "se montam" na troca (animadas em animations.js).
  var PREVIEWS = {
    site: function () {
      return browser(
        '<div class="mk-row mk-row--between" data-piece>' + k("k--logo") +
          '<span class="mk-row">' + repeat(k("k--nav"), 3) + "</span></div>" +
        '<div class="mk-split" data-piece><div class="mk-col">' +
          k("k--title") + k("k--title k--w60") + k("k--line") + k("k--line k--w80") + k("k--pill") +
          "</div>" + k("k--img") + "</div>" +
        '<div class="mk-grid3" data-piece>' + repeat(k("k--card"), 3) + "</div>"
      );
    },
    landing: function () {
      return browser(
        '<div class="mk-col mk-col--center" data-piece>' +
          k("k--eyebrow") + k("k--title k--w80") + k("k--title k--w60") + k("k--line k--w70") + "</div>" +
        '<div class="mk-col mk-col--center" data-piece><span class="k k--pill k--cta" data-pulse></span></div>' +
        '<div class="mk-form" data-piece>' + k("k--input") + k("k--input") + k("k--pill k--wide") + "</div>"
      );
    },
    onepage: function () {
      return browser(
        '<div class="mk-scroll" data-scroll>' +
          '<div class="mk-col mk-col--center" data-piece>' + k("k--avatar k--lg") + k("k--title k--w60") + k("k--line k--w80") + "</div>" +
          '<div class="mk-grid2" data-piece>' + repeat(k("k--card"), 2) + "</div>" +
          '<div class="mk-col" data-piece>' + k("k--line") + k("k--line k--w80") + k("k--line k--w60") + "</div>" +
          '<div class="mk-col" data-piece>' + k("k--img k--banner") + "</div>" +
          '<div class="mk-col mk-col--center" data-piece>' + k("k--title k--w60") + k("k--pill") + "</div>" +
          '<div class="mk-grid3" data-piece>' + repeat(k("k--card k--short"), 3) + "</div>" +
        "</div>"
      );
    },
    bio: function () {
      return phone(
        '<div class="mk-col mk-col--center" data-piece>' + k("k--avatar k--lg") + k("k--title k--w50") + k("k--line k--w70") + "</div>" +
        repeat('<span class="k k--link" data-piece></span>', 4) +
        '<div class="mk-row mk-row--center" data-piece>' + repeat(k("k--dot"), 3) + "</div>"
      );
    },
    // Galeria editorial: miniaturas de projetos em formatos diferentes,
    // levemente sobrepostas. Camadas: .gal (entrada) > .gal__drift (parallax
    // do scroll) > .gal__card (foco no loop) — cada uma anima uma coisa só.
    portfolio: function () {
      function card(n, depth, inner) {
        return (
          '<figure class="gal gal--' + n + '" data-piece><span class="gal__drift" data-drift="' + depth + '">' +
          '<span class="gal__card" data-gal>' + inner + "</span></span></figure>"
        );
      }
      function meta(n, chip) {
        return '<span class="gal__meta"><em>0' + n + "</em><i></i>" + (chip ? '<span class="gal__chip"></span>' : "") + "</span>";
      }
      return (
        '<div class="mk-gallery">' +
          // 01 · site: hero com navegação, título e botão sobre imagem com aura
          card(1, -10,
            '<span class="gal__bar"><i></i><i></i><i></i><span class="gal__url"></span></span>' +
            '<span class="gal__img gal__img--site">' +
              '<span class="gal__nav"><b></b><i></i><i></i><i></i></span>' +
              '<span class="gal__headline"><i></i><i></i></span>' +
              '<span class="gal__cta"></span>' +
            "</span>" + meta(1, true)) +
          // 02 · pôster de marca: o arco da identidade WeAura
          card(2, 12, '<span class="gal__img gal__img--poster"><span class="gal__arch"></span></span>' + meta(2)) +
          // 03 · identidade visual: tipografia + paleta
          card(3, -16,
            '<span class="gal__img gal__img--brand"><span class="gal__type">Aa</span></span>' +
            '<span class="gal__swatches"><i></i><i></i><i></i></span>') +
          // 04 · página de galeria
          card(4, 8, '<span class="gal__tiles"><i></i><i></i><i></i></span>' + meta(4)) +
        "</div>"
      );
    },
    catalog: function () {
      return browser(
        '<div class="mk-row mk-row--between" data-piece>' + k("k--title k--w40") + k("k--pill k--sm") + "</div>" +
        '<div class="mk-grid3">' +
          repeat('<div class="mk-tile" data-piece>' + k("k--img") + k("k--line k--w80") + k("k--price") + "</div>", 6) +
        "</div>"
      );
    },
    care: function () {
      return browser(
        '<div class="mk-col" data-piece>' + k("k--title k--w50") + k("k--line k--w70") + "</div>" +
        repeat('<div class="mk-check" data-piece data-check><span class="mk-check__box"></span>' + k("k--line") + "</div>", 3) +
        '<span class="mk-sweep" data-sweep></span>'
      );
    },
    speed: function () {
      return (
        '<div class="mk mk--gauge">' +
          '<div class="gauge" data-piece><svg viewBox="0 0 200 116">' +
            '<path class="gauge__track" d="M20 106 A80 80 0 0 1 180 106" pathLength="100" />' +
            '<path class="gauge__fill" data-gauge d="M20 106 A80 80 0 0 1 180 106" pathLength="100" />' +
          "</svg>" +
          '<p class="gauge__value"><span data-count>98</span></p>' +
          '<p class="gauge__label">desempenho</p></div>' +
          '<div class="mk-metrics" data-piece>' +
            repeat('<span class="mk-metric">' + k("k--line k--w40") + '<span class="mk-metric__bar"><span data-bar></span></span></span>', 3) +
          "</div>" +
        "</div>"
      );
    },
    presence: function () {
      return (
        '<div class="mk-orbit">' +
          '<span class="mk-orbit__ring"></span><span class="mk-orbit__ring mk-orbit__ring--outer"></span>' +
          '<span class="mk-orbit__core" data-piece></span>' +
          '<div class="mk-orbit__spin" data-orbit>' +
            '<span class="mk-orbit__item mk-orbit__item--1" data-piece><span class="mini mini--browser"></span></span>' +
            '<span class="mk-orbit__item mk-orbit__item--2" data-piece><span class="mini mini--phone"></span></span>' +
            '<span class="mk-orbit__item mk-orbit__item--3" data-piece><span class="mini mini--pill"></span></span>' +
            '<span class="mk-orbit__item mk-orbit__item--4" data-piece><span class="mini mini--gauge"></span></span>' +
          "</div>" +
        "</div>"
      );
    }
  };

  function renderServices() {
    var list = document.getElementById("services-list");
    var stage = document.getElementById("stage-previews");
    if (!list || !stage) return;

    list.innerHTML = Data.SERVICES.map(function (s, i) {
      var num = (i < 9 ? "0" : "") + (i + 1);
      return (
        '<li class="svc' + (i === 0 ? " is-active" : "") + (s.tone === "all" ? " svc--complete" : "") + '" data-index="' + i + '">' +
        '<button type="button" class="svc__btn" aria-pressed="' + (i === 0) + '">' +
        '<span class="svc__num">' + num + "</span>" +
        '<span class="svc__main"><span class="svc__name">' + s.name + '</span><span class="svc__desc">' + s.description + "</span></span>" +
        '<span class="svc__group">' + s.group + "</span>" +
        "</button></li>"
      );
    }).join("");

    stage.innerHTML = Data.SERVICES.map(function (s, i) {
      return '<div class="pv pv--' + s.preview + (i === 0 ? " is-active" : "") + '" data-preview="' + s.preview + '">' +
        PREVIEWS[s.preview]() + "</div>";
    }).join("");
  }

  /* ---------- Processo: jornada ---------- */

  function renderProcess() {
    var list = document.getElementById("process-list");
    list.innerHTML = Data.PROCESS_STEPS.map(function (step, i) {
      return (
        '<li class="step step--' + (i % 2 ? "right" : "left") + '">' +
        '<div class="step__card">' +
        '<span class="step__node" aria-hidden="true"></span>' +
        '<span class="step__num">' + step.number + "</span>" +
        "<h3>" + step.title + "</h3>" +
        "<p>" + step.description + "</p>" +
        "</div></li>"
      );
    }).join("");
  }

  /* ---------- Projetos: showcase editorial ---------- */

  function renderProjects() {
    var list = document.getElementById("projects-list");
    if (!list) return;

    var projects = Data.PROJECTS.filter(function (project) { return !project.hidden; });
    if (!projects.length) {
      list.closest(".projects").hidden = true;
      return;
    }

    list.innerHTML = projects.map(function (project, i) {
      var media = project.image
        ? '<img src="' + project.image + '" alt="" loading="lazy" />'
        : Icons.projectVisual[project.visualVariant] || "";
      var hasRealLink = typeof project.link === "string" && project.link.indexOf("http") === 0;
      var href = hasRealLink ? project.link : Config.getWhatsAppLink(project.message || Config.projectMessage(project.title));
      var label = project.title + " — " + project.category + " (abre em nova aba)";

      return (
        '<li class="work work--' + (i % 2 ? "even" : "odd") + ' work--tone' + (i % 3) + '">' +
        '<a class="work__media" href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="' + label + '">' +
        '<span class="work__inner"><span class="work__visual' + (project.image ? " work__visual--photo" : "") + '">' + media + "</span></span>" +
        '<span class="work__view" aria-hidden="true">Ver projeto</span>' +
        "</a>" +
        '<div class="work__info">' +
        '<p class="work__cat">' + project.category + "</p>" +
        '<h3 class="work__title">' + project.title + "</h3>" +
        '<p class="work__desc">' + project.description + "</p>" +
        '<a class="work__link link-underline" href="' + href + '" target="_blank" rel="noopener noreferrer" tabindex="-1">Ver projeto</a>' +
        "</div></li>"
      );
    }).join("");
  }

  // Footer editorial: links só em texto (sem ícones); aqui apenas o ano.
  function renderFooter() {
    var year = document.getElementById("footer-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function wireWhatsAppLinks() {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var key = el.getAttribute("data-wa");
      el.setAttribute("href", Config.getWhatsAppLink(Config.WHATSAPP_MESSAGES[key]));
    });
  }

  function setupProjectForm() {
    var form = document.getElementById("project-form");
    if (!form) return;

    var errorEl = document.getElementById("project-form-error");
    var successEl = document.getElementById("project-form-success");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nome = form.nome.value.trim();
      var area = form.area.value.trim();
      var interesse = form.interesse.value;

      if (!nome || !area || !interesse) {
        errorEl.textContent = "Preencha nome, área de atuação e interesse inicial para continuar.";
        errorEl.hidden = false;
        return;
      }

      errorEl.hidden = true;

      var message =
        "Olá! Meu nome é " +
        nome +
        ". Atuo em \"" +
        area +
        "\" e meu interesse inicial é: " +
        interesse +
        ".";

      window.open(Config.getWhatsAppLink(message), "_blank", "noopener,noreferrer");

      form.hidden = true;
      successEl.hidden = false;
    });
  }

  // "Conversar sobre um projeto" (nav): abre o card do Contato num modal.
  // Não há um segundo formulário: o mesmo .cta__form-card é movido para o
  // modal ao abrir e devolvido ao seu lugar ao fechar (lógica de envio intacta).
  function setupProjectModal() {
    var modal = document.getElementById("project-modal");
    var card = document.querySelector(".cta__form-card");
    var triggers = document.querySelectorAll("[data-project-modal]");
    if (!modal || !card || !triggers.length) return;

    var body = document.getElementById("project-modal-body");
    var dialog = modal.querySelector(".project-modal__dialog");
    var closeBtn = modal.querySelector(".project-modal__close");
    var placeholder = document.createComment("project-form-card");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var vv = window.visualViewport;
    var lastFocus = null;
    var closeTimer = null;
    var prevOverflow = { html: "", body: "" };

    closeBtn.innerHTML = Icons.ui.close;
    dialog.setAttribute("tabindex", "-1");

    // Acompanha a área realmente visível (teclado virtual no mobile).
    function fitViewport() {
      if (!vv) return;
      modal.style.setProperty("--modal-vh", vv.height + "px");
      modal.style.setProperty("--modal-top", vv.offsetTop + "px");
    }

    function focusables() {
      return Array.prototype.filter.call(
        dialog.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"),
        function (el) { return !el.disabled && el.offsetParent !== null; }
      );
    }

    function open(trigger) {
      if (!modal.hidden && modal.classList.contains("is-open")) return;
      clearTimeout(closeTimer);
      lastFocus = trigger || document.activeElement;

      // Vindo do menu móvel: fecha o menu e, ao sair do modal, devolve o foco ao botão do menu.
      var mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu.contains(lastFocus)) lastFocus = document.getElementById("menu-toggle");
      if (mobileMenu.classList.contains("mobile-menu--open")) closeMobileMenu();

      if (card.parentNode !== body) {
        card.parentNode.insertBefore(placeholder, card);
        body.appendChild(card);
      }

      prevOverflow.html = document.documentElement.style.overflow;
      prevOverflow.body = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      fitViewport();
      if (vv) {
        vv.addEventListener("resize", fitViewport);
        vv.addEventListener("scroll", fitViewport);
      }

      modal.hidden = false;
      body.scrollTop = 0;
      void modal.offsetWidth; // garante a transição de entrada
      modal.classList.add("is-open");
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", "true"); });

      // No toque, foca o diálogo (não abre o teclado sozinho); com mouse/teclado, o 1º campo.
      var first = card.querySelector("input:not([hidden])");
      var target = window.matchMedia("(pointer: fine)").matches && first && first.offsetParent ? first : dialog;
      target.focus({ preventScroll: true });
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });

      if (vv) {
        vv.removeEventListener("resize", fitViewport);
        vv.removeEventListener("scroll", fitViewport);
      }

      document.documentElement.style.overflow = prevOverflow.html;
      document.body.style.overflow = prevOverflow.body;

      closeTimer = setTimeout(function () {
        modal.hidden = true;
        if (placeholder.parentNode) {
          placeholder.parentNode.insertBefore(card, placeholder);
          placeholder.parentNode.removeChild(placeholder);
        }
      }, reduceMotion.matches ? 0 : 320);

      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    triggers.forEach(function (t) {
      t.setAttribute("aria-expanded", "false");
      t.addEventListener("click", function (event) {
        event.preventDefault();
        open(t);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target.closest("[data-modal-close]")) close();
    });

    // Campo focado nunca fica escondido atrás do teclado virtual.
    body.addEventListener("focusin", function (event) {
      var el = event.target;
      if (!el.matches("input, select, textarea")) return;
      setTimeout(function () { el.scrollIntoView({ block: "nearest" }); }, 300);
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return;
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === firstEl || document.activeElement === dialog)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    });
  }

  function setupHeaderScroll() {
    var header = document.getElementById("header");
    var hero = document.getElementById("inicio");
    var mobileMenu = document.getElementById("mobile-menu");
    var ticking = false;
    var lastY = window.scrollY;
    var DELTA = 8;

    function update() {
      var currentY = window.scrollY;

      header.classList.toggle("header--solid", currentY > 40);

      var insideHero = hero.getBoundingClientRect().bottom > header.offsetHeight;
      var menuOpen = mobileMenu.classList.contains("mobile-menu--open");

      if (insideHero || menuOpen) {
        header.classList.remove("nav-hidden");
        lastY = currentY;
      } else {
        var delta = currentY - lastY;
        if (Math.abs(delta) > DELTA) {
          header.classList.toggle("nav-hidden", delta > 0);
          lastY = currentY;
        }
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  function closeMobileMenu() {
    var menu = document.getElementById("mobile-menu");
    var toggle = document.getElementById("menu-toggle");
    menu.classList.remove("mobile-menu--open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    toggle.innerHTML = Icons.ui.menu;
    document.getElementById("header").classList.remove("header--menu-open");
    document.body.style.overflow = "";
  }

  function setupMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    toggle.innerHTML = Icons.ui.menu;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("mobile-menu--open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      toggle.innerHTML = isOpen ? Icons.ui.close : Icons.ui.menu;
      document.getElementById("header").classList.toggle("header--menu-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMobileMenu();
    });
  }

  // Estado da seção Serviços. Funciona sem GSAP: o item ativo muda por
  // rolagem (quando cruza uma linha da tela), hover, foco ou clique.
  // A animação da troca fica em animations.js (evento "services:change").
  function setupServices() {
    var list = document.getElementById("services-list");
    var stage = document.getElementById("services-stage");
    if (!list || !stage) return;

    var items = Array.prototype.slice.call(list.querySelectorAll(".svc"));
    var previews = Array.prototype.slice.call(stage.querySelectorAll(".pv"));
    var groupEl = document.getElementById("stage-group");
    var countEl = document.getElementById("stage-count");
    var total = (items.length < 10 ? "0" : "") + items.length;
    var current = 0;

    function setActive(i) {
      if (i === current || !items[i]) return;
      var prev = current;
      current = i;
      items.forEach(function (li, n) {
        li.classList.toggle("is-active", n === i);
        li.querySelector(".svc__btn").setAttribute("aria-pressed", String(n === i));
      });
      previews[prev].classList.remove("is-active");
      previews[i].classList.add("is-active");

      var s = Data.SERVICES[i];
      stage.setAttribute("data-tone", s.tone);
      groupEl.textContent = s.group;
      countEl.textContent = (i < 9 ? "0" : "") + (i + 1) + " / " + total;

      stage.dispatchEvent(new CustomEvent("services:change", {
        detail: { from: previews[prev], to: previews[i], index: i }
      }));
    }

    list.addEventListener("click", function (e) {
      var li = e.target.closest(".svc");
      if (li) setActive(Number(li.getAttribute("data-index")));
    });
    list.addEventListener("focusin", function (e) {
      var li = e.target.closest(".svc");
      if (li) setActive(Number(li.getAttribute("data-index")));
    });
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      items.forEach(function (li, n) {
        li.addEventListener("mouseenter", function () { setActive(n); });
      });
    }

    // Linha de ativação: meio da tela no desktop; mais abaixo no mobile,
    // onde o palco fica fixo no topo.
    var mq = window.matchMedia("(max-width: 900px)");
    var observer = null;
    function observe() {
      if (observer) observer.disconnect();
      if (!("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(Number(entry.target.getAttribute("data-index")));
        });
      }, { rootMargin: mq.matches ? "-70% 0px -29% 0px" : "-50% 0px -49% 0px" });
      items.forEach(function (li) { observer.observe(li); });
    }
    observe();
    if (mq.addEventListener) mq.addEventListener("change", observe);
  }

  // Traça o caminho orgânico da jornada passando pelo centro de cada etapa.
  // Recalcula ao redimensionar; animations.js desenha o traço com o scroll.
  function setupJourney() {
    var journey = document.getElementById("journey");
    if (!journey) return;
    var svg = journey.querySelector(".journey__svg");
    var paths = journey.querySelectorAll("path");
    var nodes = journey.querySelectorAll(".step__node");
    if (!nodes.length) return;

    // Medidas de layout (offset*), não getBoundingClientRect: a seção pode
    // estar com scale aplicado pelo GSAP e isso distorceria o traçado.
    function offsetIn(el) {
      var x = 0, y = 0;
      while (el && el !== journey) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return { x: x, y: y };
    }

    function build() {
      var w = journey.clientWidth;
      var h = journey.clientHeight;
      // O CSS põe cada ponto no meio do bloco de texto, do lado da linha;
      // aqui o caminho só liga os pontos.
      var pts = Array.prototype.map.call(nodes, function (node) {
        var o = offsetIn(node);
        return { x: o.x + node.offsetWidth / 2, y: o.y + node.offsetHeight / 2 };
      });
      // Início e fim espelhados, para a onda entrar e sair da seção com o
      // mesmo ritmo das curvas do meio.
      var mid = pts.reduce(function (sum, p) { return sum + p.x; }, 0) / pts.length;
      pts.unshift({ x: 2 * mid - pts[0].x, y: 0 });
      pts.push({ x: 2 * mid - pts[pts.length - 1].x, y: h });

      // Tangente vertical em cada ponto: ele vira o pico da curva, e o texto
      // fica encaixado na concavidade, com a linha contornando-o.
      var d = "M" + pts[0].x.toFixed(1) + " 0";
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1];
        var b = pts[i];
        var dy = b.y - a.y;
        d += " C" + a.x.toFixed(1) + " " + (a.y + dy * 0.5).toFixed(1) +
             " " + b.x.toFixed(1) + " " + (b.y - dy * 0.5).toFixed(1) +
             " " + b.x.toFixed(1) + " " + b.y.toFixed(1);
      }

      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      Array.prototype.forEach.call(paths, function (p) { p.setAttribute("d", d); });
      journey.dispatchEvent(new CustomEvent("journey:built"));
    }

    var timer;
    build();
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(build, 150);
    });
    window.addEventListener("load", build);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  }

})();
