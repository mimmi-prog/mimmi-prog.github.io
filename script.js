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
  "Morgens Voll-Erektion, was schon lange nicht mehr vorkam - Thomas Mann",
  "Hvorfor sitte inne når alt håp er ute?",
  "Det er alltid lys inni tunnelen også!"
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

// async function loadSections() {
//   await Promise.all(
//     SECTIONS.map(id => loadSection(id))
//   );
//   updateUkensUtsagn();
// }

async function loadSection(id) {
  try {
    const res = await fetch(`sections/${id}.html`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch {
    console.warn(`Kunne ikke laste seksjon: ${id}`);
  }
}

async function loadSections() {
  await Promise.all(
    SECTIONS.map(id => loadSection(id))
  );
  updateUkensUtsagn();
  setupAlbumListeners(); // <-- Add this here
}

function setupAlbumListeners() {
  // Find ALL album cover images across both music and blog sections
  document.querySelectorAll('.album-cover img').forEach(img => {
    img.classList.add('album-dragged'); 
    img.addEventListener('mousedown', onAlbumMouseDown);
  });
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

  // Target ONLY board images that are NOT album covers
  document.querySelectorAll('.board-img:not(.album-dragged)').forEach(img => {
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
  // Target ONLY board images that are NOT album covers
  document.querySelectorAll('.board-img:not(.album-dragged)').forEach(img => {
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

  drag.active.classList.add('has-been-dragged');
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


// ─── Album cover drag ─────────────────────────────────────────────────────────

function onAlbumMouseDown(e) {
  const img = e.currentTarget;

  // If it hasn't been detached from the blog/music grid yet, do it now!
  if (!img.dataset.reparented) {
    const rect = img.getBoundingClientRect();
    
    img.style.width    = rect.width + 'px';
    img.style.height   = rect.height + 'px';
    img.style.position = 'fixed';
    img.style.margin   = '0';
    img.style.left     = rect.left + 'px';
    img.style.top      = rect.top + 'px';
    img.style.zIndex   = ++highestZ;
    img.dataset.reparented = 'true';

    img.classList.add('board-img', 'has-been-dragged');
    document.querySelector('.board').appendChild(img);
  }

  // Now trigger your standard dragging system
  onImageMouseDown(e);
}


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