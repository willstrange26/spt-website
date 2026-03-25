// Sticky add-to-cart bar — shows when main ATC button scrolls out of view
document.addEventListener('DOMContentLoaded', () => {
  const stickyAtc = document.getElementById('stickyAtc');
  const addToCartBtn = document.querySelector('.product-info__add-to-cart');
  if (!addToCartBtn || !stickyAtc) return;

  const observer = new IntersectionObserver(([entry]) => {
    stickyAtc.classList.toggle('visible', !entry.isIntersecting);
  }, { threshold: 0 });

  observer.observe(addToCartBtn);
});
