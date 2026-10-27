/* Chanticream · interacciones */
(() => {
  const CH = window.CH || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const img = (p) => `assets/img/${p}.webp`;
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  /* ---------- Hora de Sevilla ---------- */
  function ahoraSevilla() {
    const p = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date());
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
    return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes(), fecha: d, partes: p };
  }
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  function estado() {
    const { dia, min } = ahoraSevilla();
    const h = CH.horario || {};
    const hoy = h[dia];
    if (hoy && min >= hoy[0] && min < hoy[1]) {
      const queda = hoy[1] - min;
      return { abierto: true, txt: queda <= 45 ? `Abierto · cerramos en ${queda} min` : `Abierto hasta las ${hhmm(hoy[1])}` };
    }
    if (hoy && min < hoy[0]) return { abierto: false, txt: `Abrimos hoy a las ${hhmm(hoy[0])}` };
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7;
      if (h[d]) return { abierto: false, txt: `Cerrado · abre ${i === 1 ? "mañana" : DIAS[d].toLowerCase()} ${hhmm(h[d][0])}` };
    }
    return { abierto: false, txt: "Cerrado" };
  }
  function pintaEstado() {
    const e = estado();
    $$("[data-estado]").forEach((el) => { el.textContent = e.txt; el.dataset.abierto = e.abierto ? "1" : "0"; });
  }
  pintaEstado();
  setInterval(pintaEstado, 60000);
  $$("[data-anio]").forEach((e) => (e.textContent = new Date().getFullYear()));

  /* ---------- Header y menú ---------- */
  const header = $("#header");
  const hayHero = document.body.classList.contains("con-hero");
  const onScroll = () => {
    const y = scrollY;
    if (header) header.classList.toggle("solido", !hayHero ? y > 38 : y > 60);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".burger");
  burger?.addEventListener("click", () => {
    const abierto = document.body.classList.toggle("menu-abierto");
    burger.setAttribute("aria-expanded", abierto);
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    document.documentElement.style.overflow = abierto ? "hidden" : "";
  });
  $$(".menu-movil a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("menu-abierto"); document.documentElement.style.overflow = ""; }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("menu-abierto")) burger.click(); });

  /* ---------- Intro de la portada ---------- */
  const intro = $("#intro");
  const conIntro = !!intro && document.documentElement.classList.contains("con-intro");
  if (conIntro) {
    let hecho = false;
    const sal = () => {
      if (hecho) return; hecho = true;
      try { sessionStorage.setItem("intro-vista", "1"); } catch (e) {}
      intro.classList.add("fuera");
      setTimeout(() => { document.documentElement.classList.remove("con-intro"); intro.remove(); }, 1150);
    };
    intro.addEventListener("click", sal);
    addEventListener("keydown", sal, { once: true });
    setTimeout(sal, 3300);
  }

  /* ---------- Títulos que suben palabra a palabra ---------- */
  $$("[data-sube]").forEach((h) => {
    let i = 0;
    const recorre = (nodo) => {
      [...nodo.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) return frag.append(w);
            const s = document.createElement("span"); s.className = "sube";
            const t = document.createElement("span"); t.textContent = w; t.style.animationDelay = `${(conIntro ? 3.6 : 0.15) + i++ * 0.07}s`;
            s.append(t); frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") recorre(n);
      });
    };
    recorre(h);
    // por si el navegador congela la animación (pestaña en segundo plano), el título nunca se queda oculto
    setTimeout(() => h.classList.add("sube-ok"), conIntro ? 5600 : 2600);
  });

  /* ---------- WhatsApp: discreto, con una frase propia de cada página ---------- */
  const wa = $("[data-wa]");
  if (wa) {
    const boton = $(".wa-flot", wa), clave = `wa-tip-${wa.dataset.wa}`;
    setTimeout(() => boton.classList.add("ver"), conIntro ? 4600 : 1200);
    let visto = false;
    try { visto = sessionStorage.getItem(clave) === "1"; } catch (e) {}
    // la frase asoma una sola vez, cuando ya se ha leído media página
    const mira = () => {
      if (visto || scrollY < (document.documentElement.scrollHeight - innerHeight) * 0.35) return;
      visto = true; removeEventListener("scroll", mira);
      try { sessionStorage.setItem(clave, "1"); } catch (e) {}
      boton.classList.add("dice");
      setTimeout(() => boton.classList.remove("dice"), 4500);
    };
    if (!visto) addEventListener("scroll", mira, { passive: true });
  }

  /* ---------- Escaparate de platos (hero de portada) ---------- */
  const esc = $(".escaparate");
  if (esc) {
    const platos = $$(".plato", esc), puntos = $$(".escaparate__puntos button", esc);
    const eti = $(".escaparate__etiqueta", esc), fondo = $(".escaparate__fondo span");
    const TIEMPO = 5500;
    let i = 0, reloj;
    const pon = (n) => {
      if (n === i) return;
      platos[i].classList.remove("activo"); platos[i].classList.add("sale");
      const viejo = platos[i];
      setTimeout(() => viejo.classList.remove("sale"), 1300);
      i = (n + platos.length) % platos.length;
      platos[i].classList.add("activo");
      puntos.forEach((p, k) => (k === i ? p.setAttribute("aria-current", "true") : p.removeAttribute("aria-current")));
      const d = platos[i].dataset;
      document.body.style.setProperty("--fondo", d.color);
      const precio = $(".escaparate__precio", esc);
      eti.classList.add("cambia"); fondo.parentNode.classList.add("cambia");
      precio.classList.remove("pop");
      setTimeout(() => {
        $(".escaparate__nota", eti).textContent = d.nota;
        $(".escaparate__nombre", eti).textContent = d.nombre;
        $(".escaparate__desc", eti).innerHTML = `${d.desc}<i class="sep"> · </i><b class="escaparate__euros">${d.precio} €</b>`;
        $("b", precio).textContent = d.precio;
        void precio.offsetWidth; precio.classList.add("pop");
        fondo.textContent = d.palabra;
        eti.classList.remove("cambia"); fondo.parentNode.classList.remove("cambia");
      }, 450);
    };
    const sigue = () => { clearInterval(reloj); reloj = setInterval(() => { if (!esc.matches(":hover")) pon(i + 1); }, TIEMPO); };
    puntos.forEach((p, k) => p.addEventListener("click", () => { pon(k); sigue(); }));
    $$(".escaparate__flecha", esc).forEach((b) => b.addEventListener("click", () => { pon(i + +b.dataset.paso); sigue(); }));
    // deslizar con el dedo
    let x0 = null;
    esc.addEventListener("pointerdown", (e) => (x0 = e.target.closest("button") ? null : e.clientX));
    esc.addEventListener("pointerup", (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { pon(i + (e.clientX < x0 ? 1 : -1)); sigue(); } x0 = null; });
    // el plato se inclina hacia el ratón
    const giro = $(".escaparate__giro", esc);
    if (matchMedia("(hover:hover)").matches && !reducido) {
      esc.addEventListener("pointermove", (e) => {
        const r = esc.getBoundingClientRect();
        giro.style.setProperty("--tx", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
        giro.style.setProperty("--ty", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`);
      });
      esc.addEventListener("pointerleave", () => { giro.style.setProperty("--tx", "0deg"); giro.style.setProperty("--ty", "0deg"); });
    }
    sigue();
  }

  /* ---------- Ilustraciones: nunca encima de texto ni de fotos ---------- */
  const decos = $$(".deco");
  if (decos.length) {
    const SEL = ".eyebrow,.precio,.tag,.chip,h1,h2,h3,h4,p,li,a,button,img:not(.deco),dt,dd,label,input,select,textarea,iframe,figure,blockquote,summary,video,canvas,.btn,.goteo,[data-res-svg]";
    const choca = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const coloca = () => {
      // también cajas con fondo propio (tarjetas, pizarras, mapas…)
      const cajas = $$("main div, main article, main aside, main form").filter((e) => {
        const cs = getComputedStyle(e);
        return cs.backgroundImage !== "none" || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") || cs.boxShadow !== "none";
      });
      const cands = $$(SEL).concat(cajas).filter((e) => !e.closest(".wa, .header, .menu-movil, .ticker"));
      decos.forEach((d) => {
        d.classList.remove("oculta");
        const r = d.getBoundingClientRect(), m = 16, h = r.height || r.width;
        const caja = { left: r.left - m, right: r.right + m, top: r.top - m, bottom: r.top + h + m };
        const vw = document.documentElement.clientWidth;
        // si queda casi todo fuera de pantalla no aporta nada
        const dentro = Math.min(caja.right, vw) - Math.max(caja.left, 0);
        const tapa = dentro < r.width * 0.4 || cands.some((e) => {
          const q = e.getBoundingClientRect();
          if (!(q.width > 0 && q.height > 0)) return false;
          // lo que aún no ha aparecido está 34px más abajo de donde acabará
          const sube = e.closest(".rv:not(.visto)") ? 34 : 0;
          return choca(caja, { left: q.left, right: q.right, top: q.top - sube, bottom: q.bottom });
        });
        d.classList.toggle("oculta", tapa);
      });
    };
    const ioD = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("ver"); ioD.unobserve(e.target); } }), { rootMargin: "0px 0px -5% 0px" });
    decos.forEach((d) => { ioD.observe(d); d.addEventListener("load", coloca, { once: true }); });
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(coloca, 200); });
    addEventListener("load", coloca);
    document.fonts?.ready.then(coloca);
    coloca();
  }

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const observa = () => $$(".rv:not(.visto)").forEach((el) => io.observe(el));
  observa();

  /* ---------- Contadores ---------- */
  const cio = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target; cio.unobserve(el);
    const fin = parseFloat(el.dataset.cuenta.replace(",", ".")); const dec = (el.dataset.cuenta.split(",")[1] || "").length;
    const pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    if (reducido) { el.textContent = pre + el.dataset.cuenta + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const paso = (t) => { const k = Math.min(1, (t - t0) / dur), v = fin * (1 - Math.pow(1 - k, 3)); el.textContent = pre + v.toFixed(dec).replace(".", ",") + suf; if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  }), { threshold: 0.6 });
  $$("[data-cuenta]").forEach((el) => cio.observe(el));

  /* ---------- Marquesina de sabores que reacciona al scroll ---------- */
  const filas = $$(".sabores__fila");
  if (filas.length && !reducido) {
    filas.forEach((f) => (f.innerHTML += f.innerHTML));
    let off = 0, vel = 0, ultY = scrollY;
    const tick = () => {
      const dy = scrollY - ultY; ultY = scrollY;
      vel += (dy * 0.25 - vel) * 0.1;
      off += 0.6 + Math.abs(vel);
      filas.forEach((f, i) => {
        const w = f.scrollWidth / 2;
        const x = -(off % w);
        f.style.transform = `translate3d(${i % 2 ? -w - x : x}px,0,0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Reseñas ---------- */
  $$("[data-resenas]").forEach((cont) => {
    const lista = CH.resenas || [];
    const tarjeta = (r) => `<article class="resena"><span class="resena__est" aria-label="5 estrellas">★★★★★</span><p>${r.t}</p><div class="resena__autor"><i>${r.a[0]}</i><span>${r.a}<small>Reseña en ${r.f}</small></span></div></article>`;
    const mitad = Math.ceil(lista.length / 2);
    const filasR = [lista.slice(0, mitad), lista.slice(mitad)];
    cont.innerHTML = filasR.map((f, i) => { const h = f.map(tarjeta).join(""); return `<div class="resenas__fila${i ? " resenas__fila--2" : ""}">${h}<div style="display:contents" aria-hidden="true">${h}</div></div>`; }).join("");
  });

  /* ---------- Instagram ---------- */
  $$("[data-insta]").forEach((cont) => {
    const n = parseInt(cont.dataset.insta || "10", 10);
    cont.innerHTML = (CH.insta || []).slice(0, n).map((p) => `<a href="https://www.instagram.com/chanticream/${p.c}/" target="_blank" rel="noopener" aria-label="${p.alt} (Instagram)"><img src="${img(p.img)}" alt="${p.alt}" loading="lazy"></a>`).join("");
  });

  /* ---------- Pizarra: tarta del día ---------- */
  const piz = $("[data-pizarra]");
  if (piz && CH.delDia) {
    const hoy = ahoraSevilla().dia;
    const nav = $(".pizarra__nav", piz);
    const orden = [2, 3, 4, 5, 6, 0, 1];
    const pinta = (d) => {
      const t = CH.delDia[d];
      $(".pizarra__dia", piz).textContent = d === hoy ? `Hoy, ${DIAS[d].toLowerCase()}…` : `El ${DIAS[d].toLowerCase()}…`;
      $("h3", piz).textContent = t.n;
      $("p", piz).textContent = t.d;
      const im = $(".pizarra__foto img", piz); im.style.opacity = 0;
      setTimeout(() => { im.src = img(t.img); im.alt = t.n; im.onload = () => (im.style.opacity = 1); }, 200);
      $$("button", nav).forEach((b) => b.setAttribute("aria-pressed", b.dataset.d == d));
    };
    nav.innerHTML = orden.map((d) => `<button type="button" data-d="${d}" aria-pressed="false">${DIAS[d].slice(0, 3)}</button>`).join("");
    nav.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pinta(+b.dataset.d); });
    pinta(hoy);
  }

  /* ---------- Vitrina: filtros y tarjetas ---------- */
  const rej = $("[data-vitrina]");
  if (rej && CH.tartas) {
    const filtros = $("[data-filtros]");
    const cuenta = (c) => (c === "todas" ? CH.tartas.length : CH.tartas.filter((t) => t.c.includes(c)).length);
    filtros.innerHTML = CH.categorias.map(([k, n], i) => `<button class="filtro" type="button" data-f="${k}" aria-pressed="${i === 0}">${n}<sup>${cuenta(k)}</sup></button>`).join("");
    rej.innerHTML = CH.tartas.map((t, i) => `
      <article class="prod rv" data-d="${(i % 4) + 1}" data-c="${t.c.join(" ")}">
        <div class="prod__img"><img src="${img(t.img)}" alt="${t.n}" loading="lazy"></div>
        <div class="prod__body">
          <h3>${t.n}</h3>
          <p>${t.d}</p>
          <div class="prod__pie">
            <div class="tags">${t.t.includes("fav") ? '<span class="tag tag--fav">Favorita</span>' : ""}${t.t.includes("sg") ? '<span class="tag tag--sg">Sin gluten</span>' : ""}${t.c.includes("acento") ? '<span class="tag">Receta latina</span>' : ""}</div>
          </div>
        </div>
      </article>`).join("");
    observa();
    filtros.addEventListener("click", (e) => {
      const b = e.target.closest(".filtro"); if (!b) return;
      $$(".filtro", filtros).forEach((x) => x.setAttribute("aria-pressed", x === b));
      const f = b.dataset.f;
      $$(".prod", rej).forEach((p) => {
        const ver = f === "todas" || p.dataset.c.split(" ").includes(f);
        p.classList.toggle("oculto", !ver);
        if (ver) { p.classList.remove("visto"); requestAnimationFrame(() => p.classList.add("visto")); }
      });
    });
  }

  /* ---------- Quiz ---------- */
  const quiz = $("[data-quiz]");
  if (quiz && CH.quiz) {
    const Q = CH.quiz; const pasos = $(".quiz__pasos", quiz); const barra = $(".quiz__barra span", quiz);
    let puntos = {}, i = 0;
    const visual = $(".quiz__visual img", quiz);
    const pinta = () => {
      barra.style.width = `${(i / Q.preguntas.length) * 100}%`;
      if (i < Q.preguntas.length) {
        const q = Q.preguntas[i];
        pasos.innerHTML = `<div class="quiz__paso activo"><span class="eyebrow">Pregunta ${i + 1} de ${Q.preguntas.length}</span><h3 style="margin-top:12px">${q.p}</h3><div class="quiz__ops">${q.o.map((o, k) => `<button type="button" data-k="${k}"><i aria-hidden="true">${o[0]}</i>${o[1]}</button>`).join("")}</div></div>`;
      } else {
        const gana = Object.entries(puntos).sort((a, b) => b[1] - a[1])[0][0];
        const r = Q.resultados[gana];
        visual.src = img(r.img); visual.alt = r.n;
        pasos.innerHTML = `<div class="quiz__paso activo quiz__res"><span class="eyebrow">Tu tarta es…</span><h3 style="font-size:clamp(36px,4vw,54px);margin:6px 0 0">${r.n}</h3><p>${r.d}</p><div class="ctas"><a class="btn btn--nata" href="https://wa.me/${CH.wa}?text=${encodeURIComponent("¡Hola! El test de la web dice que mi tarta es la " + r.n + ". ¿La tenéis hoy en vitrina?")}" target="_blank" rel="noopener">¿La tenéis hoy?</a><button class="btn btn--linea" type="button" data-otra><span>Repetir</span></button></div></div>`;
      }
    };
    pasos.addEventListener("click", (e) => {
      if (e.target.closest("[data-otra]")) { puntos = {}; i = 0; visual.src = visual.dataset.inicial; return pinta(); }
      const b = e.target.closest("button[data-k]"); if (!b) return;
      const o = Q.preguntas[i].o[+b.dataset.k][2];
      Object.entries(o).forEach(([k, v]) => (puntos[k] = (puntos[k] || 0) + v));
      i++; pinta();
    });
    visual.dataset.inicial = visual.src;
    pinta();
  }

  /* ---------- Configurador de encargo ---------- */
  const cfg = $("[data-config]");
  if (cfg) {
    const f = $("form", cfg);
    const fecha = $("#c-fecha", cfg);
    const min = new Date(ahoraSevilla().fecha); min.setDate(min.getDate() + 2);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    fecha.min = iso(min);
    const tam = (r) => (r <= 8 ? "≈ 18 cm" : r <= 12 ? "≈ 20 cm" : r <= 18 ? "≈ 24 cm" : r <= 25 ? "≈ 28 cm o dos pisos" : "dos o tres pisos");
    // fotos reales de tartas que han hecho, según lo que se elige
    const F = (f, pie) => ({ f: `assets/img/ig/${f}.webp`, pie });
    const fotos = {
      infantil: [F("tarta-goku", "Goku, en dos pisos"), F("tarta-harry-potter", "Harry Potter y el andén 9¾"), F("tarta-hulk", "Hulk, para un superhéroe"), F("tarta-selva", "Animales de la selva"), F("tarta-conejito", "Conejita con flores"), F("tarta-unicornio", "Merengues de unicornio")],
      comunion: [F("tarta-comunion", "Comunión con rosario dorado"), F("tarta-mariposas-pisos", "Dos pisos con mariposas")],
      boda: [F("tarta-rosas", "Rosas rojas y blancas"), F("tarta-dos-pisos-azul", "Dos pisos en azul cielo"), F("tarta-volantes", "Volantes en lila y rosa")],
      pisos: [F("tarta-pisos-rosa", "Tres pisos para una gran fiesta"), F("tarta-dos-pisos-azul", "Dos pisos en azul cielo"), F("tarta-mariposas-pisos", "Dos pisos con mariposas")],
      frutos: [F("tarta-frutos-del-bosque", "Frutos del bosque y nata"), F("tarta-fresas-nata", "Fresas y nata"), F("tarta-frambuesas", "Fresas y frambuesas")],
      Chocolate: F("tarta-chocolate-vegana", "Chocolate con crema de chocolate"),
      ChocolateTrufa: F("muerte-por-chocolate", "Chocolate y trufa, capa a capa"),
      Trufa: F("muerte-por-chocolate", "Trufa, capa a capa"),
      Oreo: F("tarta-oreo", "Oreo con nata y galleta"),
      "Red Velvet": F("tarta-red-velvet-nata", "Red Velvet con nata"),
      Zanahoria: F("zanahoria-corte", "Zanahoria con crema de queso"),
      "Tres leches": F("tres-leches-dulce", "Tres leches con dulce de leche"),
      Kinder: F("tarta-drip-azul", "Goteo y bombones"),
      VainillaDulce: F("tarta-lotus-entera", "Vainilla con dulce de leche"),
      Vainilla: F("tarta-rosetas", "Vainilla con rosetas de nata"),
      cumple: [F("tarta-15", "Cumpleaños con velas doradas"), F("tarta-drip-roja", "Goteo rojo y confeti"), F("tarta-flores", "Flores de buttercream")],
    };
    const indice = { Chocolate: 0, "Red Velvet": 1, Zanahoria: 2, Vainilla: 3, "Tres leches": 4, Trufa: 5, Oreo: 0, Kinder: 1 };
    const eligeFoto = (o, b, c, r) => {
      const n = indice[b] || 0;
      if (o === "Infantil") return fotos.infantil[n % fotos.infantil.length];
      if (o.startsWith("Comunión")) return fotos.comunion[n % 2];
      if (o.startsWith("Boda")) return fotos.boda[n % 3];
      if (r > 18) return fotos.pisos[n % 3];
      if (c === "Frutos rojos" && !["Chocolate", "Trufa", "Oreo"].includes(b)) return fotos.frutos[n % 3];
      if (b === "Chocolate" && c === "Trufa") return fotos.ChocolateTrufa;
      if (b === "Vainilla") return c === "Dulce de leche" ? fotos.VainillaDulce : o === "Cumpleaños" ? fotos.cumple[(n + (c.length % 3)) % 3] : fotos.Vainilla;
      return fotos[b] || fotos.Chocolate;
    };
    const caja = $(".resumen__foto", cfg), foto = $("[data-res-foto]", cfg), foto2 = $("[data-res-foto2]", cfg);
    const ponFoto = (x) => {
      if (foto.getAttribute("src") === x.f) return;
      // fundido: la foto vieja queda encima y se desvanece
      foto2.src = foto.src; caja.classList.add("cambia");
      foto.src = x.f; foto.alt = `${x.pie}: una tarta hecha en Chanticream`;
      $("[data-res-pie]", cfg).textContent = x.pie;
      const quita = () => requestAnimationFrame(() => caja.classList.remove("cambia"));
      foto.complete ? quita() : (foto.onload = quita);
    };
    const hoy = ahoraSevilla().fecha;
    $("[data-res-num]", cfg).textContent = `Nº ${String(hoy.getMonth() + 1).padStart(2, "0")}${String(hoy.getDate()).padStart(2, "0")}`;
    let antes = {};
    const val = (n) => { const x = f.querySelector(`[name="${n}"]:checked`); return x ? x.value : ""; };
    const actualiza = () => {
      const r = +$("#c-raciones", cfg).value;
      $("#c-raciones-out", cfg).textContent = r;
      const datos = { Ocasión: val("ocasion"), Bizcocho: val("bizcocho"), Cubierta: val("cubierta"), Raciones: `${r} personas (${tam(r)})`, Fecha: fecha.value ? new Date(fecha.value + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : "Por concretar", Texto: $("#c-texto", cfg).value || "—" };
      $("[data-res-lista]", cfg).innerHTML = Object.entries(datos).map(([k, v]) => `<dt>${k}</dt><dd${antes[k] !== undefined && antes[k] !== v ? ' class="cambio"' : ""}>${v}</dd>`).join("");
      antes = datos;
      const nombre = ["Red Velvet", "Oreo", "Kinder"].includes(datos.Bizcocho) ? datos.Bizcocho : datos.Bizcocho.toLowerCase();
      $("[data-res-titulo]", cfg).textContent = `Tarta de ${nombre}`;
      ponFoto(eligeFoto(datos.Ocasión, datos.Bizcocho, datos.Cubierta, r));
      const msg = `¡Hola Chanticream! Quiero encargar una tarta:\n• Ocasión: ${datos.Ocasión}\n• Bizcocho: ${datos.Bizcocho}\n• Cubierta/relleno: ${datos.Cubierta}\n• Para: ${datos.Raciones}\n• Fecha de recogida: ${datos.Fecha}\n• Texto/decoración: ${datos.Texto}\n¿Me decís precio y disponibilidad? ¡Gracias!`;
      $("[data-res-wa]", cfg).href = `https://wa.me/${CH.wa}?text=${encodeURIComponent(msg)}`;
    };
    f.addEventListener("input", actualiza);
    f.addEventListener("change", actualiza);
    f.addEventListener("submit", (e) => e.preventDefault());
    actualiza();
  }

  /* ---------- Temporada: marca lo siguiente ---------- */
  const temp = $$("[data-mes]");
  if (temp.length) {
    const m = ahoraSevilla().fecha.getMonth() + 1;
    let mejor = null, dist = 99;
    temp.forEach((t) => {
      const meses = t.dataset.mes.split(",").map(Number);
      meses.forEach((mm) => { const d = (mm - m + 12) % 12; if (d < dist) { dist = d; mejor = t; } });
    });
    mejor?.classList.add("proxima");
  }

  /* ---------- Horario con el día de hoy ---------- */
  $$("[data-horario]").forEach((ul) => {
    const hoy = ahoraSevilla().dia; const h = CH.horario;
    ul.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => `<li class="${d === hoy ? "hoy" : ""} ${h[d] ? "" : "cerrado"}"><span>${DIAS[d]}</span><span>${h[d] ? hhmm(h[d][0]) + " – " + hhmm(h[d][1]) : "Descanso"}</span></li>`).join("");
  });

  /* ---------- Galería con visor ---------- */
  $$("[data-galeria]").forEach((gal) => {
    const figs = $$("figure", gal);
    const visor = document.createElement("div");
    visor.className = "visor"; visor.setAttribute("role", "dialog"); visor.setAttribute("aria-modal", "true"); visor.setAttribute("aria-label", "Foto ampliada");
    visor.innerHTML = `<img alt=""><p></p><button class="cerrar" aria-label="Cerrar">✕</button><button class="ant" aria-label="Anterior">‹</button><button class="sig" aria-label="Siguiente">›</button>`;
    document.body.append(visor);
    let i = 0;
    const abre = (k) => { i = (k + figs.length) % figs.length; const im = $("img", figs[i]); $("img", visor).src = im.dataset.full || im.src; $("img", visor).alt = im.alt; $("p", visor).textContent = $("figcaption", figs[i])?.textContent || ""; visor.classList.add("abierto"); $(".cerrar", visor).focus(); };
    const cierra = () => visor.classList.remove("abierto");
    figs.forEach((fg, k) => { fg.tabIndex = 0; fg.addEventListener("click", () => abre(k)); fg.addEventListener("keydown", (e) => { if (e.key === "Enter") abre(k); }); });
    $(".cerrar", visor).onclick = cierra; $(".ant", visor).onclick = () => abre(i - 1); $(".sig", visor).onclick = () => abre(i + 1);
    visor.addEventListener("click", (e) => { if (e.target === visor) cierra(); });
    addEventListener("keydown", (e) => { if (!visor.classList.contains("abierto")) return; if (e.key === "Escape") cierra(); if (e.key === "ArrowLeft") abre(i - 1); if (e.key === "ArrowRight") abre(i + 1); });
  });

  /* ---------- Línea de tiempo ---------- */
  const tiempo = $(".tiempo");
  if (tiempo) {
    const barraT = $(".tiempo__barra", tiempo);
    const mueve = () => { const r = tiempo.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)); barraT.style.height = `${p * (r.height - 20)}px`; };
    addEventListener("scroll", mueve, { passive: true }); mueve();
  }

  /* ---------- Parallax suave en heroes ---------- */
  const fotos = $$(".hero__foto");
  if (fotos.length && !reducido) {
    addEventListener("scroll", () => { const y = scrollY; if (y < innerHeight) fotos.forEach((f, k) => (f.style.transform = `translate3d(0,${y * (0.18 + k * 0.06)}px,0)`)); }, { passive: true });
  }
})();
