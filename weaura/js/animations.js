/* =========================================================
   WeAura Co — animações com GSAP + ScrollTrigger
   Substitui o antigo reveal.js e hero-parallax.js.

   Tudo aqui é "camada extra": sem GSAP, ou com "reduzir movimento"
   ativado no sistema, o site aparece completo e estático.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("gsap-pending");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- utilitários ---------- */

  // Quebra o texto de um elemento em palavras (<span class="w"><span class="w__i">),
  // preservando <b>, <strong> e <br>. Devolve a lista de .w__i para animar.
  function splitWords(el) {
    if (!el) return [];
    if (el._words) return el._words;
    var words = [];
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var outer = document.createElement("span");
            outer.className = "w";
            outer.setAttribute("aria-hidden", "true");
            var inner = document.createElement("span");
            inner.className = "w__i";
            inner.textContent = part;
            outer.appendChild(inner);
            frag.appendChild(outer);
            words.push(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    })(el);

    el._words = words;
    return words;
  }

  // "Respiração" da aura em volta da marca. Núcleo e anel têm durações
  // diferentes e fora de fase, então o ciclo nunca se repete igual.
  // soft = amplitudes menores (mobile).
  function auraBreath(halo, soft) {
    if (!halo) return;
    var k = soft ? 0.5 : 1;
    var core = halo.querySelector(".hero__halo-core");
    var ring = halo.querySelector(".hero__halo-ring");
    var loop = { ease: "sine.inOut", repeat: -1, yoyo: true };

    return [
      gsap.fromTo(core,
        { scale: 1 - 0.05 * k, opacity: 1 - 0.3 * k },
        Object.assign({ scale: 1 + 0.05 * k, opacity: 1, duration: 7.5 }, loop)),
      gsap.fromTo(core, { xPercent: -2 * k }, Object.assign({ xPercent: 2 * k, duration: 13 }, loop)),
      gsap.fromTo(ring,
        { scale: 1 - 0.04 * k, opacity: 1 - 0.5 * k, rotation: -3 * k },
        Object.assign({ scale: 1 + 0.07 * k, opacity: 1, rotation: 3 * k, duration: 9.8, delay: -3.2 }, loop))
    ];
  }

  // Feixes de luz: cada um oscila (ângulo, posição, largura, intensidade)
  // num ritmo próprio, como luz natural passando por uma janela.
  function beamsLoop(scope) {
    var tweens = [];
    gsap.utils.toArray(scope + " .hero__beam").forEach(function (beam, i) {
      var loop = { ease: "sine.inOut", repeat: -1, yoyo: true };
      tweens.push(
        gsap.to(beam, Object.assign({
          rotation: gsap.utils.random(-4, 4),
          xPercent: gsap.utils.random(-35, 35),
          scaleX: gsap.utils.random(0.75, 1.3),
          duration: gsap.utils.random(12, 18)
        }, loop)),
        // Começa depois da entrada para não brigar com o fade inicial.
        gsap.to(beam, Object.assign({
          opacity: gsap.utils.random(0.35, 0.6),
          duration: gsap.utils.random(7, 11),
          delay: 3 + i * 1.3
        }, loop))
      );
    });
    return tweens;
  }

  // Poeira de luz: poucos pontos subindo devagar, acendendo e apagando.
  // Cada um começa num ponto aleatório do ciclo, então o ambiente já "está vivo".
  function motes(container, count) {
    if (!container) return [];
    var rnd = gsap.utils.random;
    var tweens = [];
    for (var i = 0; i < count; i++) {
      var m = document.createElement("span");
      m.className = "hero__mote";
      m.style.left = rnd(4, 96) + "%";
      m.style.top = rnd(12, 92) + "%";
      container.appendChild(m);

      var dur = rnd(10, 16);
      var tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(m, { x: 0, y: 0 }, { x: rnd(-40, 40), y: -rnd(60, 160), duration: dur, ease: "none" }, 0)
        .fromTo(m, { opacity: 0 }, { opacity: rnd(0.25, 0.7), duration: dur * 0.35, ease: "sine.inOut" }, 0)
        .to(m, { opacity: 0, duration: dur * 0.4, ease: "sine.inOut" }, dur * 0.6);
      tl.progress(Math.random());
      tweens.push(tl);
    }
    return tweens;
  }

  // Luz sobre o nome. Em repouso percorre um caminho lento (Lissajous);
  // com cursor, desliza até ele com atraso. Só muda duas variáveis CSS —
  // as letras nunca se movem.
  function wordmarkLight(el) {
    var cur = { x: 32, y: 38 };
    var mouse = null;
    var t0 = gsap.ticker.time;

    function tick(time, delta, frame, deltaRatio) {
      var t = time - t0;
      var tx = mouse ? mouse.x : 50 + 30 * Math.sin(t * 0.21);
      var ty = mouse ? mouse.y : 42 + 22 * Math.sin(t * 0.29 + 1.2);
      var f = 1 - Math.pow(1 - (mouse ? 0.06 : 0.03), deltaRatio);
      var nx = cur.x + (tx - cur.x) * f;
      var ny = cur.y + (ty - cur.y) * f;
      if (Math.abs(nx - cur.x) + Math.abs(ny - cur.y) < 0.02) return;
      cur.x = nx;
      cur.y = ny;
      el.style.setProperty("--lx", nx.toFixed(2) + "%");
      el.style.setProperty("--ly", ny.toFixed(2) + "%");
    }

    return {
      cur: cur,
      start: function () { gsap.ticker.remove(tick); gsap.ticker.add(tick); },
      stop: function () { gsap.ticker.remove(tick); },
      point: function (clientX, clientY) {
        var r = el.getBoundingClientRect();
        mouse = {
          x: gsap.utils.clamp(-15, 115, ((clientX - r.left) / r.width) * 100),
          y: gsap.utils.clamp(-40, 140, ((clientY - r.top) / r.height) * 100)
        };
      },
      release: function () { mouse = null; }
    };
  }

  // O ambiente percebe o visitante: luz ambiente segue o cursor, feixes
  // inclinam, e a luz sobre o nome vai até ele. Nada de texto se move.
  function heroPresence(hero, light) {
    var spot = hero.querySelector(".hero__spot");
    var beams = hero.querySelector(".hero__beams");
    var spotX = gsap.quickTo(spot, "x", { duration: 1.8, ease: "power3.out" });
    var spotY = gsap.quickTo(spot, "y", { duration: 1.8, ease: "power3.out" });
    var tilt = gsap.quickTo(beams, "rotation", { duration: 2.4, ease: "power3.out" });
    gsap.set(spot, { x: hero.offsetWidth / 2, y: hero.offsetHeight / 2 });

    function move(e) {
      var r = hero.getBoundingClientRect();
      spotX(e.clientX - r.left);
      spotY(e.clientY - r.top);
      tilt((((e.clientX - r.left) / r.width) * 2 - 1) * -2.5);
      light.point(e.clientX, e.clientY);
    }
    function enter() { gsap.to(spot, { opacity: 1, duration: 1.2, overwrite: "auto" }); }
    function leave() {
      gsap.to(spot, { opacity: 0, duration: 1.6, overwrite: "auto" });
      tilt(0);
      light.release();
    }
    hero.addEventListener("mousemove", move, { passive: true });
    hero.addEventListener("mouseenter", enter, { passive: true });
    hero.addEventListener("mouseleave", leave, { passive: true });
    return function () {
      hero.removeEventListener("mousemove", move);
      hero.removeEventListener("mouseenter", enter);
      hero.removeEventListener("mouseleave", leave);
    };
  }

  // CTA: atração magnética contida; o texto anda um pouco mais que o botão
  // (profundidade interna) e uma luz acompanha o cursor por dentro.
  function magnetic(btn) {
    var span = btn.querySelector("span");
    // Mesma linguagem do CSS (--hover-dur 0.5s, curva orgânica ≈ power3.out)
    // e deslocamento contido: o botão acompanha o cursor só alguns pixels.
    var H = { duration: 0.5, ease: "power3.out" };
    var bx = gsap.quickTo(btn, "x", H);
    var by = gsap.quickTo(btn, "y", H);
    var sx = gsap.quickTo(span, "x", H);
    var sy = gsap.quickTo(span, "y", H);

    function move(e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      bx(dx * 0.1); by(dy * 0.14);
      sx(dx * 0.05); sy(dy * 0.06);
      btn.style.setProperty("--bx", ((e.clientX - r.left) / r.width) * 100 + "%");
      btn.style.setProperty("--by", ((e.clientY - r.top) / r.height) * 100 + "%");
    }
    function enter() { gsap.to(btn, Object.assign({ scale: 1.02, overwrite: "auto" }, H)); }
    function leave() {
      bx(0); by(0); sx(0); sy(0);
      gsap.to(btn, Object.assign({ scale: 1, overwrite: "auto" }, H));
    }
    btn.addEventListener("mousemove", move, { passive: true });
    btn.addEventListener("mouseenter", enter, { passive: true });
    btn.addEventListener("mouseleave", leave, { passive: true });
    return function () {
      btn.removeEventListener("mousemove", move);
      btn.removeEventListener("mouseenter", enter);
      btn.removeEventListener("mouseleave", leave);
    };
  }

  // Parallax de mouse: só camadas de fundo/luz ([data-depth]); o texto não entra.
  function auraMouse(section) {
    if (!section) return;
    var layers = Array.prototype.slice.call(section.querySelectorAll("[data-depth]")).map(function (el) {
      return {
        depth: parseFloat(el.getAttribute("data-depth")) || 20,
        x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" })
      };
    });

    function move(e) {
      var r = section.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      layers.forEach(function (l) {
        l.x(nx * l.depth);
        l.y(ny * l.depth);
      });
    }
    function leave() {
      layers.forEach(function (l) {
        l.x(0);
        l.y(0);
      });
    }
    section.addEventListener("mousemove", move, { passive: true });
    section.addEventListener("mouseleave", leave, { passive: true });
    return function () {
      section.removeEventListener("mousemove", move);
      section.removeEventListener("mouseleave", leave);
    };
  }

  // Deriva lenta e contínua dos blobs (substitui os @keyframes do CSS antigo).
  function auraDrift(scope) {
    var tweens = [];
    gsap.utils.toArray(scope + " .aura__blob").forEach(function (blob, i) {
      tweens.push(gsap.to(blob, {
        xPercent: gsap.utils.random(-14, 14),
        yPercent: gsap.utils.random(-12, 12),
        rotation: gsap.utils.random(-25, 25),
        duration: gsap.utils.random(9, 14),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * -2
      }));
      // Deformação orgânica (estica num eixo, encolhe no outro). Começa
      // depois da entrada, que também anima a escala.
      tweens.push(gsap.to(blob, {
        scaleX: gsap.utils.random(0.88, 1.14),
        scaleY: gsap.utils.random(0.88, 1.14),
        duration: gsap.utils.random(11, 16),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3 + i
      }));
    });
    // Intensidade dos feixes pulsa devagar, cada um no seu ritmo.
    gsap.utils.toArray(scope + " .aura__layer").forEach(function (layer, i) {
      tweens.push(gsap.fromTo(layer, { opacity: 0.72 }, {
        opacity: 1,
        duration: gsap.utils.random(6, 10),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * -1.7
      }));
    });
    return tweens;
  }

  // Revelação padrão de título: palavras sobem de dentro da linha.
  function revealHeading(el, extra) {
    var words = splitWords(el);
    if (!words.length) return;
    gsap.from(words, {
      yPercent: 110,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.035,
      scrollTrigger: Object.assign(
        { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        extra || {}
      )
    });
  }

  function fadeUp(targets, trigger, opts) {
    var list = gsap.utils.toArray(targets);
    if (!list.length) return;
    gsap.from(list, Object.assign({
      y: 28,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: { trigger: trigger || list[0], start: "top 85%", toggleActions: "play none none reverse" }
    }, opts || {}));
  }

  /* ---------- montagem ---------- */

  ready(function () {
    var mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 901px)",
        compact: "(max-width: 720px)", // hero em duas etapas (ver styles.css)
        finePointer: "(hover: hover) and (pointer: fine)"
      },
      function (ctx) {
        var c = ctx.conditions;

        if (!c.motion) {
          root.classList.remove("gsap-pending");
          return;
        }

        /* ===== Barra de progresso lateral ===== */
        gsap.to("#scroll-rail-fill", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
        });

        /* ===== HERO: abertura orquestrada ===== */
        var hero = document.getElementById("inicio");
        var halo = hero.querySelector(".hero__halo");
        var wordmark = document.getElementById("hero-wordmark");
        var light = wordmarkLight(wordmark);
        var sloganWords = splitWords(document.querySelector(".hero__slogan"));
        var cleanups = [];

        // Mobile: menos pontos de luz e amplitudes menores.
        var loops = [].concat(
          auraDrift(".hero"),
          auraBreath(halo, !c.desktop),
          beamsLoop(".hero"),
          motes(hero.querySelector(".hero__motes:not(.hero__motes--near)"), c.desktop ? 14 : 6),
          motes(hero.querySelector(".hero__motes--near"), c.desktop ? 8 : 3),
          // Flutuação do nome: 3px em 7s. Presença, não deslocamento.
          gsap.fromTo(wordmark, { y: -3 }, { y: 3, duration: 7, ease: "sine.inOut", repeat: -1, yoyo: true })
        );

        // Entrada em ~2,8s: ambiente → feixes → saudação → a luz "escreve"
        // o nome → slogan → CTA. Cada etapa começa antes da anterior acabar.
        wordmark.classList.add("is-revealing");
        var intro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });
        intro
          .from(".hero .aura__blob", { scale: 0.6, autoAlpha: 0, duration: 2.6, ease: "power2.out", stagger: 0.18 }, 0)
          .from(".hero__beam", { autoAlpha: 0, scaleY: 0.6, duration: 2.4, ease: "power2.out", stagger: 0.2 }, 0.25)
          .from(".hero__motes", { autoAlpha: 0, duration: 2.2, ease: "sine.out" }, 0.5)
          .from(halo, { autoAlpha: 0, duration: 2.6, ease: "sine.out" }, 0.45)
          .from(".hero__greeting", { autoAlpha: 0, y: 6, duration: 1.2 }, 0.55)
          .fromTo(wordmark, { "--rv": "-20%" }, {
            "--rv": "100%",
            duration: 1.7,
            ease: "power2.inOut",
            onComplete: function () { wordmark.classList.remove("is-revealing"); }
          }, 0.75)
          // A luz acompanha a borda da revelação e depois assume o loop.
          .fromTo(light.cur, { x: -10 }, {
            x: 32,
            duration: 1.9,
            ease: "power2.inOut",
            onUpdate: function () { wordmark.style.setProperty("--lx", light.cur.x + "%"); },
            onComplete: light.start
          }, 0.75)
          .from(sloganWords, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.02 }, 1.5)
          .from(".header__bar > *", { autoAlpha: 0, y: -10, duration: 1, stagger: 0.08 }, 1.7);

        // Mensagem + CTA: no desktop fecham a abertura; no celular estão abaixo
        // da dobra e entram quando chegam à tela.
        if (c.compact) {
          gsap.from(".hero__lead, .hero__actions .btn", {
            autoAlpha: 0, y: 24, duration: 1, ease: "power3.out", stagger: 0.12,
            scrollTrigger: { trigger: ".hero__foot", start: "top 88%", toggleActions: "play none none reverse" }
          });
        } else {
          intro.from(".hero__lead, .hero__actions .btn", { autoAlpha: 0, y: 12, duration: 1, stagger: 0.1 }, 2);
        }

        root.classList.remove("gsap-pending");

        // Loops só rodam com o hero na tela (economia de CPU/bateria).
        ScrollTrigger.create({
          trigger: hero,
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) {
            loops.forEach(function (t) { self.isActive ? t.resume() : t.pause(); });
            if (!intro.isActive()) self.isActive ? light.start() : light.stop();
          }
        });
        cleanups.push(light.stop);

        // Transição para "Sobre": a marca se recolhe, a aura se expande e
        // um amanhecer bege sobe até virar o fundo da próxima seção.
        // Tudo em scrub → reversível e estável em trocas rápidas de direção.
        var heroOut = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 }
        });
        // O conteúdo sai para cima; a atmosfera (aura, feixes) desce em direção
        // a Serviços e se dissolve na ponte bege, que sobe da borda da seção.
        var bridge = document.querySelector(".services__bridge");
        // No celular a mensagem é lida durante o scroll: só sai no fim, e o
        // amanhecer bege espera até lá para não tirar o contraste do texto.
        var footAt = c.compact ? 0.72 : 0;
        var dawnAt = c.compact ? 0.72 : 0.05;
        heroOut
          .to(".hero__foot", { autoAlpha: 0, y: -30, duration: c.compact ? 0.2 : 0.3 }, footAt)
          .to(".hero__slogan", { autoAlpha: 0, y: -16, duration: 0.4 }, 0)
          .to(".hero__heading", { scale: 0.94, autoAlpha: 0, duration: 0.6, ease: "power1.in" }, 0.05)
          .to(".hero__stage", { yPercent: -10, duration: 1 }, 0)
          .to(halo, { scale: 1.6, duration: 1 }, 0)
          .to(".hero .aura", { scale: 1.15, yPercent: 16, duration: 1, ease: "sine.inOut" }, 0)
          .to(".hero__beams", { yPercent: 12, rotation: 3, opacity: 0.35, duration: 1, ease: "sine.inOut" }, 0)
          .to(".hero__motes", { yPercent: -12, opacity: 0.4, duration: 1 }, 0)
          .to(".hero__motes--near", { yPercent: -35, duration: 1 }, 0)
          .fromTo(".hero__dawn", { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: c.compact ? 0.28 : 0.6, ease: "sine.out" }, dawnAt);

        // Ponte: a base (bege sólido) acende logo no início — a costura some —
        // e a atmosfera cresce devagar sobre o hero. Os tons e feixes da ponte
        // deslizam na mesma direção da aura, como continuação dela.
        // No celular a costura já é escondida pela dissolução do fim do hero
        // (.hero::after); a ponte só entra depois que a mensagem sai, senão os
        // tons comprimidos formariam uma faixa sobre a emenda.
        if (bridge) {
          heroOut
            .fromTo(bridge, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "sine.out" }, c.compact ? footAt : 0)
            .fromTo(bridge, { scaleY: 0.12 }, { scaleY: 1, duration: c.compact ? 0.28 : 0.85, ease: "sine.inOut" }, c.compact ? footAt : 0)
            .fromTo(bridge.querySelector(".bridge__glow--sage"), { xPercent: -10 }, { xPercent: 12, duration: 1 }, 0)
            .fromTo(bridge.querySelector(".bridge__glow--terracotta"), { xPercent: 10 }, { xPercent: -12, duration: 1 }, 0)
            .fromTo(bridge.querySelectorAll(".bridge__beam"), { yPercent: -18, opacity: 0 }, { yPercent: 6, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.05);
        }

        if (c.finePointer) {
          cleanups.push(auraMouse(hero), heroPresence(hero, light));
          gsap.utils.toArray(".btn--magnetic").forEach(function (btn) { cleanups.push(magnetic(btn)); });
        }

        /* =====================================================
           LINGUAGEM COMUM DAS SEÇÕES
           Tudo por ScrollTrigger individual: nada fixa a tela,
           tudo reverte ao rolar para cima.
           ===================================================== */
        root.classList.add("motion");

        // Folhas: cada capítulo sobe e se assenta sobre o anterior.
        // Enquanto a folha ainda está menor que a tela, as laterais revelariam
        // o fundo do body (creme). Nesse intervalo o body assume a cor da
        // seção anterior, então a atmosfera continua até a nova tomar a tela.
        // A Essência fica de fora: ela fixa uma cena na tela (pin), e um
        // ancestral com transform quebraria esse posicionamento.
        var bodyBg = document.body.style.backgroundColor;
        // O Contato também: ele continua o fundo da Essência sem "folha".
        gsap.utils.toArray(".sheet:not(.essence):not(#contato)").forEach(function (sheet) {
          var prev = sheet.previousElementSibling;
          gsap.fromTo(sheet, { scale: 0.96, transformOrigin: "50% 0%" }, {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sheet,
              start: "top bottom",
              end: "top 55%",
              scrub: 0.6,
              // Cor lida na hora: a Essência muda de cor durante a própria cena.
              onToggle: function (self) {
                if (self.isActive && prev) document.body.style.backgroundColor = getComputedStyle(prev).backgroundColor;
              }
            }
          });
        });
        cleanups.push(function () { document.body.style.backgroundColor = bodyBg; });

        // Marcador de capítulo: ponto → fio → rótulo.
        // (o de Serviços entra junto com a transição do hero, mais abaixo)
        // (Serviços e Essência animam o marcador dentro das próprias timelines)
        gsap.utils.toArray(".chapter:not(.services .chapter):not(.essence .chapter)").forEach(function (ch) {
          var line = ch.querySelector(".chapter__line"); // nem todo marcador tem o fio
          var tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 88%", toggleActions: "play none none reverse" } })
            .from(ch.querySelector(".chapter__num"), { autoAlpha: 0, x: -10, duration: 0.7, ease: "power3.out" });
          if (line) tl.from(line, { scaleX: 0, duration: 0.9, ease: "expo.inOut" }, 0.1);
          tl.from(ch.querySelector(".chapter__label"), { autoAlpha: 0, x: -8, duration: 0.7, ease: "power3.out" }, line ? 0.4 : 0.15);
        });

        /* ===== 02 · SERVIÇOS ===== */
        // Cabeçalho e palco surgem "através" da ponte, presos ao progresso do
        // scroll: começam enquanto o hero ainda está saindo e voltam ao subir.
        var svcHead = document.querySelector(".services__head");
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: svcHead, start: "top 100%", end: "top 35%", scrub: 0.8 }
        })
          .from(svcHead.querySelector(".chapter__num"), { autoAlpha: 0, x: -10, duration: 0.25 }, 0)
          .from(svcHead.querySelector(".chapter__label"), { autoAlpha: 0, x: -8, duration: 0.25 }, 0.1)
          .from(splitWords(svcHead.querySelector("h2")), { yPercent: 110, autoAlpha: 0, duration: 0.45, stagger: 0.025 }, 0.12)
          .from(".services__intro", { autoAlpha: 0, y: 24, duration: 0.3 }, 0.55);
        gsap.fromTo(".stage", { autoAlpha: 0, y: 70, scale: 0.96 }, {
          autoAlpha: 1, y: 0, scale: 1, ease: "power1.out",
          scrollTrigger: { trigger: ".services__layout", start: "top 100%", end: "top 55%", scrub: 0.8 }
        });
        fadeUp(".svc", ".services__list", { y: 24, stagger: 0.06 });
        fadeUp(".services__outro", ".services__outro");

        var stageEl = document.getElementById("services-stage");
        var pvLoop = null;

        // Movimento próprio de cada preview (o que o serviço "faz").
        function previewLoop(pv) {
          var type = pv.getAttribute("data-preview");
          var q = function (s) { return pv.querySelectorAll(s); };
          var tl;
          if (type === "landing") {
            tl = gsap.to(q("[data-pulse]"), { scale: 1.08, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true });
          } else if (type === "onepage") {
            var scroller = pv.querySelector("[data-scroll]");
            var dist = scroller.scrollHeight - scroller.parentNode.clientHeight + 16;
            tl = gsap.to(scroller, { y: -Math.max(dist, 0), duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true, repeatDelay: 0.8, delay: 0.8 });
          } else if (type === "portfolio") {
            // O foco passa de projeto em projeto, como quem folheia um repertório:
            // o card em destaque cresce levemente e os outros recuam.
            var cards = gsap.utils.toArray(q("[data-gal]"));
            gsap.set(cards, { opacity: 1, scale: 1 }); // limpa o estado de uma passagem anterior
            tl = gsap.timeline({ repeat: -1, delay: 0.9, defaults: { duration: 1.1, ease: "sine.inOut" } });
            cards.forEach(function (card, n) {
              var t = n * 2.4;
              tl.to(cards.filter(function (o) { return o !== card; }), { opacity: 0.55, scale: 0.985 }, t)
                .to(card, { opacity: 1, scale: 1.05 }, t);
            });
            tl.to(cards, { opacity: 1, scale: 1 }, cards.length * 2.4);
          } else if (type === "care") {
            var checks = q("[data-check]");
            tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
              .fromTo(q("[data-sweep]"), { xPercent: -120 }, { xPercent: 400, duration: 2, ease: "power1.inOut" }, 0);
            Array.prototype.forEach.call(checks, function (el, i) {
              tl.call(function () { el.classList.add("is-done"); }, null, 0.5 + i * 0.5);
            });
            tl.call(function () { Array.prototype.forEach.call(checks, function (el) { el.classList.remove("is-done"); }); }, null, 3.4);
          } else if (type === "speed") {
            var counter = { v: 0 };
            var num = pv.querySelector("[data-count]");
            tl = gsap.timeline()
              .fromTo(q("[data-gauge]"), { strokeDashoffset: 100 }, { strokeDashoffset: 2, duration: 1.6, ease: "power2.out" }, 0)
              .to(counter, { v: 98, duration: 1.6, ease: "power2.out", onUpdate: function () { num.textContent = Math.round(counter.v); } }, 0)
              .fromTo(q("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out", stagger: 0.12 }, 0.3);
          } else if (type === "presence") {
            tl = gsap.timeline()
              .to(q("[data-orbit]"), { rotation: 360, duration: 26, ease: "none", repeat: -1 }, 0)
              .to(q(".mini"), { rotation: -360, duration: 26, ease: "none", repeat: -1 }, 0)
              .fromTo(q(".mk-orbit__core"), { scale: 0.92 }, { scale: 1.06, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true }, 0);
          }
          return tl || null;
        }

        // Troca: o preview anterior recua, o novo se monta peça por peça.
        function playPreview(pv) {
          if (pvLoop) { pvLoop.kill(); pvLoop = null; }
          gsap.killTweensOf(pv);
          gsap.timeline()
            .fromTo(pv, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
            .fromTo(pv.firstElementChild, { y: 18, scale: 0.97 }, { y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0)
            .fromTo(pv.querySelectorAll("[data-piece]"), { autoAlpha: 0, y: 12 }, {
              autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06
            }, 0.1);
          pvLoop = previewLoop(pv);
        }
        function onServiceChange(e) {
          gsap.killTweensOf(e.detail.from);
          gsap.to(e.detail.from, { autoAlpha: 0, y: -12, duration: 0.35, ease: "power2.in" });
          playPreview(e.detail.to);
        }
        stageEl.addEventListener("services:change", onServiceChange);

        // Portfólio: cada miniatura desliza numa velocidade própria enquanto
        // a lista rola (scrub → acompanha a descida e a subida).
        gsap.utils.toArray("[data-drift]").forEach(function (el) {
          var d = parseFloat(el.getAttribute("data-drift")) || 0;
          gsap.fromTo(el, { yPercent: -d }, {
            yPercent: d,
            ease: "none",
            scrollTrigger: { trigger: ".services__layout", start: "top bottom", end: "bottom top", scrub: 0.8 }
          });
        });

        // Loop do preview só roda com a seção na tela.
        ScrollTrigger.create({
          trigger: ".services",
          start: "top bottom",
          end: "bottom top",
          onEnter: function () { if (!pvLoop) playPreview(stageEl.querySelector(".pv.is-active")); },
          onToggle: function (self) { if (pvLoop) self.isActive ? pvLoop.resume() : pvLoop.pause(); }
        });
        cleanups.push(function () {
          stageEl.removeEventListener("services:change", onServiceChange);
          if (pvLoop) pvLoop.kill();
          gsap.set(".pv, .pv *", { clearProps: "all" });
        });

        // Luz ambiente e profundidade no palco (só com mouse).
        if (c.finePointer) {
          (function () {
            var spot = stageEl.querySelector(".stage__spot");
            var layer = document.getElementById("stage-previews");
            var sx = gsap.quickTo(spot, "x", { duration: 1.2, ease: "power3.out" });
            var sy = gsap.quickTo(spot, "y", { duration: 1.2, ease: "power3.out" });
            var lx = gsap.quickTo(layer, "x", { duration: 1.4, ease: "power3.out" });
            var ly = gsap.quickTo(layer, "y", { duration: 1.4, ease: "power3.out" });
            function move(e) {
              var r = stageEl.getBoundingClientRect();
              sx(e.clientX - r.left); sy(e.clientY - r.top);
              lx((((e.clientX - r.left) / r.width) - 0.5) * -10);
              ly((((e.clientY - r.top) / r.height) - 0.5) * -8);
            }
            function enter() { gsap.to(spot, { opacity: 1, duration: 0.8, overwrite: "auto" }); }
            function leave() { gsap.to(spot, { opacity: 0, duration: 1, overwrite: "auto" }); lx(0); ly(0); }
            stageEl.addEventListener("mousemove", move, { passive: true });
            stageEl.addEventListener("mouseenter", enter);
            stageEl.addEventListener("mouseleave", leave);
            cleanups.push(function () {
              stageEl.removeEventListener("mousemove", move);
              stageEl.removeEventListener("mouseenter", enter);
              stageEl.removeEventListener("mouseleave", leave);
            });
          })();
        }

        /* ===== 03 · PROCESSO — a luz percorre a jornada ===== */
        revealHeading(document.querySelector("#processo h2"));
        fadeUp(".process__head > p:last-child", ".process__head");

        // Aura da seção: cada feixe respira devagar (posição, ângulo e
        // intensidade, em ritmos diferentes) e desliza um pouco com o scroll.
        var paLoops = gsap.utils.toArray(".pa-beam i").map(function (el, i) {
          return gsap.fromTo(el,
            { xPercent: -10, rotation: -3, opacity: 0.55, scaleX: 0.9 },
            {
              xPercent: 12, rotation: 3, opacity: 1, scaleX: 1.1,
              duration: gsap.utils.random(12, 20),
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: i * -3.5
            });
        });
        gsap.utils.toArray(".pa-beam").forEach(function (el) {
          var d = parseFloat(el.getAttribute("data-pa")) || 0;
          gsap.fromTo(el, { yPercent: -d }, {
            yPercent: d,
            ease: "none",
            scrollTrigger: { trigger: "#processo", start: "top bottom", end: "bottom top", scrub: 1 }
          });
        });
        ScrollTrigger.create({
          trigger: "#processo",
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) { paLoops.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); }
        });

        var journey = document.getElementById("journey");
        var jLine = document.getElementById("journey-line");
        var jLight = document.getElementById("journey-light");
        var jState = { p: 0 };
        var jLen = 0;

        function renderJourney() {
          if (!jLen) return;
          jLine.style.strokeDashoffset = jLen * (1 - jState.p);
          var pt = jLine.getPointAtLength(jLen * jState.p);
          var fade = Math.min(1, jState.p / 0.02, (1 - jState.p) / 0.02);
          gsap.set(jLight, { x: pt.x, y: pt.y, opacity: Math.max(0, fade) });
        }
        function measureJourney() {
          jLen = jLine.getTotalLength ? jLine.getTotalLength() : 0;
          jLine.style.strokeDasharray = jLen;
          renderJourney();
        }
        measureJourney();
        journey.addEventListener("journey:built", measureJourney);
        gsap.to(jState, {
          p: 1,
          ease: "none",
          onUpdate: renderJourney,
          scrollTrigger: { trigger: journey, start: "top 60%", end: "bottom 60%", scrub: 0.6 }
        });
        cleanups.push(function () {
          journey.removeEventListener("journey:built", measureJourney);
          jLine.style.strokeDasharray = "";
          jLine.style.strokeDashoffset = "";
        });

        gsap.utils.toArray(".step").forEach(function (step) {
          var card = step.querySelector(".step__card");
          gsap.timeline({
            scrollTrigger: {
              trigger: step,
              start: "top 60%",
              toggleActions: "play none none reverse",
              onEnter: function () { step.classList.add("is-active"); },
              onLeaveBack: function () { step.classList.remove("is-active"); }
            }
          })
            .from(card.querySelector(".step__num"), { yPercent: 40, autoAlpha: 0, duration: 1, ease: "expo.out" })
            .from(card.querySelectorAll("h3, p"), { y: 20, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.15);
        });

        /* ===== 04 · PROJETOS — showcase ===== */
        revealHeading(document.querySelector("#projetos h2"));
        fadeUp(".projects__head > p:last-child", ".projects__head");
        fadeUp(".projects__next", ".projects__next");

        gsap.utils.toArray(".work").forEach(function (work) {
          var media = work.querySelector(".work__media");
          var inner = work.querySelector(".work__inner");
          var info = work.querySelector(".work__info");

          // A janela se abre e a imagem assenta (entrada).
          gsap.timeline({ scrollTrigger: { trigger: work, start: "top 80%", toggleActions: "play none none reverse" } })
            .fromTo(media, { clipPath: "inset(14% 10% 14% 10% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.5, ease: "expo.out" }, 0)
            .from(inner, { scale: 1.12, duration: 1.8, ease: "expo.out" }, 0)
            .from(info.querySelectorAll(".work__cat"), { autoAlpha: 0, y: 16, duration: 0.8, ease: "power3.out" }, 0.3)
            .from(splitWords(info.querySelector(".work__title")), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04 }, 0.4)
            .from(info.querySelectorAll(".work__desc, .work__link"), { autoAlpha: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.6);

          // Velocidades diferentes: imagem desliza dentro da janela; texto anda mais.
          gsap.fromTo(inner, { yPercent: -6 }, {
            yPercent: 6, ease: "none",
            scrollTrigger: { trigger: work, start: "top bottom", end: "bottom top", scrub: true }
          });
          if (c.desktop) {
            gsap.fromTo(info, { y: 60 }, {
              y: -60, ease: "none",
              scrollTrigger: { trigger: work, start: "top bottom", end: "bottom top", scrub: true }
            });
          }

          // "Ver projeto" acompanha o cursor dentro da imagem.
          if (c.finePointer) {
            var view = media.querySelector(".work__view");
            gsap.set(view, { xPercent: -50, yPercent: -50, scale: 0.6 });
            var vx = gsap.quickTo(view, "x", { duration: 0.5, ease: "power3.out" });
            var vy = gsap.quickTo(view, "y", { duration: 0.5, ease: "power3.out" });
            var pos = function (e) {
              var r = media.getBoundingClientRect();
              vx(e.clientX - r.left); vy(e.clientY - r.top);
            };
            var enter = function (e) {
              var r = media.getBoundingClientRect();
              gsap.set(view, { x: e.clientX - r.left, y: e.clientY - r.top });
              gsap.to(view, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            };
            var leave = function () { gsap.to(view, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: "power3.out", overwrite: "auto" }); };
            media.addEventListener("mousemove", pos, { passive: true });
            media.addEventListener("mouseenter", enter);
            media.addEventListener("mouseleave", leave);
            cleanups.push(function () {
              media.removeEventListener("mousemove", pos);
              media.removeEventListener("mouseenter", enter);
              media.removeEventListener("mouseleave", leave);
            });
          }
        });

        /* ===== 05 · NOSSA ESSÊNCIA — cena conduzida pelo scroll =====
           A cena fica fixa por ~1,6 tela enquanto a timeline (scrub) avança:
           marcador → frases acendem → pilares surgem costurados pelo fio →
           a atmosfera se aprofunda até o tom do Contato. Tudo reversível.
           O snap só acomoda nos marcos (labels) quando o scroll para. */
        var essence = document.getElementById("essencia");
        var scene = document.getElementById("essence-scene");
        var essChapter = scene.querySelector(".chapter");
        var essLines = scene.querySelectorAll(".essence__line");
        var pillars = gsap.utils.toArray(".pillar");
        var thread = document.getElementById("essence-thread");
        var field = scene.querySelector(".essence__field");
        var ctaBg = scene.querySelector(".essence__cta-bg");
        var threadLen = 0;
        var threadState = { p: 0 }; // quanto do fio já está desenhado (0–1)

        // Fio: curva suave passando logo abaixo de cada pilar (só no desktop).
        function buildThread() {
          if (!thread || !c.desktop) return;
          var w = field.clientWidth;
          var h = field.clientHeight;
          // O fio corre na faixa livre ENTRE as duas fileiras: sobe até logo
          // abaixo dos pilares de cima (Estratégia, Experiência) e desce até
          // logo acima dos de baixo (Design, Tecnologia). Como cada trecho é
          // uma curva monotônica entre dois pontos dessa faixa, ele nunca
          // entra na área das letras. Folgas proporcionais à fonte (inclui a
          // descendente do "g" e o topo das maiúsculas).
          var pts = pillars.map(function (p) {
            var fs = parseFloat(getComputedStyle(p).fontSize) || 60;
            var low = p.classList.contains("pillar--1") || p.classList.contains("pillar--3");
            return {
              x: p.offsetLeft + p.offsetWidth / 2,
              y: low ? p.offsetTop - fs * 0.16 : p.offsetTop + p.offsetHeight + fs * 0.3
            };
          });
          pts.unshift({ x: -w * 0.04, y: pts[0].y });
          pts.push({ x: w * 1.04, y: pts[pts.length - 1].y });
          var d = "M" + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
          for (var i = 1; i < pts.length; i++) {
            var a = pts[i - 1], b = pts[i], dx = b.x - a.x;
            d += " C" + (a.x + dx * 0.5).toFixed(1) + " " + a.y.toFixed(1) +
                 " " + (b.x - dx * 0.5).toFixed(1) + " " + b.y.toFixed(1) +
                 " " + b.x.toFixed(1) + " " + b.y.toFixed(1);
          }
          thread.parentNode.setAttribute("viewBox", "0 0 " + w + " " + h);
          thread.setAttribute("d", d);
          threadLen = thread.getTotalLength();
          thread.style.strokeDasharray = threadLen;
          thread.style.strokeDashoffset = threadLen * (1 - threadState.p);
        }
        buildThread();

        // O fundo copiado usa o mesmo enquadramento da seção 06: a camada de
        // aura tem a altura do Contato, ancorada no topo.
        var ctaSection = document.getElementById("contato");
        function syncCtaBg() {
          if (ctaBg && ctaSection) ctaBg.style.setProperty("--cta-h", ctaSection.offsetHeight + "px");
        }
        syncCtaBg();

        // As luzes do prolongamento imitam as do Contato quadro a quadro
        // (deriva, pulsação e parallax do mouse), para que sejam literalmente
        // as mesmas dos dois lados da divisa. Só roda com a Essência na tela.
        var srcEls = gsap.utils.toArray("#contato .cta__bg .aura__layer, #contato .cta__bg .aura__blob");
        var dstEls = gsap.utils.toArray("#essence-cta-aura .aura__layer, #essence-cta-aura .aura__blob");
        function mirrorAura() {
          for (var n = 0; n < dstEls.length && n < srcEls.length; n++) {
            dstEls[n].style.transform = srcEls[n].style.transform;
            dstEls[n].style.opacity = srcEls[n].style.opacity;
          }
        }
        ScrollTrigger.create({
          trigger: essence,
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) { self.isActive ? gsap.ticker.add(mirrorAura) : gsap.ticker.remove(mirrorAura); }
        });
        cleanups.push(function () { gsap.ticker.remove(mirrorAura); });

        // Feixes: respiração lenta, pausada quando a seção está fora da tela.
        var eaLoops = gsap.utils.toArray(".ea-beam i").map(function (el, i) {
          return gsap.fromTo(el,
            { xPercent: -8, opacity: 0.6, scaleX: 0.9 },
            { xPercent: 10, opacity: 1, scaleX: 1.1, duration: gsap.utils.random(13, 19), ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * -4 });
        });
        ScrollTrigger.create({
          trigger: essence,
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) { eaLoops.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); }
        });

        var ink = getComputedStyle(root).getPropertyValue("--color-ink").trim() || "#2e2b27";
        var cream = getComputedStyle(root).getPropertyValue("--color-cream").trim() || "#f7f3ee";
        var sage = getComputedStyle(root).getPropertyValue("--color-sage").trim() || "#a8bfa8";

        var essTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: scene,
            start: "top top",
            end: function () { return "+=" + Math.round(window.innerHeight * 1.6); },
            pin: true,
            scrub: 0.8,
            refreshPriority: 1, // o espaço do pin precisa existir antes dos gatilhos abaixo
            invalidateOnRefresh: true,
            onRefresh: function () { buildThread(); syncCtaBg(); },
            snap: {
              snapTo: "labelsDirectional",
              duration: { min: 0.35, max: 0.9 },
              delay: 0.15,
              ease: "power1.inOut"
            }
          }
        });

        var line1 = splitWords(essLines[0]);
        var line2 = splitWords(essLines[1]);

        essTl
          .addLabel("inicio")
          // 1. marcador
          // fromTo (não from): com invalidateOnRefresh, um from() regravaria
          // o estado oculto como destino e o marcador sumiria.
          .fromTo(essChapter.children, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.18, stagger: 0.05 }, 0)
          // 2. frase de impacto, depois a continuação
          .fromTo(line1, { opacity: 0.1, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.35, stagger: 0.04 }, 0.1)
          .fromTo(line2, { opacity: 0.1, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.45, stagger: 0.03 }, 0.35)
          .addLabel("frase", 0.95)
          // 3. pilares um a um, o fio se desenhando até cada um
          .to(threadState, {
            p: 1, duration: 1.2,
            onUpdate: function () { if (threadLen) thread.style.strokeDashoffset = threadLen * (1 - threadState.p); }
          }, 1)
          .addLabel("pilares", 2.3)
          // 4. o fundo do Contato (mesmo tom, aura e grão) assume a cena aos
          //    poucos, a partir do meio dos pilares; o texto troca de cor no meio
          //    dessa passagem, quando o contraste já favorece o claro.
          .to(ctaBg, { opacity: 1, duration: 1.3, ease: "sine.inOut" }, 1.7)
          .to(essence, { "--ess-bg": ink, "--ess-grain": 0, duration: 1.3, ease: "sine.inOut" }, 1.7)
          .to(essence, { "--ess-fg": cream, "--ess-accent": sage, duration: 0.6, ease: "sine.inOut" }, 2.1)
          .to(".ea-beam", { xPercent: 12, duration: 3 }, 0)
          .addLabel("fim", 3);

        pillars.forEach(function (p, i) {
          var t = 1.05 + i * 0.28;
          essTl.fromTo(p, { autoAlpha: 0, y: 36, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }, t);

          // Luz do pilar: sutil → pico quando a palavra fica ativa → recua para
          // um brilho residual quando o próximo pilar assume.
          var light = p.querySelector(".pillar__light");
          if (!light) return;
          essTl.fromTo(light, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.18, duration: 0.3, ease: "sine.inOut" }, t + 0.02);
          var dim = i < pillars.length - 1 ? t + 0.3 : 2.35; // o último segura até a troca de cor
          essTl.to(light, { opacity: 0.5, scale: 1, duration: 0.3, ease: "sine.inOut" }, dim);
        });

        cleanups.push(function () {
          if (thread) { thread.style.strokeDasharray = ""; thread.style.strokeDashoffset = ""; }
          essence.style.removeProperty("--ess-bg");
          essence.style.removeProperty("--ess-fg");
          essence.style.removeProperty("--ess-accent");
          essence.style.removeProperty("--ess-grain");
        });

        /* ===== 06 · CONTATO ===== */
        var cta = document.getElementById("contato");
        auraDrift(".cta");
        if (c.finePointer) cleanups.push(auraMouse(cta));

        revealHeading(document.querySelector(".cta h2"), { start: "top 80%" });
        fadeUp(".cta__intro > p:not(.chapter)", ".cta__intro", { delay: 0.3 });
        gsap.from(".cta__primary", {
          autoAlpha: 0, duration: 1, delay: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: ".cta__intro", start: "top 85%", toggleActions: "play none none reverse" }
        });
        gsap.fromTo(".cta__form-card",
          { autoAlpha: 0, y: 60, clipPath: "inset(30% 0% 0% 0% round 32px)" },
          {
            autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 32px)",
            duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: ".cta__grid", start: "top 75%", toggleActions: "play none none reverse" }
          });
        // (A aura do Contato já está presente desde a entrada: a Essência
        // termina com o mesmo fundo, então não há emenda a revelar.)

        /* ===== 07 · FOOTER ===== */
        // Entrada suave: assinatura → colunas → base.
        fadeUp(".footer__main > *, .footer__bottom", ".footer", { stagger: 0.1 });
        // A luz junto à marca se aproxima conforme o footer entra (reversível).
        gsap.fromTo(".footer", { "--sign-light": 0.25 }, {
          "--sign-light": 0.85,
          ease: "none",
          scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 0.8 }
        });

        // A metade da luz bege no topo do footer acompanha, quadro a quadro, a
        // mancha original do Contato (deriva, pulsação e mouse): a luz
        // atravessa a divisa entre as duas seções sem corte.
        var fSrc = gsap.utils.toArray("#contato .cta__bg .aura__layer:nth-child(2), #contato .cta__bg .aura__layer:nth-child(2) .aura__blob");
        var fDst = gsap.utils.toArray("#footer-aura .aura__layer, #footer-aura .aura__blob");
        function mirrorFooterAura() {
          for (var n = 0; n < fDst.length && n < fSrc.length; n++) {
            fDst[n].style.transform = fSrc[n].style.transform;
            fDst[n].style.opacity = fSrc[n].style.opacity;
          }
        }
        ScrollTrigger.create({
          trigger: ".footer",
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) { self.isActive ? gsap.ticker.add(mirrorFooterAura) : gsap.ticker.remove(mirrorFooterAura); }
        });
        cleanups.push(function () { gsap.ticker.remove(mirrorFooterAura); });

        // Ao mudar de breakpoint/preferência o GSAP reverte os tweens; aqui
        // saem os listeners, o ticker e os pontos de luz criados à mão.
        return function () {
          cleanups.forEach(function (fn) { if (fn) fn(); });
          gsap.utils.toArray(".hero__mote").forEach(function (m) { m.remove(); });
          wordmark.classList.remove("is-revealing");
          root.classList.remove("motion");
        };
      }
    );

    // Recalcula posições quando fontes e imagens terminam de carregar.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  });
})();
