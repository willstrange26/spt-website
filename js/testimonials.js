// Simple testimonial carousel
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!track || !dots.length) return;

  let currentSlide = 0;
  const cards = track.querySelectorAll('.testimonial-card');
  const totalSlides = cards.length;

  function getCardsPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function goToSlide(index) {
    const cardsPerView = getCardsPerView();
    const maxSlide = Math.max(0, totalSlides - cardsPerView);
    currentSlide = Math.min(index, maxSlide);
    const offset = -(currentSlide * (100 / cardsPerView));
    track.style.transform = `translateX(${offset}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index, 10));
    });
  });

  // Auto-play
  let autoplay = setInterval(() => {
    const cardsPerView = getCardsPerView();
    const maxSlide = Math.max(0, totalSlides - cardsPerView);
    goToSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
  }, 5000);

  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      const cardsPerView = getCardsPerView();
      const maxSlide = Math.max(0, totalSlides - cardsPerView);
      goToSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
    }, 5000);
  });

  window.addEventListener('resize', () => goToSlide(currentSlide));
});
