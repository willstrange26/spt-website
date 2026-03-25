// Cart drawer
function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
}

// Close cart on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleCart();
    }
  }
});

// Simple cart state (demo only)
const cart = {
  items: [],

  add(product) {
    const existing = this.items.find(i => i.id === product.id && i.size === product.size);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.render();
    toggleCart();
  },

  remove(index) {
    this.items.splice(index, 1);
    this.render();
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  render() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const countEl = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotal');

    const totalItems = this.items.reduce((sum, item) => sum + item.qty, 0);

    if (countEl) {
      countEl.textContent = totalItems;
      countEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (this.items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--space-16) 0; color: var(--muted);">
          <p style="font-size: var(--text-lg); margin-bottom: var(--space-3);">Your cart is empty</p>
          <a href="/collections/all" class="btn btn--primary" onclick="toggleCart()">Start Shopping</a>
        </div>
      `;
      footer.style.display = 'none';
      return;
    }

    container.innerHTML = this.items.map((item, i) => `
      <div class="cart-drawer__item">
        <div style="width: 80px; height: 80px; border-radius: 8px; background: var(--light-grey); display: flex; align-items: center; justify-content: center; font-size: 32px;">📡</div>
        <div class="cart-drawer__item-details">
          <div class="cart-drawer__item-title">${item.name}</div>
          <div class="cart-drawer__item-variant">${item.size ? 'Size: ' + item.size : ''} ${item.qty > 1 ? '× ' + item.qty : ''}</div>
          <div class="cart-drawer__item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <button onclick="cart.remove(${i})" style="color: var(--muted); padding: 4px;" aria-label="Remove">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
      </div>
    `).join('');

    // Upsell
    const hasHRVest = this.items.some(i => i.id === 'hr-vest');
    if (!hasHRVest) {
      container.innerHTML += `
        <div class="cart-drawer__upsell">
          <div class="cart-drawer__upsell-title">Complete your setup</div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 48px; height: 48px; background: var(--white); border-radius: 8px; display: flex; align-items: center; justify-content: center;">💓</div>
            <div style="flex: 1;">
              <div style="font-weight: 500; font-size: 14px;">Heart Rate Vest</div>
              <div style="font-size: 13px; color: var(--muted);">$199.99</div>
            </div>
            <button class="btn btn--sm btn--outline" onclick="cart.add({id:'hr-vest', name:'Heart Rate Vest & Monitor', price:199.99, size:'M'})">Add</button>
          </div>
        </div>
      `;
    }

    const total = this.getTotal();
    const freeShippingThreshold = 500;
    const remaining = Math.max(0, freeShippingThreshold - total);
    const progress = Math.min(100, (total / freeShippingThreshold) * 100);

    footer.style.display = 'block';
    footer.querySelector('.cart-drawer__shipping-progress').style.width = progress + '%';
    footer.querySelector('.cart-drawer__shipping-text').innerHTML = remaining > 0
      ? `Spend <strong>$${remaining.toFixed(2)} more</strong> for free shipping`
      : '<strong style="color: var(--success);">You qualify for free shipping!</strong>';
    totalEl.textContent = '$' + total.toFixed(2);
  }
};

// Global add to cart function
function addToCart(product) {
  cart.add(product);
}
