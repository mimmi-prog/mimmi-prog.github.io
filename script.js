const sections = ['blog', 'interesser', 'sang', 'venner', 'om'];

const wraps = {
  blog:       'wrap-blog',
  interesser: 'wrap-interesser',
  sang:       'wrap-sang',
  venner:     'wrap-venner',
  om:         'wrap-om'
};

async function loadSections() {
  for (const id of sections) {
    try {
      const res = await fetch(`sections/${id}.html`);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    } catch (e) {
      console.warn(`Kunne ikke laste seksjon: ${id}`);
    }
  }
}

const images = [
  'images/17 mai.jpg',
  'images/boden.jpg',
  'images/bybb.jpg',
  'images/chillern dudes.jpg',
  'images/erv.jpg',
  'images/karni hytte.jpg',
  'images/klatring.jpg',
  'images/meg.jpg',
  'images/otto og astar.jpg',
  'images/otto og kristian.jpg',
  'images/pappa.jpg',
  'images/porsche.jpg',
  'images/sondre og ørnen.jpg',
  'images/sykkel.jpg',
  'images/ørn pistol.jpg',
  'images/ørnen.jpg',
];
let imageIndex = 0;
let active = null;
let startX, startY, origX, origY;
let highestZ = 10;

function spawnImage() {
  if (imageIndex >= images.length) return;

  const img = document.createElement('img');
  img.src = images[imageIndex];
  img.classList.add('board-img');
  imageIndex++;

  const x = Math.random() * (window.innerWidth  - 220);
  const y = Math.random() * (window.innerHeight - 220);

  img.style.position = 'fixed';
  img.style.left = x + 'px';
  img.style.top  = y + 'px';
  img.style.zIndex = ++highestZ;

  document.querySelector('.board').appendChild(img);

  img.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    active = img;

    const rect = img.getBoundingClientRect();
    origX  = rect.left;
    origY  = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    highestZ++;
    img.style.zIndex = highestZ;
  });
}

function toggle(id, wrapId) {
  const isOpen = document.getElementById(id).classList.contains('open');

  sections.forEach(s => {
    document.getElementById(s).classList.remove('open');
    document.getElementById(wraps[s]).classList.remove('active');
  });

  if (!isOpen) {
    spawnImage();

    const section = document.getElementById(id);
    const wrap    = document.getElementById(wrapId);

    const panelTop = document.querySelector('.panel').getBoundingClientRect().top;
    const wrapTop  = wrap.getBoundingClientRect().top;
    const isMobile = window.innerWidth <= 768;
    const offset   = Math.max(0, wrapTop - panelTop + (isMobile ? 20 : 100));

    section.style.paddingTop = offset + 'px';
    section.classList.add('open');
    wrap.classList.add('active');
  }
}

window.addEventListener('mousemove', e => {
  if (!active) return;
  active.style.left = (origX + e.clientX - startX) + 'px';
  active.style.top  = (origY + e.clientY - startY) + 'px';
});

window.addEventListener('mouseup', () => {
  active = null;
});

loadSections();