// FAQ accordion
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const wasActive = item.classList.contains('active');

      // Close all
      item.closest('.faq-list, .faq-section, section').querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
      });

      // Toggle clicked
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
});
