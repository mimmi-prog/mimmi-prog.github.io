// ─── Konfigurasjon ───────────────────────────────────────────────────────────

const SECTIONS = ['blog', 'interesser', 'utsagn', 'venner', 'om', 'musikk'];

const IMAGES = [
  'images/meg.jpg',
  'images/boden.jpg',
  'images/bybb.jpg',
  'images/chillern dudes.jpg',
  'images/erv.jpg',
  'images/karni hytte.jpg',
  'images/klatring.jpg',
  'images/17 mai.jpg',
  'images/otto og astar.jpg',
  'images/otto og kristian.jpg',
  'images/pappa.jpg',
  'images/porsche.jpg',
  'images/sondre og ørnen.jpg',
  'images/sykkel.jpg',
  'images/ørn pistol.jpg',
  'images/ørnen.jpg',
];

const UTSAGN = [
  "Spiser mig selv til morgenmad",
  "Rotta og kniven er ikke hjemme så jeg føler savn, alle her er sinte på A1 han drar til københavn.",
  "Våkna opp i dag tidlig og var litt down as skal jeg være ærlig, jeg gikk på en...jeg gikk på en [TSSSSSTT] med en [TSSSST], også gikk jeg inn på badet og så meg selv i speilet og var sånn; Wooof. Hvem er han karen der?! Og så kom jeg på åh faen sant det det er meg LETS GO",
  "Du klarer det!",
  "Aldri gi opp, med mindre du absolutt må",
  "Det er alltid lys inni tunnelen også",
  "Livet er enten et dristig eventyr, eller ingenting i det hele tatt.",
  "Morgens Voll-Erektion, was schon lange nicht mehr vorkam - Thomas Mann",
];


// ─── State ───────────────────────────────────────────────────────────────────

const drag = {
  active: null,
  startX: 0,
  startY: 0,
  origX: 0,
  origY: 0,
};

let imageIndex = 0;
let highestZ = 10;


// ─── Innlasting ──────────────────────────────────────────────────────────────

async function loadSections() {
  await Promise.all(
    SECTIONS.map(id => loadSection(id))
  );
  updateUkensUtsagn();
}

async function loadSection(id) {
  try {
    const res = await fetch(`sections/${id}.html`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch {
    console.warn(`Kunne ikke laste seksjon: ${id}`);
  }
}


// ─── Seksjoner ───────────────────────────────────────────────────────────────

function toggle(id) {
  const isOpen = document.getElementById(id).classList.contains('open');
  closeAllSections();

  if (!isOpen) {
    openSection(id);
  }
}

function closeAllSections() {
  SECTIONS.forEach(s => {
    document.getElementById(s).classList.remove('open');
    document.getElementById(`wrap-${s}`).classList.remove('active');
  });

  document.querySelectorAll('.board-img').forEach(img => {
    img.style.width = '200px';
  });
}

function openSection(id) {
  const section = document.getElementById(id);
  const wrap    = document.getElementById(`wrap-${id}`);

  const panelTop = document.querySelector('.panel').getBoundingClientRect().top;
  const wrapTop  = wrap.getBoundingClientRect().top;
  const isMobile = window.innerWidth <= 768;
  const offset   = Math.max(0, wrapTop - panelTop + (isMobile ? 20 : 100));

  section.style.paddingTop = offset + 'px';
  section.classList.add('open');
  wrap.classList.add('active');

  spawnImage();
  updateImageSizes(id);
}

function updateImageSizes(activeId) {
  document.querySelectorAll('.board-img').forEach(img => {
    const isMegJpg = img.src.includes('meg.jpg');
    img.style.width = (activeId === 'om' && isMegJpg) ? '300px' : '200px';
    img.style.transition = 'width 0.3s ease';
  });
}


// ─── Bilder / board ──────────────────────────────────────────────────────────

function spawnImage() {
  if (imageIndex >= IMAGES.length) return;

  const img = document.createElement('img');
  img.src = IMAGES[imageIndex++];
  img.classList.add('board-img');

  const x = window.innerWidth * 0.35 + Math.random() * (window.innerWidth * 0.65 - 220);
  const y = Math.random() * (window.innerHeight - 220);

  img.style.cssText = `position:fixed; left:${x}px; top:${y}px; z-index:${++highestZ}`;

  img.addEventListener('mousedown', onImageMouseDown);
  document.querySelector('.board').appendChild(img);
}

function onImageMouseDown(e) {
  e.preventDefault();
  e.stopPropagation();

  const rect = e.currentTarget.getBoundingClientRect();
  drag.active = e.currentTarget;
  drag.origX  = rect.left;
  drag.origY  = rect.top;
  drag.startX = e.clientX;
  drag.startY = e.clientY;

  drag.active.style.zIndex = ++highestZ;
}


// ─── Dra-og-slipp ────────────────────────────────────────────────────────────

window.addEventListener('mousemove', e => {
  if (!drag.active) return;
  drag.active.style.left = (drag.origX + e.clientX - drag.startX) + 'px';
  drag.active.style.top  = (drag.origY + e.clientY - drag.startY) + 'px';
});

window.addEventListener('mouseup', () => {
  drag.active = null;
});


// ─── Hover-opacity ───────────────────────────────────────────────────────────

document.querySelectorAll('.letter-wrap').forEach(wrap => {
  const activeSection = wrap.id.replace('wrap-', '');

  wrap.addEventListener('mouseenter', () => {
    SECTIONS.forEach(s => {
      const el = document.getElementById(s);
      el.style.opacity    = s === activeSection ? '1' : '0.15';
      el.style.transition = 'opacity 0.2s ease';
    });
  });

  wrap.addEventListener('mouseleave', () => {
    SECTIONS.forEach(s => {
      document.getElementById(s).style.opacity = '1';
    });
  });
});


// ─── Ukens utsagn ────────────────────────────────────────────────────────────

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function updateUkensUtsagn() {
  const el = document.querySelector('#utsagn p:last-child');
  if (!el) return;
  el.textContent = UTSAGN[getWeekNumber() % UTSAGN.length];
}


// ─── Blogg ───────────────────────────────────────────────────────────────────

function openPost(post) {
  post.classList.toggle('open');
}


// ─── Init ────────────────────────────────────────────────────────────────────

loadSections();