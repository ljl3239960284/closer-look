const signature = document.querySelector('.signature');
const screens = [...document.querySelectorAll('main > .screen')];
const desktopWheel = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let lastPageWheel = -Infinity;
let wheelTransitionUntil = 0;

window.addEventListener('wheel', event => {
  if (!desktopWheel.matches || !event.cancelable || event.defaultPrevented
      || event.ctrlKey || event.metaKey || event.shiftKey
      || Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      || document.querySelector('dialog[open]')) return;

  const now = performance.now();
  const sameGesture = now - lastPageWheel < 180;
  if (sameGesture || now < wheelTransitionUntil) {
    lastPageWheel = now;
    event.preventDefault();
    return;
  }

  const direction = Math.sign(event.deltaY);
  const next = direction > 0
    ? screens.find(screen => screen.getBoundingClientRect().top > 2)
    : screens.findLast(screen => screen.getBoundingClientRect().top < -2);
  if (!next) return;

  event.preventDefault();
  lastPageWheel = now;
  wheelTransitionUntil = now + (reducedMotion.matches ? 0 : 500);
  next.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
}, { passive: false });

const experienceObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('is-in-view', entry.isIntersecting);
  }
}, { threshold: .55 });
experienceObserver.observe(document.querySelector('.motion'));
experienceObserver.observe(signature);

const signatureTones = ['#454e55', '#a09381', '#625755', '#353643', '#777873'];
for (const strip of signature.querySelectorAll('.signature-strip')) {
  const track = document.createElement('div');
  track.className = 'signature-track';
  const sequence = document.createElement('div');
  sequence.className = 'signature-sequence';
  for (const [index, entry] of strip.dataset.frames.split(' ').entries()) {
    const [file, width, height] = entry.split(':');
    const tile = document.createElement('div');
    tile.className = 'signature-tile';
    const frame = document.createElement('span');
    frame.className = 'signature-frame';
    if (file === 'monochrome-01') frame.classList.add('signature-scan-crop');
    frame.style.setProperty('--tile-tone', signatureTones[index % signatureTones.length]);
    frame.style.setProperty('--frame-ratio', width + ' / ' + height);
    if (window.portfolioHasPhotos === true) {
      const image = document.createElement('img');
      image.alt = '';
      image.decoding = 'async';
      image.src = 'gallery-media/intro/' + file + '.jpg';
      image.addEventListener('error', () => image.remove(), { once: true });
      frame.append(image);
    }
    tile.append(frame);
    sequence.append(tile);
  }
  track.append(sequence, sequence.cloneNode(true));
  strip.append(track);

  // Each half of the track must fill the viewport before the loop resets.
  const fillStrip = new ResizeObserver(() => {
    const sequenceWidth = sequence.getBoundingClientRect().width;
    if (!sequenceWidth) return;
    const sequenceCount = 2 * Math.max(1, Math.ceil(strip.clientWidth / sequenceWidth));
    while (track.childElementCount > sequenceCount) track.lastElementChild.remove();
    while (track.childElementCount < sequenceCount) track.append(sequence.cloneNode(true));
  });
  fillStrip.observe(strip);
}
const stripToggle = signature.querySelector('.signature-toggle');
stripToggle.addEventListener('click', () => {
  const paused = signature.classList.toggle('is-paused');
  stripToggle.setAttribute('aria-pressed', String(paused));
  stripToggle.textContent = paused ? '▶' : 'Ⅱ';
});

if (window.portfolioHasPhotos === true) {
  const image = document.querySelector('.film-still');
  image.addEventListener('error', () => { image.hidden = true; }, { once: true });
  image.src = image.dataset.src;
  image.hidden = false;
}

const filmCard = document.querySelector('.film-card');
const filmPlayer = document.querySelector('#film-player');
const filmEmbed = filmPlayer.querySelector('.film-embed');
const filmUrl = window.portfolioFilmUrl;

if (filmUrl) {
  const source = new URL(filmUrl);
  let videoId = null;
  if (source.hostname === 'youtu.be') videoId = source.pathname.slice(1);
  if (source.hostname === 'www.youtube.com' || source.hostname === 'youtube.com') videoId = source.searchParams.get('v');
  if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    filmCard.disabled = false;
    filmPlayer.querySelector('.film-external').href = filmUrl;
    filmCard.addEventListener('click', () => {
      const embed = document.createElement('iframe');
      embed.title = 'RestCue film';
      embed.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      embed.allowFullscreen = true;
      embed.referrerPolicy = 'strict-origin-when-cross-origin';
      embed.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      filmEmbed.replaceChildren(embed);
      filmPlayer.showModal();
    });
  }
}
filmPlayer.addEventListener('close', () => {
  filmEmbed.replaceChildren();
  filmCard.focus({ preventScroll: true });
});
