const photography = [
  { id: 'landscape', title: 'Landscape', order: [2, 1], desktopCover: 2 },
  { id: 'architecture', title: 'Architecture', order: [2, 1, 3], desktopCover: 2 },
  { id: 'portrait', title: 'Portrait', order: [1, 2, 3], desktopCover: 1 },
  { id: 'action', title: 'Action', order: [3, 4, 5, 6, 1, 2], desktopCover: 3 },
  { id: 'monochrome', title: 'Monochrome', order: [1, 2, 5, 6, 4, 3], desktopCover: 2 },
  { id: 'abstraction', title: 'Abstraction', order: [1, 2], desktopCover: 1 },
  { id: 'others', title: 'Other Works', order: [3, 2, 4, 1], desktopCover: 2 },
];

const bookmarks = document.querySelector('.bookmarks');
const bookmarkTemplate = document.querySelector('#bookmark-template');
const gallery = document.querySelector('#series');
const galleryTitle = gallery.querySelector('#series-title');
const galleryScroll = gallery.querySelector('.series-scroll');
const galleryPosition = gallery.querySelector('.series-position');
const previousPhoto = gallery.querySelector('.series-previous');
const nextPhoto = gallery.querySelector('.series-next');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hasPhotos = window.portfolioHasPhotos === true;
let previewed = null;
let openedFrom = null;
let currentPhoto = 0;

function numberLabel(number) {
  return String(number).padStart(2, '0');
}

function loadPhoto(src, description, fallback) {
  const photo = document.createElement('img');
  photo.alt = description;
  photo.decoding = 'async';
  photo.addEventListener('error', () => {
    photo.remove();
    fallback?.();
  }, { once: true });
  photo.src = src;
  return photo;
}

function clearPreview() {
  previewed?.classList.remove('is-previewed');
  previewed = null;
}

function updatePagination() {
  const height = galleryScroll.clientHeight;
  const total = galleryScroll.childElementCount;
  if (!height || !total) return;
  currentPhoto = Math.max(0, Math.min(total - 1, Math.round(galleryScroll.scrollTop / height)));
  const position = numberLabel(currentPhoto + 1) + ' / ' + numberLabel(total);
  if (galleryPosition.textContent !== position) galleryPosition.textContent = position;
  previousPhoto.setAttribute('aria-disabled', String(currentPhoto === 0));
  nextPhoto.setAttribute('aria-disabled', String(currentPhoto === total - 1));
}

function movePhoto(direction) {
  const target = galleryScroll.children[currentPhoto + direction];
  if (!target) return;
  galleryScroll.scrollTo({ top: target.offsetTop, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}

galleryScroll.addEventListener('scroll', updatePagination, { passive: true });
previousPhoto.addEventListener('click', () => movePhoto(-1));
nextPhoto.addEventListener('click', () => movePhoto(1));

function openSeries(series, bookmark) {
  clearPreview();
  openedFrom = bookmark;
  gallery.className = 'series ' + series.id;
  galleryTitle.textContent = series.title;
  galleryScroll.replaceChildren();

  series.order.forEach((photoNumber, index) => {
    const label = numberLabel(index + 1);
    const piece = document.createElement('figure');
    piece.className = 'series-photo' + (hasPhotos ? '' : ' sample');
    const caption = document.createElement('figcaption');
    caption.className = 'sr-only';
    caption.textContent = label + ' / ' + numberLabel(series.order.length);
    if (hasPhotos) {
      const file = 'gallery-media/' + series.id + '-' + numberLabel(photoNumber) + '.jpg';
      const photo = loadPhoto(file, series.title + ' photograph ' + label, () => piece.classList.add('sample'));
      photo.loading = index === 0 ? 'eager' : 'lazy';
      piece.append(photo);
    }
    piece.append(caption);
    galleryScroll.append(piece);
  });
  gallery.showModal();
  galleryScroll.scrollTop = 0;
  updatePagination();
}

photography.forEach((series, index) => {
  const bookmark = bookmarkTemplate.content.firstElementChild.cloneNode(true);
  bookmark.classList.add(series.id);
  bookmark.querySelector('.bookmark-number').textContent = numberLabel(index + 1);
  bookmark.querySelector('.bookmark-title').textContent = series.title;
  bookmark.querySelector('.bookmark-count').textContent = numberLabel(series.order.length) + ' photographs';
  if (hasPhotos) {
    const frame = bookmark.querySelector('.bookmark-cover');
    const picture = document.createElement('picture');
    const desktop = document.createElement('source');
    desktop.media = '(width > 700px) and (hover: hover), (width > 700px) and (orientation: landscape)';
    desktop.srcset = 'gallery-media/' + series.id + '-' + numberLabel(series.desktopCover) + '.jpg';
    frame.classList.add('has-image');
    const cover = loadPhoto('gallery-media/' + series.id + '-cover.jpg', '', () => {
      picture.remove();
      frame.classList.remove('has-image');
    });
    cover.draggable = false;
    picture.append(desktop, cover);
    frame.append(picture);
  }

  let press = null;
  bookmark.addEventListener('pointerdown', event => {
    press = { type: event.pointerType, x: event.clientX, y: event.clientY };
  });
  bookmark.addEventListener('pointercancel', () => { press = null; });
  bookmark.addEventListener('click', event => {
    const tapped = event.detail > 0 && (press?.type === 'touch' || press?.type === 'pen');
    const dragged = event.detail > 0 && press?.type === 'mouse'
      && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8;
    press = null;
    if (dragged) return;
    if (tapped && previewed !== bookmark) {
      clearPreview();
      previewed = bookmark;
      bookmark.classList.add('is-previewed');
      return;
    }
    openSeries(series, bookmark);
  });
  bookmarks.append(bookmark);
});

bookmarks.addEventListener('pointermove', event => {
  if (event.pointerType === 'mouse') clearPreview();
});
document.addEventListener('pointerdown', event => {
  if (!bookmarks.contains(event.target)) clearPreview();
});
gallery.addEventListener('close', () => openedFrom?.focus({ preventScroll: true }));
