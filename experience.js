const opening = document.querySelector('.home');
const reduceExperienceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const experienceObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle('is-in-view', entry.isIntersecting);
  }
}, { threshold: .55 });
experienceObserver.observe(opening);
experienceObserver.observe(document.querySelector('.motion'));

if (window.portfolioHasPhotos === true) {
  for (const image of document.querySelectorAll('.home-art img, .film-still')) {
    image.addEventListener('error', () => { image.hidden = true; }, { once: true });
    image.src = image.dataset.src;
    image.hidden = false;
  }
}

opening.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || reduceExperienceMotion.matches) return;
  const frame = opening.getBoundingClientRect();
  const x = ((event.clientX - frame.left) / frame.width - .5) * 12;
  const y = ((event.clientY - frame.top) / frame.height - .5) * 12;
  opening.style.setProperty('--photo-x', x.toFixed(2) + 'px');
  opening.style.setProperty('--photo-y', y.toFixed(2) + 'px');
});
opening.addEventListener('pointerleave', () => {
  opening.style.setProperty('--photo-x', '0px');
  opening.style.setProperty('--photo-y', '0px');
});

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
