// Team Bundle Builder
document.addEventListener('DOMContentLoaded', () => {
  const builder = document.getElementById('bundleBuilder');
  if (!builder) return;

  const state = {
    qty: 10,
    dock: true,
    hrVests: false,
    spareVests: false
  };

  const prices = {
    unit: 349.99,
    dock: 799.99,
    hrVest: 199.99,
    vest: 74.99
  };

  const discounts = {
    5: 0.06,
    10: 0.10,
    15: 0.12,
    20: 0.14,
    30: 0.16
  };

  function getDiscount(qty) {
    if (qty >= 30) return discounts[30];
    if (qty >= 20) return discounts[20];
    if (qty >= 15) return discounts[15];
    if (qty >= 10) return discounts[10];
    if (qty >= 5) return discounts[5];
    return 0;
  }

  function render() {
    const discount = getDiscount(state.qty);
    const unitPrice = prices.unit * (1 - discount);
    const unitsTotal = unitPrice * state.qty;
    const originalTotal = prices.unit * state.qty;
    const dockTotal = state.dock ? prices.dock : 0;
    const hrTotal = state.hrVests ? prices.hrVest * state.qty : 0;
    const vestTotal = state.spareVests ? prices.vest * state.qty : 0;
    const grandTotal = unitsTotal + dockTotal + hrTotal + vestTotal;
    const savings = (originalTotal - unitsTotal) + (state.dock ? 0 : 0);
    const perPlayer = grandTotal / state.qty;

    // Update qty buttons
    document.querySelectorAll('.bundle-qty-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.qty) === state.qty);
    });

    // Update line items
    document.getElementById('bundleUnitsQty').textContent = `${state.qty}× SPT-NXT Pack`;
    document.getElementById('bundleUnitsPrice').textContent = `$${unitsTotal.toFixed(2)}`;
    document.getElementById('bundleUnitsOriginal').textContent = discount > 0 ? `Was $${originalTotal.toFixed(2)}` : '';
    document.getElementById('bundleUnitsDetail').textContent = `$${unitPrice.toFixed(2)}/unit — save ${Math.round(discount * 100)}%`;

    document.getElementById('bundleDockCheck').className = `bundle-line-item__check ${state.dock ? 'checked' : ''}`;
    document.getElementById('bundleDockPrice').textContent = state.dock ? `$${prices.dock.toFixed(2)}` : '—';

    document.getElementById('bundleHRCheck').className = `bundle-line-item__check ${state.hrVests ? 'checked' : ''}`;
    document.getElementById('bundleHRQty').textContent = `${state.qty}× Heart Rate Vest`;
    document.getElementById('bundleHRPrice').textContent = state.hrVests ? `$${hrTotal.toFixed(2)}` : '—';

    document.getElementById('bundleVestCheck').className = `bundle-line-item__check ${state.spareVests ? 'checked' : ''}`;
    document.getElementById('bundleVestQty').textContent = `${state.qty}× Spare Vest`;
    document.getElementById('bundleVestPrice').textContent = state.spareVests ? `$${vestTotal.toFixed(2)}` : '—';

    // Summary
    document.getElementById('bundleTotal').textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('bundlePerPlayer').textContent = `$${perPlayer.toFixed(2)}/player`;
    document.getElementById('bundleSavings').textContent = savings > 0 ? `You save: $${savings.toFixed(2)} (${Math.round(discount * 100)}%)` : '';
  }

  // Qty button clicks
  document.querySelectorAll('.bundle-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.qty = parseInt(btn.dataset.qty);
      render();
    });
  });

  // Checkbox toggles
  document.getElementById('bundleDockCheck').addEventListener('click', () => { state.dock = !state.dock; render(); });
  document.getElementById('bundleHRCheck').addEventListener('click', () => { state.hrVests = !state.hrVests; render(); });
  document.getElementById('bundleVestCheck').addEventListener('click', () => { state.spareVests = !state.spareVests; render(); });

  // Add bundle to cart
  window.addBundleToCart = function() {
    const discount = getDiscount(state.qty);
    const unitPrice = prices.unit * (1 - discount);
    cart.add({ id: 'spt-nxt-team', name: `SPT-NXT Pack ×${state.qty}`, price: unitPrice * state.qty, size: `Team Pack (${state.qty} units)` });
    if (state.dock) cart.add({ id: 'dock', name: 'NXT Charging Dock', price: prices.dock });
    if (state.hrVests) cart.add({ id: 'hr-vest-team', name: `Heart Rate Vest ×${state.qty}`, price: prices.hrVest * state.qty, size: 'Mixed sizes' });
    if (state.spareVests) cart.add({ id: 'vest-team', name: `Spare Vest ×${state.qty}`, price: prices.vest * state.qty, size: 'Mixed sizes' });
  };

  render();
});
