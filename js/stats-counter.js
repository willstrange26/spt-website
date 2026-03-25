// Animated stats counter using Intersection Observer
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
  if (num >= 1000) return num.toLocaleString();
  return num.toString();
}

function animateCounter(element, target) {
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.floor(eased * target);
    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(target);
    }
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.stat__number');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        if (target && !counter.dataset.animated) {
          counter.dataset.animated = 'true';
          animateCounter(counter, target);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats__grid').forEach(grid => {
  statsObserver.observe(grid);
});
