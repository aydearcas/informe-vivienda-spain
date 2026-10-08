const sidebar = document.getElementById('reader-sidebar');
const toggle = document.querySelector('.menu-toggle');
const closeMenu = document.querySelector('.menu-close');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar índice' : 'Abrir índice');
  document.querySelector('main').inert = open;
  document.querySelector('.hero').inert = open;
  document.querySelector('.site-footer').inert = open;
  if (open) { sidebar.setAttribute('role', 'dialog'); sidebar.setAttribute('aria-modal', 'true'); }
  else { sidebar.removeAttribute('role'); sidebar.removeAttribute('aria-modal'); }
  if (open) closeMenu.focus();
};
toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
closeMenu.addEventListener('click', () => { setMenu(false); toggle.focus(); });
sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  if (document.body.classList.contains('menu-open')) {
    setMenu(false);
    const id = decodeURIComponent(link.hash.slice(1));
    const target = document.getElementById(id);
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
    const items = [...sidebar.querySelectorAll('a, button')];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !sidebar.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
});
matchMedia('(min-width: 801px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

const chapters = [...document.querySelectorAll('.report-section')];
const nav = [...document.querySelectorAll('.chapter-nav')];
const progress = document.querySelector('.reading-progress span');
let scheduled = false;
function updateReading() {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${Math.max(0, Math.min(100, (scrollY / scrollable) * 100))}%`;
  let current = null;
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= 160) current = chapter.id;
    else break;
  }
  nav.forEach((link) => {
    if (decodeURIComponent(link.hash.slice(1)) === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
}, { passive: true });
addEventListener('resize', updateReading);
updateReading();

const resizeTables = new ResizeObserver((entries) => entries.forEach(({ target }) => {
  const overflow = target.scrollWidth > target.clientWidth + 1;
  target.closest('.table-block').classList.toggle('has-overflow', overflow);
  target.setAttribute('tabindex', overflow ? '0' : '-1');
}));
document.querySelectorAll('.table-scroll').forEach((table) => resizeTables.observe(table));

const dialog = document.getElementById('figure-dialog');
const dialogImg = document.getElementById('dialog-img');
const zoom = document.getElementById('figure-zoom');
const imageBox = document.querySelector('.dialog-image');
document.querySelectorAll('.figure-open').forEach((link) => link.addEventListener('click', (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
  event.preventDefault();
  const figure = link.closest('figure');
  const image = link.querySelector('img');
  dialogImg.src = image.src;
  dialogImg.alt = image.alt;
  document.getElementById('dialog-title').textContent = figure.querySelector('figcaption').textContent.replace(/#$/, '').trim();
  document.querySelector('.dialog-caption').textContent = figure.querySelector('.figure-source').textContent.trim();
  imageBox.classList.remove('is-original');
  zoom.setAttribute('aria-pressed', 'false');
  zoom.textContent = 'Tamaño original';
  dialog.showModal();
  document.body.classList.add('modal-open');
  document.getElementById('figure-close').focus();
}));
zoom.addEventListener('click', () => {
  const original = imageBox.classList.toggle('is-original');
  zoom.setAttribute('aria-pressed', String(original));
  zoom.textContent = original ? 'Ajustar a pantalla' : 'Tamaño original';
});
document.getElementById('figure-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});

const printButton = document.getElementById('print-report');
printButton.hidden = false;
printButton.addEventListener('click', () => window.print());
