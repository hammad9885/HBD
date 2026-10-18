/* ==========================================================================
   STEP-BY-STEP BIRTHDAY EXPERIENCE ENGINE (script.js)
   Matches all 10 Reference Screenshots (Loading + Steps 00 to 07 + Lightbox)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. AMBIENT & CELEBRATION PARTICLES (SOFT DOTS & FLOATING HEARTS)
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let vw = (canvas.width = window.innerWidth);
  let vh = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    vw = canvas.width = window.innerWidth;
    vh = canvas.height = window.innerHeight;
  });

  const COLORS = ['#B80D2F', '#D90429', '#FF4D6D', '#FF758F', '#FF8FA3', '#E05772'];
  const ambientDots = [];
  const burstHearts = [];

  class AmbientParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * vw;
      this.y = initial ? Math.random() * vh : vh + 20;
      this.size = Math.random() * 4.2 + 2.2;
      this.vy = -(Math.random() * 0.42 + 0.15);
      this.vx = (Math.random() - 0.5) * 0.3;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.45 + 0.18;
      this.isHeart = Math.random() > 0.65;
    }

    update() {
      this.y += this.vy;
      this.x += this.vx;
      if (this.y < -20) this.reset(false);
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      if (this.isHeart) {
        drawHeart(ctx, this.x, this.y, this.size * 2.2);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class BurstHeart {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 2.5;
      this.gravity = 0.14;
      this.size = Math.random() * 10 + 7;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      drawHeart(ctx, this.x, this.y, this.size);
      ctx.restore();
    }
  }

  function drawHeart(context, x, y, size) {
    const s = size * 0.08;
    context.save();
    context.translate(x, y);
    context.beginPath();
    context.moveTo(0, 3 * s);
    context.bezierCurveTo(0, 0, -5 * s, 0, -5 * s, 3 * s);
    context.bezierCurveTo(-5 * s, 6 * s, 0, 8.5 * s, 0, 11 * s);
    context.bezierCurveTo(0, 8.5 * s, 5 * s, 6 * s, 5 * s, 3 * s);
    context.bezierCurveTo(5 * s, 0, 0, 0, 0, 3 * s);
    context.closePath();
    context.fill();
    context.restore();
  }

  for (let i = 0; i < 24; i++) {
    ambientDots.push(new AmbientParticle());
  }

  function spawnHeartBurst(x = vw / 2, y = vh / 2, count = 26) {
    for (let i = 0; i < count; i++) {
      burstHearts.push(new BurstHeart(x, y));
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, vw, vh);
    ambientDots.forEach((p) => {
      p.update();
      p.draw();
    });
    for (let i = burstHearts.length - 1; i >= 0; i--) {
      burstHearts[i].update();
      burstHearts[i].draw();
      if (burstHearts[i].alpha <= 0) burstHearts.splice(i, 1);
    }
    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  /* ------------------------------------------------------------------------
     2. WEB AUDIO API — GENTLE MUSIC BOX MELODY & POP SOUND
     ------------------------------------------------------------------------ */
  let audioCtx = null;
  let musicPlaying = false;
  let melodyTimer = null;
  let noteIdx = 0;
  const musicBtn = document.getElementById('musicBtn');

  const MELODY = [
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.55 },
    { f: 261.63, d: 0.55 }, { f: 349.23, d: 0.55 }, { f: 329.63, d: 0.9 },
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 293.66, d: 0.55 },
    { f: 261.63, d: 0.55 }, { f: 392.00, d: 0.55 }, { f: 349.23, d: 0.9 },
    { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.25 }, { f: 523.25, d: 0.55 },
    { f: 440.00, d: 0.55 }, { f: 349.23, d: 0.55 }, { f: 329.63, d: 0.55 },
    { f: 293.66, d: 0.9 },  { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.25 },
    { f: 440.00, d: 0.55 }, { f: 349.23, d: 0.55 }, { f: 392.00, d: 0.55 },
    { f: 349.23, d: 1.1 }
  ];

  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, dur) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur * 1.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur * 1.35);
  }

  function playChime() {
    initAudio();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3), i * 80);
    });
  }

  function playBalloonPopSound() {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  function loopMelody() {
    if (!musicPlaying) return;
    const n = MELODY[noteIdx];
    playTone(n.f, n.d);
    noteIdx = (noteIdx + 1) % MELODY.length;
    melodyTimer = setTimeout(loopMelody, n.d * 1000);
  }

  function setMusic(state) {
    initAudio();
    musicPlaying = typeof state === 'boolean' ? state : !musicPlaying;
    musicBtn.classList.toggle('playing', musicPlaying);
    if (musicPlaying) {
      loopMelody();
    } else if (melodyTimer) {
      clearTimeout(melodyTimer);
    }
  }

  musicBtn.addEventListener('click', () => setMusic());

  /* ------------------------------------------------------------------------
     3. LOADING SCREEN PROGRESS (IMAGE 1 -> STEP 00)
     ------------------------------------------------------------------------ */
  const screenLoading = document.getElementById('screenLoading');
  const stepperNav = document.getElementById('stepperNav');
  const loadingBarFill = document.getElementById('loadingBarFill');
  const loadingPercentText = document.getElementById('loadingPercentText');
  const ringProgressCircle = document.getElementById('ringProgressCircle');
  const CIRCUMFERENCE = 415;

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 5) + 2;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        screenLoading.classList.remove('active');
        stepperNav.classList.remove('hidden');
        goToStep(0);
      }, 450);
    }
    loadingBarFill.style.width = `${progress}%`;
    loadingPercentText.textContent = `${progress}%`;
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
    ringProgressCircle.style.strokeDashoffset = offset;
  }, 65);

  /* ------------------------------------------------------------------------
     4. STEPPER NAVIGATION (00 TO 07)
     ------------------------------------------------------------------------ */
  const stepDots = document.querySelectorAll('.step-dot');
  let currentStep = 0;

  function goToStep(stepNumber) {
    currentStep = Number(stepNumber);

    document.querySelectorAll('.screen').forEach((scr) => {
      scr.classList.remove('active');
    });
    const targetScreen = document.getElementById(`step-${currentStep}`);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    stepDots.forEach((dot) => {
      const s = Number(dot.getAttribute('data-step'));
      dot.classList.remove('active', 'completed');
      if (s < currentStep) {
        dot.classList.add('completed');
      } else if (s === currentStep) {
        dot.classList.add('active');
      }
    });

    if (currentStep === 6 && typeof startConstellationMorph === 'function') {
      startConstellationMorph();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  stepDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.getAttribute('data-step'));
      playChime();
      goToStep(target);
    });
  });

  document.querySelectorAll('.next-step-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const next = Number(btn.getAttribute('data-next'));
      if (!musicPlaying && currentStep === 0) {
        setMusic(true);
      } else {
        playChime();
      }
      spawnHeartBurst(e.clientX || vw / 2, e.clientY || vh / 2, 24);
      goToStep(next);
    });
  });

  /* ------------------------------------------------------------------------
     5. CALENDAR BUILDER FOR STEP 01 (AUGUST 2005, DAY 7 HIGHLIGHTED)
     ------------------------------------------------------------------------ */
  const calendarGrid = document.getElementById('calendarGrid');

  function renderCalendar(highlightDay = 7) {
    calendarGrid.innerHTML = '';
    const leadingBlanks = 1;
    const totalDays = 31;

    for (let b = 0; b < leadingBlanks; b++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day';
      calendarGrid.appendChild(emptyCell);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      dayEl.textContent = d;

      if (d === Number(highlightDay)) {
        dayEl.classList.add('special-day');
        const badge = document.createElement('span');
        badge.className = 'your-day-badge';
        badge.textContent = 'Your Day ❤️';
        dayEl.appendChild(badge);
      }

      calendarGrid.appendChild(dayEl);
    }
  }

  /* ------------------------------------------------------------------------
     6. STEP 03: INTERACTIVE CRIMSON ENVELOPE
     ------------------------------------------------------------------------ */
  const crimsonEnvelope = document.getElementById('crimsonEnvelope');
  const envelopeHintText = document.getElementById('envelopeHintText');

  crimsonEnvelope.addEventListener('click', (e) => {
    const isOpen = crimsonEnvelope.classList.toggle('open');
    playChime();
    if (isOpen) {
      envelopeHintText.textContent = 'Tap envelope again to close 💌';
      spawnHeartBurst(e.clientX || vw / 2, e.clientY || vh / 2, 30);
    } else {
      envelopeHintText.textContent = 'Click the envelope to open 💌';
    }
  });

  /* ------------------------------------------------------------------------
     7. STEP 04: SIX LITTLE WISHES — POP SHINING BALLOONS
     ------------------------------------------------------------------------ */
  const balloonSlots = document.querySelectorAll('.balloon-slot');

  balloonSlots.forEach((slot) => {
    const balloon = slot.querySelector('.shining-balloon');
    balloon.addEventListener('click', (e) => {
      if (slot.classList.contains('popped')) return;
      slot.classList.add('popped');
      playBalloonPopSound();
      const rect = balloon.getBoundingClientRect();
      spawnHeartBurst(
        e.clientX || rect.left + rect.width / 2,
        e.clientY || rect.top + rect.height / 2,
        22
      );
    });
  });

  /* ------------------------------------------------------------------------
     8. STEP 05: OUR MEMORIES 2x2 GRID + FULLSCREEN LIGHTBOX CAROUSEL
     ------------------------------------------------------------------------ */
  const MEMORY_ITEMS = [
    { id: 'memArt0', caption: 'Our first wonderful memory ❤️' },
    { id: 'memArt1', caption: 'Endless smiles together ✨' },
    { id: 'memArt2', caption: 'Every moment is special 🌸' },
    { id: 'memArt3', caption: 'Two hearts, one journey 💖' }
  ];

  const memoryLightbox = document.getElementById('memoryLightbox');
  const lightboxArtSlot = document.getElementById('lightboxArtSlot');
  const lightboxCaptionText = document.getElementById('lightboxCaptionText');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  let activeMemIndex = 0;

  function openMemoryLightbox(index) {
    activeMemIndex = (index + MEMORY_ITEMS.length) % MEMORY_ITEMS.length;
    const item = MEMORY_ITEMS[activeMemIndex];
    const sourceArt = document.getElementById(item.id);
    if (sourceArt) {
      lightboxArtSlot.innerHTML = sourceArt.innerHTML;
    }
    lightboxCaptionText.textContent = item.caption;
    memoryLightbox.classList.remove('hidden');
    playChime();
  }

  document.querySelectorAll('.memory-art-card').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = Number(card.getAttribute('data-mem-index'));
      openMemoryLightbox(idx);
    });
  });

  lightboxPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMemoryLightbox(activeMemIndex - 1);
  });

  lightboxNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMemoryLightbox(activeMemIndex + 1);
  });

  memoryLightbox.addEventListener('click', (e) => {
    if (e.target === memoryLightbox || e.target.classList.contains('lightbox-content')) {
      memoryLightbox.classList.add('hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (memoryLightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') memoryLightbox.classList.add('hidden');
    if (e.key === 'ArrowLeft') openMemoryLightbox(activeMemIndex - 1);
    if (e.key === 'ArrowRight') openMemoryLightbox(activeMemIndex + 1);
  });

  /* ------------------------------------------------------------------------
     9. STEP 06: 3D MORPHING & ROTATING HEART CONSTELLATION
        Phase 1: Swirling 3D galaxy rotates and forms into a clear 3D Heart
        Phase 2: The 3D Heart rotates continuously & responds to touch/drag
     ------------------------------------------------------------------------ */
  const constCanvas = document.getElementById('constellationCanvas');
  const constCtx = constCanvas.getContext('2d');
  const cw = constCanvas.width;
  const ch = constCanvas.height;

  const CONST_COLORS = ['#7A021A', '#A80728', '#D90429', '#FF335C', '#FF6B8B', '#C9184A'];
  const stars3D = [];
  const RIM_COUNT = 320;
  const SHELL_COUNT = 300;
  const HALO_COUNT = 75;
  const TOTAL_STARS = RIM_COUNT + SHELL_COUNT + HALO_COUNT;

  function heartFormula(t) {
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { hx, hy };
  }

  for (let i = 0; i < TOTAL_STARS; i++) {
    let tx, ty, tz;
    let isRim = false;

    if (i < RIM_COUNT) {
      // Crisp 3D Heart Outer Contour Ribbon
      isRim = true;
      const t = (i / RIM_COUNT) * Math.PI * 2;
      const { hx, hy } = heartFormula(t);
      const scale = 7.4;
      tx = hx * scale + (Math.random() - 0.5) * 4;
      ty = (hy - 1.5) * scale + (Math.random() - 0.5) * 4;
      tz = (Math.random() - 0.5) * 16;
    } else if (i < RIM_COUNT + SHELL_COUNT) {
      // 3D Curved Puffy Heart Front & Back Rib Shells
      const t = Math.random() * Math.PI * 2;
      const { hx, hy } = heartFormula(t);
      const ringLevels = [0.84, 0.68, 0.52, 0.35];
      const rFactor = ringLevels[i % ringLevels.length] + (Math.random() - 0.5) * 0.08;
      const scale = 7.4 * rFactor;
      tx = hx * scale;
      ty = (hy - 1.5) * scale;
      const side = i % 2 === 0 ? 1 : -1;
      const domeDepth = Math.sqrt(Math.max(0, 1 - rFactor * rFactor)) * 46;
      tz = side * domeDepth + (Math.random() - 0.5) * 8;
    } else {
      // Soft Orbiting Constellation Stardust Around the Heart
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rad = 128 + Math.random() * 35;
      tx = rad * Math.sin(phi) * Math.cos(theta);
      ty = rad * Math.sin(phi) * Math.sin(theta);
      tz = rad * Math.cos(phi);
    }

    // Scattered 3D Spiral Galaxy Starting Position (Before Morphing into Heart)
    const spiralAngle = i * 0.25 + Math.random() * Math.PI * 2;
    const spiralRadius = 70 + Math.random() * 145;
    const sx = Math.cos(spiralAngle) * spiralRadius;
    const sy = (Math.random() - 0.5) * 260;
    const sz = Math.sin(spiralAngle) * spiralRadius;

    stars3D.push({
      sx,
      sy,
      sz,
      tx,
      ty,
      tz,
      isRim,
      size: isRim ? Math.random() * 1.9 + 1.35 : Math.random() * 1.7 + 0.85,
      color: CONST_COLORS[Math.floor(Math.random() * CONST_COLORS.length)],
      isMiniHeart: Math.random() > 0.968
    });
  }

  let morphProgress = 0;
  let rotY = -Math.PI * 1.1; // Spins during morph, then continues rotating
  let rotX = 0.08;
  let velY = 0.018;
  let velX = 0;
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let pulsePhase = 0;

  function startConstellationMorph() {
    morphProgress = 0;
    rotY = -Math.PI * 1.15;
    rotX = 0.1;
    velY = 0.022;
    velX = 0;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function onPointerDown(clientX, clientY) {
    isDragging = true;
    lastPointerX = clientX;
    lastPointerY = clientY;
  }

  function onPointerMove(clientX, clientY) {
    if (!isDragging) return;
    const dx = clientX - lastPointerX;
    const dy = clientY - lastPointerY;
    lastPointerX = clientX;
    lastPointerY = clientY;
    velY = dx * 0.01;
    velX = Math.max(-0.04, Math.min(0.04, dy * 0.008));
    rotY += velY;
    rotX = Math.max(-0.65, Math.min(0.65, rotX + velX));
  }

  function onPointerUp() {
    isDragging = false;
  }

  constCanvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onPointerUp);

  constCanvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  constCanvas.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', onPointerUp);

  function animateConstellation() {
    constCtx.clearRect(0, 0, cw, ch);

    // Advance Galaxy -> Heart morph progress (~2.5 seconds)
    if (morphProgress < 1) {
      morphProgress = Math.min(1, morphProgress + 0.0075);
    }
    const ease = easeInOutCubic(morphProgress);

    // Heartbeat pulse once formed
    pulsePhase += 0.045;
    const heartBeat = morphProgress >= 0.95 ? 1 + Math.sin(pulsePhase) * 0.032 : 1;

    if (!isDragging) {
      // Smooth continuous rotation during formation AND after heart is formed
      const targetSpin = morphProgress < 1 ? 0.026 : 0.017;
      velY = velY * 0.95 + targetSpin * 0.05;
      velX = velX * 0.92;
      rotY += velY;
      rotX = rotX * 0.96 + 0.04 * 0.04;
    }

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const fov = 340;

    // Subtle glowing heart silhouette outline once formed so the Dil shape is crystal clear
    if (ease > 0.55) {
      constCtx.save();
      constCtx.beginPath();
      for (let i = 0; i < RIM_COUNT; i += 4) {
        const s = stars3D[i];
        const px = s.tx * heartBeat;
        const py = s.ty * heartBeat;
        const pz = 0;

        const x1 = px * cosY - pz * sinY;
        const z1 = pz * cosY + px * sinY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = z1 * cosX + py * sinX;
        const sc = fov / (fov + z2 + 210);
        const sx2D = cw / 2 + x1 * sc;
        const sy2D = ch / 2 + y2 * sc;
        if (i === 0) constCtx.moveTo(sx2D, sy2D);
        else constCtx.lineTo(sx2D, sy2D);
      }
      constCtx.closePath();
      constCtx.strokeStyle = `rgba(217, 4, 41, ${(ease - 0.55) * 0.42})`;
      constCtx.lineWidth = 1.4;
      constCtx.stroke();
      constCtx.restore();
    }

    // Render all 3D particles morphing into and rotating as a 3D Heart
    for (let i = 0; i < TOTAL_STARS; i++) {
      const s = stars3D[i];

      // Interpolate from swirling galaxy (sx, sy, sz) -> 3D Heart (tx, ty, tz)
      const curX = (s.sx + (s.tx - s.sx) * ease) * heartBeat;
      const curY = (s.sy + (s.ty - s.sy) * ease) * heartBeat;
      const curZ = (s.sz + (s.tz - s.sz) * ease) * heartBeat;

      // Rotate around Y (Horizontal spin)
      const x1 = curX * cosY - curZ * sinY;
      const z1 = curZ * cosY + curX * sinY;

      // Rotate around X (Vertical tilt)
      const y2 = curY * cosX - z1 * sinX;
      const z2 = z1 * cosX + curY * sinX;

      const scale = fov / (fov + z2 + 210);
      const projX = cw / 2 + x1 * scale;
      const projY = ch / 2 + y2 * scale;

      if (scale > 0) {
        constCtx.save();
        const alphaBase = s.isRim ? 0.95 : 0.78;
        constCtx.globalAlpha = Math.min(1, Math.max(0.22, scale * alphaBase));
        constCtx.fillStyle = s.color;

        if (s.isMiniHeart) {
          drawHeart(constCtx, projX, projY, s.size * scale * 4.8);
        } else {
          constCtx.beginPath();
          constCtx.arc(projX, projY, s.size * scale, 0, Math.PI * 2);
          constCtx.fill();
        }
        constCtx.restore();
      }
    }

    requestAnimationFrame(animateConstellation);
  }
  animateConstellation();

  /* ------------------------------------------------------------------------
     10. STEP 07: FINALE ACTIONS
     ------------------------------------------------------------------------ */
  document.getElementById('showerHeartsBtn').addEventListener('click', (e) => {
    playChime();
    spawnHeartBurst(e.clientX || vw / 2, e.clientY || vh / 2, 55);
  });

  document.getElementById('replayJourneyBtn').addEventListener('click', () => {
    crimsonEnvelope.classList.remove('open');
    balloonSlots.forEach((s) => s.classList.remove('popped'));
    goToStep(0);
  });

  /* ------------------------------------------------------------------------
     11. CUSTOMIZE NAME & BIRTH DATE MODAL
     ------------------------------------------------------------------------ */
  const editModal = document.getElementById('editModal');
  const customizeFab = document.getElementById('customizeFab');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const editForm = document.getElementById('editForm');
  const resetBtn = document.getElementById('resetBtn');

  const inpName = document.getElementById('inpName');
  const inpDay = document.getElementById('inpDay');
  const inpMonth = document.getElementById('inpMonth');
  const inpYear = document.getElementById('inpYear');
  const inpDateStr = document.getElementById('inpDateStr');
  const inpSign = document.getElementById('inpSign');

  const DEFAULT_DATA = {
    name: 'Ananya',
    day: 7,
    month: 'AUGUST',
    year: '2005',
    dateStr: '07 · 08 · 2005',
    sign: 'With Love ❤️'
  };

  function applySettings() {
    const saved = JSON.parse(localStorage.getItem('bday_exact_settings') || '{}');
    const data = { ...DEFAULT_DATA, ...saved };

    document.getElementById('displayNameTop').textContent = data.name.toUpperCase();
    document.getElementById('displayLetterName').textContent = data.name;
    document.getElementById('displayNameFinale').textContent = data.name;
    document.getElementById('displayCalMonth').textContent = data.month.toUpperCase();
    document.getElementById('displayCalYear').textContent = data.year;
    document.getElementById('displayDateFormatted').textContent = data.dateStr;
    document.getElementById('displaySenderSign').textContent = data.sign;

    renderCalendar(data.day);

    inpName.value = data.name;
    inpDay.value = data.day;
    inpMonth.value = data.month;
    inpYear.value = data.year;
    inpDateStr.value = data.dateStr;
    inpSign.value = data.sign;
  }

  applySettings();

  customizeFab.addEventListener('click', () => editModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.classList.add('hidden');
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newData = {
      name: inpName.value.trim() || DEFAULT_DATA.name,
      day: Number(inpDay.value) || DEFAULT_DATA.day,
      month: inpMonth.value.trim() || DEFAULT_DATA.month,
      year: inpYear.value.trim() || DEFAULT_DATA.year,
      dateStr: inpDateStr.value.trim() || DEFAULT_DATA.dateStr,
      sign: inpSign.value.trim() || DEFAULT_DATA.sign
    };
    localStorage.setItem('bday_exact_settings', JSON.stringify(newData));
    applySettings();
    editModal.classList.add('hidden');
    playChime();
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem('bday_exact_settings');
    applySettings();
    editModal.classList.add('hidden');
  });
});
