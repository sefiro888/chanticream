"""Ensambla las páginas de Chanticream.

Cada archivo de src/ lleva una cabecera con sus datos (entre ---) y el contenido
de <main>. Este script le añade <head>, ticker, header, menú móvil, footer y
scripts comunes, y deja el HTML final en la raíz del proyecto.

    python herramientas/build.py
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SRC = RAIZ / "src"

WA = "34699307420"
TEL = "699 30 74 20"
IG = "https://www.instagram.com/chanticream/"
UBER = "https://www.ubereats.com/es/store/chanticream/9y39RoR6Vyi58FifijCMCQ"
GOOGLE = "https://share.google/k1YmTiH8C81n2Nbo4"
TRIP = "https://www.tripadvisor.es/Restaurant_Review-g187443-d23841627-Reviews-Chanticream_Heladeria_Pasteleria_Cafe-Seville_Province_of_Seville_Andalucia.html"
COMO_LLEGAR = "https://www.google.com/maps/dir/?api=1&destination=Cafeter%C3%ADa%20Tarter%C3%ADa%20Chanticream%2C%20C.%20Paco%20Gand%C3%ADa%2026%2C%2041007%20Sevilla"

NAV = [  # clave, archivo, nombre largo (menú móvil y pie), nombre corto (barra)
    ("inicio", "index.html", "Inicio", "Inicio"),
    ("vitrina", "la-vitrina.html", "La vitrina", "Vitrina"),
    ("encargos", "encargos.html", "Tartas por encargo", "Encargos"),
    ("meriendas", "meriendas.html", "Café y meriendas", "Meriendas"),
    ("domicilio", "a-domicilio.html", "A domicilio", "A domicilio"),
    ("historia", "nuestra-historia.html", "Nuestra historia", "Historia"),
    ("visitanos", "visitanos.html", "Visítanos", "Visítanos"),
]

ICO = {
    "ig": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    "wa": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.27-.2-.57-.34m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></svg>',
    "uber": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    "g": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.32 2.97-7.32Z"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.58A10 10 0 0 0 12 22Z" opacity=".75"/><path d="M6.4 13.9a6 6 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 8.98Z" opacity=".55"/><path d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5L6.4 10.08C7.19 7.74 9.4 5.98 12 5.98Z" opacity=".9"/></svg>',
    "ta": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7.3" cy="13" r="3.6"/><circle cx="16.7" cy="13" r="3.6"/><circle cx="7.3" cy="13" r="1.2" fill="currentColor"/><circle cx="16.7" cy="13" r="1.2" fill="currentColor"/><path d="M3 8.2h18M12 8.2l-1.6 2.4h3.2Z" stroke-linejoin="round"/></svg>',
    "tel": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>',
    "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    "flecha": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "flecha-ne": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    "cupcake": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2c.9 0 1.4.6 1.4 1.3 0 .3-.1.5-.2.7 2.5.3 4.6 2.1 4.8 4.4a2.6 2.6 0 0 1 .8 4.4H5.2a2.6 2.6 0 0 1 .8-4.4C6.2 7.3 8.3 5.5 10.8 5.2a1.3 1.3 0 0 1 1.2-2Z"/><path d="M6.6 15h10.8l-1.3 5.2a1 1 0 0 1-1 .8H8.9a1 1 0 0 1-1-.8Z" opacity=".7"/></svg>',
}


def goteo(semilla=1, gotas=True):
    """Capa de chocolate que gotea, como el cupcake del logo.
    Una banda ondulada + gotas sueltas (cada una su <path>) que se estiran despacio."""
    import random
    r = random.Random(semilla)
    B, W, H = 30, 1440, 170
    # banda superior con el borde ondulado
    banda = [f"M0,0 H{W} V{B}"]
    x = W
    while x > 0:
        paso = r.randint(70, 150)
        nx = max(0, x - paso)
        banda.append(f"Q{(x + nx) / 2:.0f},{B + r.uniform(-3, 7):.1f} {nx},{B + r.uniform(-1.5, 2):.1f}")
        x = nx
    banda.append("Z")
    piezas, brillos, caidas = [], [], []
    x = r.randint(30, 70)
    while x < W - 30:
        larga = r.random() < .55
        n = r.uniform(9, 18) if larga else r.uniform(11, 22)   # medio ancho del cuello
        if larga:
            rb = n * r.uniform(1.25, 1.5)                    # bulbo más gordo que el cuello
            L = r.uniform(58, 118)
            sh = n * 1.1
            yb = B + L
            dx = r.uniform(-2.5, 2.5)
            d = (f"M{x - n - sh:.1f},{B - 6} H{x + n + sh:.1f} V{B} "
                 f"C{x + n + sh * .3:.1f},{B} {x + n:.1f},{B + sh * .4:.1f} {x + n:.1f},{B + sh:.1f} "
                 f"L{x + n * .86 + dx:.1f},{yb - rb * 1.7:.1f} "
                 f"C{x + n * .86 + dx:.1f},{yb - rb * .9:.1f} {x + rb + dx:.1f},{yb - rb * 1.05:.1f} {x + rb + dx:.1f},{yb:.1f} "
                 f"A{rb:.1f},{rb:.1f} 0 0 1 {x - rb + dx:.1f},{yb:.1f} "
                 f"C{x - rb + dx:.1f},{yb - rb * 1.05:.1f} {x - n * .86 + dx:.1f},{yb - rb * .9:.1f} {x - n * .86 + dx:.1f},{yb - rb * 1.7:.1f} "
                 f"L{x - n:.1f},{B + sh:.1f} "
                 f"C{x - n:.1f},{B + sh * .4:.1f} {x - n - sh * .3:.1f},{B} {x - n - sh:.1f},{B} Z")
            brillos.append(f"M{x + n * .38:.1f},{B + sh + 4:.1f} L{x + n * .3 + dx:.1f},{yb - rb * .5:.1f}")
            if L > 85 and len(caidas) < 3 and r.random() < .7:
                caidas.append((x + dx, yb + rb + 14, max(4.5, rb * .5)))
        else:
            L = r.uniform(14, 34)
            sh = n * .9
            yb = B + L - n
            d = (f"M{x - n - sh:.1f},{B - 6} H{x + n + sh:.1f} V{B} "
                 f"C{x + n + sh * .3:.1f},{B} {x + n:.1f},{B + sh * .3:.1f} {x + n:.1f},{max(B + sh * .6, yb):.1f} "
                 f"A{n:.1f},{n:.1f} 0 0 1 {x - n:.1f},{max(B + sh * .6, yb):.1f} "
                 f"C{x - n:.1f},{B + sh * .3:.1f} {x - n - sh * .3:.1f},{B} {x - n - sh:.1f},{B} Z")
        dur = r.uniform(5, 9)
        piezas.append(f'<path class="hilo" style="--d:{dur:.1f}s;--r:-{r.uniform(0, dur):.1f}s" d="{d}"/>')
        x += n * 2 + r.randint(14, 95)
    gts = ""
    if gotas:
        for cx, y, rr in caidas:
            gts += (f'<path class="gota" d="M{cx:.1f},{y - rr * 2.3:.1f} C{cx + rr * .9:.1f},{y - rr:.1f} {cx + rr:.1f},{y - rr * .2:.1f} {cx + rr:.1f},{y:.1f} '
                    f'A{rr:.1f},{rr:.1f} 0 0 1 {cx - rr:.1f},{y:.1f} C{cx - rr:.1f},{y - rr * .2:.1f} {cx - rr * .9:.1f},{y - rr:.1f} {cx:.1f},{y - rr * 2.3:.1f} Z"/>')
    brillo = f'<path class="brillo" d="{" ".join(brillos)}"/>' if brillos else ""
    return (f'<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" fill="currentColor">'
            f'<path d="{" ".join(banda)}"/>{"".join(piezas)}{brillo}{gts}</svg>')


TICKER = [
    '<b>Nuevo horario:</b> martes a domingo de 15:00 a 20:30 · lunes descanso',
    '<b>4,8 ★ en Google</b> con 186 reseñas',
    'Porción de tarta en vitrina <b>desde 3 €</b>',
    f'Encargos por WhatsApp con <b>2 días</b> de antelación · <a href="https://wa.me/{WA}" target="_blank" rel="noopener">{TEL}</a>',
    f'También en <a href="{UBER}" target="_blank" rel="noopener">Uber Eats</a> · a domicilio de 15:30 a 20:30',
    '<b>Helados artesanales</b>, café 100 % natural y batidos',
    'Opciones <b>sin gluten y sin lactosa</b> por encargo',
    'Tartería artesanal en Sevilla <b>desde 2019</b>',
]


def ticker():
    sep = '<svg class="ticker__sep" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.9H22l-6 4.6 2.3 7.1L12 16.3 5.7 20.6 8 13.5l-6-4.6h7.6Z"/></svg>'
    items = "".join(f'<span class="ticker__item">{sep}{t}</span>' for t in TICKER)
    return (f'<div class="ticker" role="region" aria-label="Avisos de Chanticream">'
            f'<div class="ticker__pista">{items}<span aria-hidden="true" style="display:contents">{items}</span></div></div>')


def header(clave):
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if k == clave else ""}>{c}</a>' for k, h, t, c in NAV[1:]
    )
    mm = "".join(
        f'<a class="mm-link" href="{h}" style="transition-delay:{.12 + i * .05:.2f}s"><small>0{i + 1}</small>{t}</a>'
        for i, (k, h, t, c) in enumerate(NAV)
    )
    return f"""
<a class="saltar" href="#contenido">Saltar al contenido</a>
{ticker()}
<header class="header" id="header">
  <div class="wrap header__in">
    <a class="marca" href="index.html" aria-label="Chanticream, ir al inicio">
      <img class="marca__ico choco" src="assets/img/marca/cupcake.png" alt="" width="234" height="351">
      <img class="marca__ico crema" src="assets/img/marca/cupcake-crema.png" alt="" width="234" height="351">
      <span class="marca__txt">
        <img class="marca__wm choco" src="assets/img/marca/wordmark.png" alt="Chanticream" width="600" height="65">
        <img class="marca__wm crema" src="assets/img/marca/wordmark-crema.png" alt="" width="600" height="65">
        <span class="marca__sub">Tartería artesanal · Sevilla</span>
      </span>
    </a>
    <nav class="nav" aria-label="Principal">{links}</nav>
    <span class="estado" data-estado data-abierto="1">Abierto</span>
    <a class="btn btn--caramelo btn--sm header__cta" href="encargos.html#configura">Encargar tarta</a>
    <button class="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu-movil"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="menu-movil" id="menu-movil">
  {mm}
  <div class="menu-movil__pie">
    <div>C. Paco Gandía, 26 · 41007 Sevilla<br>Martes a domingo · 15:00 a 20:30</div>
    <div class="ctas">
      <a class="btn btn--wa" href="https://wa.me/{WA}" target="_blank" rel="noopener">{ICO['wa']}<span>WhatsApp</span></a>
      <a class="btn btn--nata" href="{IG}" target="_blank" rel="noopener">{ICO['ig']}<span>Instagram</span></a>
    </div>
  </div>
</div>"""


WA_MSG = {
    "inicio": ("¿Te guardamos una porción para esta tarde? Pregúntanos qué hay hoy en la vitrina.", "Hola Chanticream, ¿qué tartas tenéis hoy en la vitrina?"),
    "vitrina": ("¿Dudas entre dos sabores? Escríbenos y te decimos cuáles quedan ahora mismo.", "Hola, ¿qué sabores os quedan hoy en la vitrina?"),
    "encargos": ("¿Tienes una celebración? Cuéntanos la fecha y te ayudamos a diseñar tu tarta.", "Hola Chanticream, quería encargar una tarta para el día "),
    "meriendas": ("¿Te apetece merendar hoy? Pregúntanos por los helados y las tartas del día.", "Hola, ¿qué helados y tartas tenéis hoy?"),
    "domicilio": ("¿Prefieres recogerlo tú? Escríbenos y te lo dejamos preparado.", "Hola, quería dejar un pedido preparado para recoger en la tienda"),
    "historia": ("¿Quieres probar las recetas de Paul? Escríbenos y te recomendamos por dónde empezar.", "Hola Chanticream, ¿qué me recomendáis probar primero?"),
    "visitanos": ("¿No encuentras el local? Te mandamos la ubicación por WhatsApp en un momento.", "Hola, ¿me mandáis la ubicación del local?"),
}


import time
VERSION = time.strftime("%y%m%d%H%M")


def intro():
    """Telón de chocolate que se levanta al entrar (solo la primera vez por visita)."""
    chispas = "".join(f'<i style="--x:{(k * 37) % 100}%;--d:{1.4 + (k % 5) * .35:.2f}s;--t:{(k * 13) % 9 / 10 + .6:.1f}s"></i>' for k in range(16))
    return f"""<div class="intro" id="intro" aria-hidden="true">
  <script>try{{if(sessionStorage.getItem("intro-vista")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("sin-intro");else document.documentElement.classList.add("con-intro")}}catch(e){{}}</script>
  <div class="intro__caramelo">{goteo(23, gotas=False)}</div>
  <div class="intro__chispas">{chispas}</div>
  <div class="intro__centro">
    <img class="intro__cupcake" src="assets/img/marca/cupcake-crema.png" alt="">
    <img class="intro__marca" src="assets/img/marca/wordmark-crema.png" alt="Chanticream">
    <p class="intro__lema">Endulzamos tu vida</p>
    <p class="intro__sub">Tartería artesanal · Sevilla · desde 2019</p>
  </div>
  <button class="intro__saltar" type="button">Entrar</button>
  <div class="intro__borde">{goteo(29, gotas=False)}</div>
</div>"""

def footer(clave="inicio"):
    from urllib.parse import quote
    wa_url = f"https://wa.me/{WA}?text={quote(WA_MSG.get(clave, WA_MSG['inicio'])[1])}"
    return f"""
<footer class="footer">
  <div class="goteo-top">{goteo(7, gotas=False)}</div>
  <div class="wrap">
    <p class="footer__lema" aria-hidden="true">Endulzamos tu vida</p>
    <div class="footer__grid">
      <div>
        <img class="footer__logo" src="assets/img/marca/wordmark-crema.png" alt="Chanticream" width="600" height="65">
        <p>Tartería artesanal, café y helados en Sevilla desde 2019. Tartas hechas a mano cada día en nuestro obrador, en porciones o enteras por encargo.</p>
        <div class="footer__redes">
          <a href="{IG}" target="_blank" rel="noopener" aria-label="Instagram">{ICO['ig']}</a>
          <a href="https://wa.me/{WA}" target="_blank" rel="noopener" aria-label="WhatsApp">{ICO['wa']}</a>
          <a href="{UBER}" target="_blank" rel="noopener" aria-label="Uber Eats">{ICO['uber']}</a>
          <a href="{GOOGLE}" target="_blank" rel="noopener" aria-label="Google">{ICO['g']}</a>
          <a href="{TRIP}" target="_blank" rel="noopener" aria-label="Tripadvisor">{ICO['ta']}</a>
        </div>
      </div>
      <div>
        <h4>Visítanos</h4>
        <ul>
          <li><a href="{COMO_LLEGAR}" target="_blank" rel="noopener">C. Paco Gandía, 26<br>41007 Sevilla</a></li>
          <li><a href="tel:+{WA}">{TEL}</a></li>
          <li><a href="https://wa.me/{WA}" target="_blank" rel="noopener">WhatsApp de encargos</a></li>
        </ul>
      </div>
      <div>
        <h4>Horario</h4>
        <ul>
          <li>Martes a domingo<br><b style="color:var(--nata)">15:00 – 20:30</b></li>
          <li>Lunes: descanso</li>
          <li><span class="estado" data-estado data-abierto="1">Abierto</span></li>
        </ul>
      </div>
      <div>
        <h4>La casa</h4>
        <ul>
          {''.join(f'<li><a href="{h}">{t}</a></li>' for k, h, t, c in NAV[1:])}
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <span>© <span data-anio>2026</span> Chanticream · Tartería artesanal · Sevilla</span>
      <span>Hecho con mucha nata y algo de código</span>
    </div>
  </div>
</footer>
<div class="wa" data-wa="{clave}">
  <div class="wa__burbuja" role="status" hidden>
    <button class="wa__x" type="button" aria-label="Cerrar mensaje">×</button>
    <div class="wa__quien"><img src="assets/img/marca/cupcake.png" alt=""><div><b>Chanticream</b><small><i></i>Responde en unos minutos</small></div></div>
    <p class="wa__msg">{WA_MSG.get(clave, WA_MSG["inicio"])[0]}</p>
    <a class="wa__ir" href="{wa_url}" target="_blank" rel="noopener">{ICO['wa']}<span>Escribir por WhatsApp</span></a>
  </div>
  <a class="wa-flot" href="{wa_url}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">{ICO['wa']}<em class="wa__aviso" aria-hidden="true">1</em></a>
</div>
"""


def pagina(meta, cuerpo):
    hero = meta.get("hero", "no") == "si"
    url = meta["archivo"]
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{meta['titulo']}</title>
<meta name="description" content="{meta['descripcion']}">
<meta name="theme-color" content="#2e1608">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Chanticream">
<meta property="og:title" content="{meta['titulo']}">
<meta property="og:description" content="{meta['descripcion']}">
<meta property="og:image" content="{meta.get('og', 'assets/img/hero/vitrina.webp')}">
<meta property="og:locale" content="es_ES">
<link rel="icon" href="assets/img/marca/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="assets/img/marca/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@500;700&family=Figtree:ital,wght@0,400..800;1,400..800&family=Young+Serif&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css?v={VERSION}">
{meta.get('head', '')}
</head>
<body class="{'con-hero' if hero else ''}" data-pagina="{meta['clave']}">
{intro() if meta['clave'] == 'inicio' else ''}
{header(meta['clave'])}
<main id="contenido">
{cuerpo}
</main>
{footer(meta['clave'])}
<script src="assets/js/datos.js?v={VERSION}"></script>
<script src="assets/js/site.js?v={VERSION}"></script>
</body>
</html>
"""


def construir():
    for f in sorted(SRC.glob("*.html")):
        txt = f.read_text(encoding="utf-8")
        m = re.match(r"---\n(.*?)\n---\n", txt, re.S)
        meta = dict(
            (k.strip(), v.strip()) for k, v in (l.split(":", 1) for l in m.group(1).splitlines() if ":" in l)
        )
        cuerpo = txt[m.end():]
        # marcadores reutilizables dentro de las páginas
        cuerpo = re.sub(r"\{\{deco:([\w-]+):(izq|der):(arriba|abajo)\}\}",
                        lambda g: f'<img class="deco deco--{g.group(2)} deco--{g.group(3)}" src="assets/img/deco/{g.group(1)}.webp" alt="" aria-hidden="true" loading="lazy">', cuerpo)
        cuerpo = re.sub(r"\{\{goteo:(\d+)\}\}", lambda g: f'<div class="goteo">{goteo(int(g.group(1)))}</div>', cuerpo)
        cuerpo = re.sub(r"\{\{ico:([\w-]+)\}\}", lambda g: ICO[g.group(1)], cuerpo)
        for k, v in {"WA": WA, "TEL": TEL, "IG": IG, "UBER": UBER, "GOOGLE": GOOGLE, "TRIP": TRIP, "COMO_LLEGAR": COMO_LLEGAR}.items():
            cuerpo = cuerpo.replace("{{" + k + "}}", v)
        (RAIZ / meta["archivo"]).write_text(pagina(meta, cuerpo), encoding="utf-8", newline="\n")
        print("ok", meta["archivo"])


if __name__ == "__main__":
    construir()
