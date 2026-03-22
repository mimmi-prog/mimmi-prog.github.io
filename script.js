const sections = ['blog', 'interesser', 'utsagn', 'venner', 'om', 'musikk'];

const wraps = {
  blog:       'wrap-blog',
  interesser: 'wrap-interesser',
  utsagn:     'wrap-utsagn',
  venner:     'wrap-venner',
  om:         'wrap-om',
  musikk:    'wrap-musikk'
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
  updateUkensUtsagn();
}

/* blog post */
function openPost(post) {
  post.classList.toggle('open');
}

const images = [
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

  const x = window.innerWidth * 0.35 + Math.random() * (window.innerWidth * 0.65 - 220);
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

  document.querySelectorAll('.board-img').forEach(img => {
    img.style.width = '200px';
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

    document.querySelectorAll('.board-img').forEach(img => {
      if (id === 'om') {
        img.style.width = img.src.includes('meg.jpg') ? '300px' : '200px';
        img.style.transition = 'width 0.3s ease';
      } else {
        img.style.width = '200px';
      }
    });
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

/* Opacity when hover */

document.querySelectorAll('.letter-wrap').forEach(wrap => {
  wrap.addEventListener('mouseenter', () => {
    const activeSection = wrap.id.replace('wrap-', '');
    sections.forEach(s => {
      const el = document.getElementById(s);
      if (s !== activeSection) {
        el.style.opacity = '0.15';
        el.style.transition = 'opacity 0.2s ease';
      } else {
        el.style.opacity = '1';
      }
    });
  });

  wrap.addEventListener('mouseleave', () => {
    sections.forEach(s => {
      document.getElementById(s).style.opacity = '1';
    });
  });
});

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function updateUkensUtsagn() {
  const utsagn = [
    "Spiser mig selv til morgenmad",
    "Rotta og kniven er ikke hjemme så jeg føler savn, alle her er sinte på A1 han drar til københavn.",
    "Våkna opp i dag tidlig og var litt down as skal jeg være ærlig, jeg gikk på en...jeg gikk på en [TSSSSSTT] med en [TSSSST], også gikk jeg inn på badet og så meg selv i speilet og var sånn; Wooof. Hvem er han karen der?! Og så kom jeg på åh faen sant det det er meg LETS GO",
    "Du klarer det!",
    "Aldri gi opp, med mindre du absolutt må",
    "Det er alltid lys inni tunnelen også",
    "Livet er enten et dristig eventyr, eller ingenting i det hele tatt.",
  ];

  const index = getWeekNumber() % utsagn.length;
  const el = document.querySelector('#utsagn p:last-child');
  if (el) el.textContent = utsagn[index];
}

loadSections();
setInterval(updateUkensUtsagn, 10000);