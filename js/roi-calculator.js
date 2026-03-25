// ROI Calculator — cost per player per season
document.addEventListener('DOMContentLoaded', () => {
  const calc = document.getElementById('roiCalculator');
  if (!calc) return;

  const teamSizeInput = document.getElementById('roiTeamSize');
  const seasonsInput = document.getElementById('roiSeasons');
  const resultEl = document.getElementById('roiResult');
  const breakdownEl = document.getElementById('roiBreakdown');

  function calculate() {
    const teamSize = parseInt(teamSizeInput.value) || 15;
    const seasons = parseInt(seasonsInput.value) || 3;

    const unitPrice = 349.99;
    const dockPrice = 799.99;

    // Discount tiers
    let discount = 0;
    if (teamSize >= 30) discount = 0.16;
    else if (teamSize >= 20) discount = 0.14;
    else if (teamSize >= 15) discount = 0.12;
    else if (teamSize >= 10) discount = 0.10;
    else if (teamSize >= 5) discount = 0.06;

    const discountedUnit = unitPrice * (1 - discount);
    const totalUnits = discountedUnit * teamSize;
    const docks = teamSize > 1 ? Math.ceil(teamSize / 15) : 0;
    const totalDocks = dockPrice * docks;
    const totalUpfront = totalUnits + totalDocks;
    const perPlayerPerSeason = totalUpfront / teamSize / seasons;

    resultEl.textContent = `$${perPlayerPerSeason.toFixed(2)}`;
    breakdownEl.innerHTML = `
      <div style="font-size:var(--text-sm);color:rgba(255,255,255,0.6);margin-top:var(--space-3);">
        ${teamSize} units × $${discountedUnit.toFixed(2)} = $${totalUnits.toFixed(2)}<br>
        ${docks > 0 ? `${docks} dock${docks > 1 ? 's' : ''} × $${dockPrice.toFixed(2)} = $${totalDocks.toFixed(2)}<br>` : ''}
        Total: $${totalUpfront.toFixed(2)} over ${seasons} season${seasons > 1 ? 's' : ''}
      </div>
    `;
  }

  if (teamSizeInput) teamSizeInput.addEventListener('input', calculate);
  if (seasonsInput) seasonsInput.addEventListener('input', calculate);
  calculate();
});
