// GPS Tracker Mouse Effect — player follows cursor with signal + trail
(function() {
  const hero = document.getElementById('heroSection');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'trackerCanvas';
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.style.position = 'relative';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w, h;
  let mouseX = -100, mouseY = -100;
  let playerX = -100, playerY = -100;
  let isHovering = false;
  let trail = [];
  let signals = [];
  let lastTrailTime = 0;
  let totalDist = 0;
  let lastPlayerX = 0, lastPlayerY = 0;
  let speed = 0;
  let animFrame;

  // Ball physics
  const BALL_RADIUS_BIG = 22;  // before first kick — big and inviting
  const BALL_RADIUS_SMALL = 12; // after first kick — less obtrusive
  let ballRadius = BALL_RADIUS_BIG;
  let ballRadiusTarget = BALL_RADIUS_BIG;
  const BALL_FRICTION = 0.985;
  const BALL_BOUNCE = 0.7;
  const KICK_RADIUS = 35; // how close player needs to be to kick
  const KICK_FORCE = 1.8;
  let ballX, ballY, ballVX = 0, ballVY = 0, ballSpin = 0;
  let ballInitialised = false;
  let ballKicked = false; // true after first kick — hides "kick me" label

  function initBall() {
    // Start bottom-right corner, well away from centred hero content
    ballX = w * 0.85;
    ballY = h * 0.80;
    ballVX = 0; ballVY = 0; ballSpin = 0;
    ballInitialised = true;
  }

  function updateBall() {
    if (!ballInitialised) return;

    // Check collision with player (feet area)
    const dx = ballX - playerX;
    const dy = ballY - playerY;
    const distToBall = Math.sqrt(dx * dx + dy * dy);

    if (distToBall < KICK_RADIUS && distToBall > 0) {
      // Kick direction = from player to ball
      const nx = dx / distToBall;
      const ny = dy / distToBall;

      // Kick strength based on player speed
      const kickStrength = Math.max(speed * KICK_FORCE, 3);
      if (!ballKicked) {
        ballKicked = true;
        ballRadiusTarget = BALL_RADIUS_SMALL;
      }
      ballVX += nx * kickStrength;
      ballVY += ny * kickStrength;
      ballSpin += (nx > 0 ? 1 : -1) * kickStrength * 0.3;

      // Push ball out of collision range
      ballX = playerX + nx * (KICK_RADIUS + 2);
      ballY = playerY + ny * (KICK_RADIUS + 2);
    }

    // Apply velocity
    ballX += ballVX;
    ballY += ballVY;

    // Friction
    ballVX *= BALL_FRICTION;
    ballVY *= BALL_FRICTION;
    ballSpin *= 0.98;

    // Bounce off walls (with padding)
    const pad = ballRadius + 4;
    if (ballX < pad) { ballX = pad; ballVX = Math.abs(ballVX) * BALL_BOUNCE; ballSpin *= -0.5; }
    if (ballX > w - pad) { ballX = w - pad; ballVX = -Math.abs(ballVX) * BALL_BOUNCE; ballSpin *= -0.5; }
    if (ballY < pad) { ballY = pad; ballVY = Math.abs(ballVY) * BALL_BOUNCE; }
    if (ballY > h - pad) { ballY = h - pad; ballVY = -Math.abs(ballVY) * BALL_BOUNCE; }

    // Stop tiny velocities
    if (Math.abs(ballVX) < 0.01) ballVX = 0;
    if (Math.abs(ballVY) < 0.01) ballVY = 0;

    // Smooth radius transition
    ballRadius += (ballRadiusTarget - ballRadius) * 0.08;
  }

  function drawBall() {
    if (!ballInitialised) return;

    const R = ballRadius;

    // Shadow (doesn't rotate)
    ctx.save();
    ctx.translate(ballX + 3, ballY + R + 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.75, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();
    ctx.restore();

    // Ball (rotates with spin)
    ctx.save();
    ctx.translate(ballX, ballY);
    ctx.rotate(ballSpin);

    // White base
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#e8e8e8');
    grad.addColorStop(1, '#cccccc');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Classic football pattern — centre pentagon + 5 surrounding pentagons
    ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
    ctx.lineWidth = 0.5;

    // Centre pentagon
    const cr = R * 0.35;
    drawPentagon(0, 0, cr);

    // Lines from centre pentagon vertices to outer hexagon edges
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.35)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const vx = Math.cos(a) * cr;
      const vy = Math.sin(a) * cr;
      const ox = Math.cos(a) * R * 0.92;
      const oy = Math.sin(a) * R * 0.92;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }

    // Outer pentagons (partially visible, clipped by ball edge)
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R - 0.5, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const mid = a + Math.PI / 5;
      const ox = Math.cos(mid) * R * 0.82;
      const oy = Math.sin(mid) * R * 0.82;
      ctx.fillStyle = 'rgba(30, 30, 30, 0.75)';
      drawPentagon(ox, oy, cr * 0.7);
    }
    ctx.restore();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(-R * 0.3, -R * 0.35, R * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.restore();

    // "Kick me" label — shown until first kick, with gentle bob
    if (!ballKicked) {
      ctx.save();
      const bob = Math.sin(Date.now() / 400) * 3;
      const labelX = ballX;
      const labelY = ballY - R - 20 + bob;

      // Arrow pointing down to ball
      ctx.beginPath();
      ctx.moveTo(labelX, ballY - R - 5);
      ctx.lineTo(labelX - 5, ballY - R - 12);
      ctx.lineTo(labelX + 5, ballY - R - 12);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 221, 0, 0.85)';
      ctx.fill();

      // Label background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(labelX - 30, labelY - 11, 60, 20, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 221, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label text
      ctx.fillStyle = 'rgba(255, 221, 0, 0.95)';
      ctx.font = '700 11px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KICK ME', labelX, labelY);

      ctx.restore();
    }
  }

  // Helper: draw a filled pentagon
  function drawPentagon(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    w = rect.width;
    h = rect.height;
  }

  resize();
  initBall();
  window.addEventListener('resize', () => {
    resize();
    // Re-clamp ball to new bounds
    if (ballInitialised) {
      ballX = Math.min(Math.max(ballX, ballRadius + 4), w - ballRadius - 4);
      ballY = Math.min(Math.max(ballY, ballRadius + 4), h - ballRadius - 4);
    }
  });

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    isHovering = true;
  });

  hero.addEventListener('mouseleave', () => {
    isHovering = false;
  });

  function drawPlayer(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Direction based on movement
    const dx = mouseX - playerX;
    const facingRight = dx >= 0;
    if (!facingRight) ctx.scale(-1, 1);

    // Running player silhouette
    const t = Date.now() / 150;
    const legSwing = Math.sin(t) * 0.4;
    const armSwing = Math.sin(t + Math.PI) * 0.3;
    const bounce = Math.abs(Math.sin(t)) * 2;

    ctx.translate(0, -bounce);

    // Body
    ctx.fillStyle = 'rgba(255, 221, 0, 0.9)';
    ctx.strokeStyle = 'rgba(255, 221, 0, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Head
    ctx.beginPath();
    ctx.arc(0, -20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Torso (leaning forward)
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(3, 0);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(1, -12);
    ctx.lineTo(-6 + armSwing * 10, -6 + Math.abs(armSwing) * 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1, -12);
    ctx.lineTo(8 - armSwing * 10, -6 + Math.abs(armSwing) * 4);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(-2 + legSwing * 12, 14 - Math.abs(legSwing) * 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(8 - legSwing * 12, 14 - Math.abs(legSwing) * 3);
    ctx.stroke();

    // GPS device on back (small rectangle)
    ctx.fillStyle = 'rgba(255, 221, 0, 0.6)';
    ctx.fillRect(-3, -14, 4, 6);

    ctx.restore();
  }

  function drawSignal(x, y, radius, alpha) {
    ctx.beginPath();
    ctx.arc(x, y - 20, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 221, 0, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawTrail() {
    if (trail.length < 2) return;

    // Trail line
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.strokeStyle = 'rgba(255, 221, 0, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trail dots
    for (let i = 0; i < trail.length; i += 3) {
      const age = (Date.now() - trail[i].t) / 5000;
      const alpha = Math.max(0, 0.3 - age * 0.3);
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 221, 0, ${alpha})`;
      ctx.fill();
    }
  }

  function drawStats(x, y) {
    const displaySpeed = Math.round(speed * 10) / 10;
    const displayDist = Math.round(totalDist);

    ctx.save();
    ctx.translate(x + 20, y - 40);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 90, 38, 6);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 221, 0, 0.5)';
    ctx.font = '600 9px Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SPEED', 8, 13);
    ctx.fillText('DIST', 8, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '700 10px Roboto, sans-serif';
    ctx.fillText(displaySpeed.toFixed(1) + ' km/h', 42, 13);
    ctx.fillText(displayDist + ' m', 42, 30);

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Always update + draw ball (even when not hovering)
    updateBall();
    drawBall();

    if (!isHovering && trail.length === 0 && Math.abs(ballVX) < 0.1 && Math.abs(ballVY) < 0.1) {
      // Still draw ball even when idle
      animFrame = requestAnimationFrame(animate);
      return;
    }

    // Smooth follow with easing
    const ease = 0.06;
    playerX += (mouseX - playerX) * ease;
    playerY += (mouseY - playerY) * ease;

    // Calculate speed
    const dx = playerX - lastPlayerX;
    const dy = playerY - lastPlayerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    speed = speed * 0.9 + dist * 2 * 0.1; // smoothed, scaled to look like km/h
    totalDist += dist * 0.1; // scaled to look like metres
    lastPlayerX = playerX;
    lastPlayerY = playerY;

    // Add trail points
    const now = Date.now();
    if (isHovering && now - lastTrailTime > 50 && dist > 0.5) {
      trail.push({ x: playerX, y: playerY, t: now });
      lastTrailTime = now;
    }

    // Add signal pulses
    if (isHovering && now % 800 < 20) {
      signals.push({ x: playerX, y: playerY, born: now });
    }

    // Remove old trail points (fade after 5s)
    trail = trail.filter(p => now - p.t < 5000);
    signals = signals.filter(s => now - s.born < 1500);

    // Draw trail
    drawTrail();

    // Draw signals
    signals.forEach(s => {
      const age = (now - s.born) / 1500;
      drawSignal(s.x, s.y, age * 40, Math.max(0, 0.4 - age * 0.4));
    });

    // Draw player
    if (isHovering) {
      drawPlayer(playerX, playerY);
      drawStats(playerX, playerY);
    }

    animFrame = requestAnimationFrame(animate);
  }

  // Only run on desktop (not touch devices)
  if (window.matchMedia('(hover: hover)').matches) {
    animate();
  }
})();
