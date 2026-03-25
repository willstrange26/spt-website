// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.header__menu-btn');
  menu.classList.toggle('active');
  btn.classList.toggle('active');
  document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('active');
    document.querySelector('.header__menu-btn').classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('mobileMenu').classList.remove('active');
    document.querySelector('.header__menu-btn').classList.remove('active');
    document.body.style.overflow = '';
  }
});
