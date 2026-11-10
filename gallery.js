const photography = [
  { id: 'landscape', title: 'Landscape', total: 2 },
  { id: 'architecture', title: 'Architecture', total: 3 },
  { id: 'portrait', title: 'Portrait', total: 3 },
  { id: 'abstraction', title: 'Abstraction', total: 2 },
  { id: 'others', title: 'Other Works', total: 2 },
];

const bookmarks = document.querySelector('.bookmarks');
const bookmarkTemplate = document.querySelector('#bookmark-template');
const gallery = document.querySelector('#series');
const galleryTitle = gallery.querySelector('#series-title');
const galleryScroll = gallery.querySelector('.series-scroll');
const hasPhotos = window.portfolioHasPhotos === true;
let previewed = null;
let openedFrom = null;

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

function openSeries(series, bookmark) {
  clearPreview();
  openedFrom = bookmark;
  gallery.className = 'series ' + series.id;
  galleryTitle.textContent = series.title;
  galleryScroll.replaceChildren();

  for (let i = 1; i <= series.total; i++) {
    const label = numberLabel(i);
    const piece = document.createElement('figure');
    piece.className = 'series-photo' + (hasPhotos ? '' : ' sample');
    const caption = document.createElement('figcaption');
    caption.textContent = label + ' / ' + numberLabel(series.total);
    if (hasPhotos) {
      const file = 'gallery-media/' + series.id + '-' + label + '.jpg';
      const photo = loadPhoto(file, series.title + ' photograph ' + label, () => piece.classList.add('sample'));
      photo.loading = i === 1 ? 'eager' : 'lazy';
      piece.append(photo);
    }
    piece.append(caption);
    galleryScroll.append(piece);
  }
  gallery.showModal();
  galleryScroll.scrollTop = 0;
}

photography.forEach((series, index) => {
  const bookmark = bookmarkTemplate.content.firstElementChild.cloneNode(true);
  bookmark.classList.add(series.id);
  bookmark.querySelector('.bookmark-number').textContent = numberLabel(index + 1);
  bookmark.querySelector('.bookmark-title').textContent = series.title;
  bookmark.querySelector('.bookmark-count').textContent = numberLabel(series.total) + ' photographs';
  if (hasPhotos) {
    const frame = bookmark.querySelector('.bookmark-cover');
    frame.classList.add('has-image');
    const cover = loadPhoto('gallery-media/' + series.id + '-cover.jpg', '', () => frame.classList.remove('has-image'));
    cover.draggable = false;
    frame.append(cover);
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
