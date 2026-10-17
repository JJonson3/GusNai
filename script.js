/**
 * ============================================================================
 * UNA CARTA PARA VALENTINA - SCRIPT INTERACTIVO
 * ============================================================================
 * Gestiona:
 * 1. Fondo de cielo estrellado con Canvas (optimizado y sutil)
 * 2. Secuencia cinemática de entrada (pantalla oscura -> destello -> frase -> carta)
 * 3. Navegación SPA fluida con soporte para historial del navegador (hash)
 * 4. Calificación interactiva de 5 estrellas (broma)
 * 5. Registro manual de visitas en localStorage y conteo técnico separado
 * 6. Botón esquivador (máximo 3 esquivas seguras en pantalla)
 * 7. Efecto máquina de escribir para el mensaje de apoyo
 * 8. Ilustraciones dinámicas (Monitor gigante con carita, Pan gigante, etc.)
 * ============================================================================
 */

(function () {
  'use strict';

  // Constantes de localStorage
  const STORAGE_KEY_MANUAL_READS = 'val_manual_read_count';
  const STORAGE_KEY_TECH_VISITS = 'val_tech_visits';

  // Comprobar preferencia de reducción de movimiento
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Estado de la aplicación
  const state = {
    currentScreen: 'screen-carta',
    dodgeCount: 0,
    maxDodges: 3,
    typewriterInProgress: false,
    ratingValue: 0
  };

  // Referencias a elementos del DOM
  const elements = {
    canvas: document.getElementById('ambient-canvas'),
    skipIntroBtn: document.getElementById('skip-intro-btn'),
    screenIntro: document.getElementById('screen-intro'),
    introSparkle: document.querySelector('.intro-sparkle'),
    introQuote: document.getElementById('intro-quote'),
    appContainer: document.getElementById('app-container'),
    screens: document.querySelectorAll('.app-container .screen'),
    emotionCards: document.querySelectorAll('.emotion-card'),
    backButtons: document.querySelectorAll('.btn-return-letter'),
    // Ruta Bien
    starButtons: document.querySelectorAll('.star-btn'),
    toggleTrackerBtn: document.getElementById('toggle-tracker-btn'),
    trackerPanel: document.getElementById('tracker-panel'),
    manualCountInput: document.getElementById('manual-count-input'),
    saveCountBtn: document.getElementById('save-count-btn'),
    trackerFeedback: document.getElementById('tracker-feedback'),
    currentSavedDisplay: document.getElementById('current-saved-display'),
    techVisitsDisplay: document.getElementById('tech-visits-display'),
    // Ruta Mal
    dodgeArea: document.getElementById('dodge-area'),
    dodgeBtn: document.getElementById('dodge-btn'),
    dodgeHint: document.getElementById('dodge-hint'),
    malResolution: document.getElementById('mal-resolution'),
    typewriterText: document.getElementById('typewriter-text')
  };

  /* ==========================================================================
     1. FONDO DE ESTRELLAS Y PARTÍCULAS SUTILES (CANVAS)
     ========================================================================== */
  function initAmbientCanvas() {
    if (!elements.canvas || prefersReducedMotion) return;

    const ctx = elements.canvas.getContext('2d');
    let width = (elements.canvas.width = window.innerWidth);
    let height = (elements.canvas.height = window.innerHeight);

    const stars = [];
    const starCount = Math.floor(Math.min(width, height) / 14); // Densidad moderada

    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(200, 182, 255, ', // Lavanda
      'rgba(255, 214, 224, ', // Rosa pastel
      'rgba(184, 167, 234, '  // Azul noche / lila
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        vy: (Math.random() * 0.15 + 0.05) * -1
      });
    }

    let animationFrameId;

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Titilar
        s.alpha += s.twinkleSpeed * s.twinkleDirection;
        if (s.alpha > 0.95) {
          s.alpha = 0.95;
          s.twinkleDirection = -1;
        } else if (s.alpha < 0.15) {
          s.alpha = 0.15;
          s.twinkleDirection = 1;
        }

        // Flotar suavemente hacia arriba
        s.y += s.vy;
        if (s.y < -5) {
          s.y = height + 5;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.colorBase + s.alpha + ')';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Redimensionar responsivamente
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = elements.canvas.width = window.innerWidth;
        height = elements.canvas.height = window.innerHeight;
      }, 200);
    });
  }

  /* ==========================================================================
     2. ENTRADA CINEMATOGRÁFICA
     ========================================================================== */
  function playCinematicIntro() {
    // Si la usuaria ya tiene un hash específico distinto de intro, saltar directamente
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash && currentHash !== 'intro' && currentHash !== '') {
      finishIntroImmediately();
      navigateToScreen(getScreenIdFromHash(currentHash), false);
      return;
    }

    // Paso 1: Pantalla en negro durante ~1 segundo
    setTimeout(() => {
      // Paso 2: Aparece destello luminoso
      if (elements.introSparkle) {
        elements.introSparkle.classList.add('visible');
      }

      // Paso 3: Aparece frase suavemente (~800ms después)
      setTimeout(() => {
        if (elements.introQuote) {
          elements.introQuote.classList.add('visible');
        }

        // Paso 4: Transición suave a la carta (~2.3s después de mostrar la frase)
        setTimeout(() => {
          transitionFromIntroToLetter();
        }, 2300);
      }, 800);
    }, 1000);

    // Botón para saltar intro voluntariamente
    if (elements.skipIntroBtn) {
      elements.skipIntroBtn.addEventListener('click', () => {
        finishIntroImmediately();
        navigateToScreen('screen-carta');
      });
    }
  }

  function transitionFromIntroToLetter() {
    if (elements.screenIntro && !elements.screenIntro.classList.contains('fade-out')) {
      elements.screenIntro.classList.add('fade-out');

      if (elements.appContainer) {
        elements.appContainer.classList.remove('hidden');
      }

      navigateToScreen('screen-carta', true);

      setTimeout(() => {
        if (elements.screenIntro) {
          elements.screenIntro.style.display = 'none';
        }
      }, 1400);
    }
  }

  function finishIntroImmediately() {
    if (elements.screenIntro) {
      elements.screenIntro.classList.add('fade-out');
      elements.screenIntro.style.display = 'none';
    }
    if (elements.appContainer) {
      elements.appContainer.classList.remove('hidden');
    }
  }

  /* ==========================================================================
     3. SISTEMA DE NAVEGACIÓN ENTRE PANTALLAS (SPA & HISTORIAL)
     ========================================================================== */
  const SCREEN_HASH_MAP = {
    'screen-carta': 'carta',
    'screen-bien': 'bien',
    'screen-mal': 'mal',
    'screen-nose': 'no-se',
    'screen-pan': 'soy-un-pan'
  };

  function getScreenIdFromHash(hash) {
    for (const [screenId, h] of Object.entries(SCREEN_HASH_MAP)) {
      if (h === hash) return screenId;
    }
    return 'screen-carta';
  }

  function navigateToScreen(targetScreenId, updateHash = true) {
    let screenFound = false;

    elements.screens.forEach((screen) => {
      if (screen.id === targetScreenId) {
        screen.classList.add('active');
        screenFound = true;
      } else {
        screen.classList.remove('active');
      }
    });

    if (!screenFound) {
      const cartaScreen = document.getElementById('screen-carta');
      if (cartaScreen) cartaScreen.classList.add('active');
      targetScreenId = 'screen-carta';
    }

    state.currentScreen = targetScreenId;

    if (updateHash && SCREEN_HASH_MAP[targetScreenId]) {
      history.pushState({ screen: targetScreenId }, '', '#' + SCREEN_HASH_MAP[targetScreenId]);
    }

    // Si se navega a la pantalla Mal, reiniciar el botón para que pueda jugarse nuevamente
    if (targetScreenId === 'screen-mal') {
      initDodgeButton();
    }

    // Al volver a la carta, hacer scroll suave al inicio de la hoja
    if (targetScreenId === 'screen-carta') {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else {
      const activeScreenEl = document.getElementById(targetScreenId);
      if (activeScreenEl) {
        activeScreenEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }

  // Soporte para botones adelante/atrás del navegador
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) {
      navigateToScreen(e.state.screen, false);
    } else {
      const hash = window.location.hash.replace('#', '');
      navigateToScreen(getScreenIdFromHash(hash), false);
    }
  });

  // Enlazar clics en las 4 tarjetas de emociones
  elements.emotionCards.forEach((card) => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      if (targetId) {
        navigateToScreen(targetId, true);
      }
    });
  });

  // Enlazar todos los botones de "Volver a leer la carta"
  elements.backButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateToScreen('screen-carta', true);
    });
  });

  /* ==========================================================================
     4. GESTIÓN DE VISITAS TÉCNICAS Y LOCALSTORAGE
     ========================================================================== */
  function trackTechnicalVisit() {
    try {
      let techVisits = parseInt(localStorage.getItem(STORAGE_KEY_TECH_VISITS) || '0', 10);
      techVisits += 1;
      localStorage.setItem(STORAGE_KEY_TECH_VISITS, techVisits.toString());
      if (elements.techVisitsDisplay) {
        elements.techVisitsDisplay.textContent = techVisits.toString();
      }
    } catch (e) {
      console.warn('localStorage no disponible para visitas técnicas:', e);
    }
  }

  function initManualTracker() {
    // Cargar valor guardado previamente
    try {
      const savedCount = localStorage.getItem(STORAGE_KEY_MANUAL_READS);
      if (savedCount !== null && elements.currentSavedDisplay) {
        elements.currentSavedDisplay.textContent = `${savedCount} ${savedCount === '1' ? 'vez' : 'veces'}`;
        if (elements.manualCountInput) {
          elements.manualCountInput.value = savedCount;
        }
      }

      const techVisits = localStorage.getItem(STORAGE_KEY_TECH_VISITS) || '1';
      if (elements.techVisitsDisplay) {
        elements.techVisitsDisplay.textContent = techVisits;
      }
    } catch (e) {
      console.warn('localStorage no accesible:', e);
    }

    // Alternar panel desplegable
    if (elements.toggleTrackerBtn && elements.trackerPanel) {
      elements.toggleTrackerBtn.addEventListener('click', () => {
        elements.trackerPanel.classList.toggle('hidden');
        if (!elements.trackerPanel.classList.contains('hidden') && elements.manualCountInput) {
          elements.manualCountInput.focus();
        }
      });
    }

    // Botón Guardar
    if (elements.saveCountBtn && elements.manualCountInput) {
      elements.saveCountBtn.addEventListener('click', handleSaveManualCount);
    }

    // Permitir guardar con Enter dentro del input
    if (elements.manualCountInput) {
      elements.manualCountInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveManualCount();
        }
      });
    }
  }

  function handleSaveManualCount() {
    const rawVal = elements.manualCountInput.value.trim();
    const num = Number(rawVal);

    if (rawVal === '' || isNaN(num) || num < 0 || !Number.isInteger(num)) {
      showTrackerFeedback('Por favor introduce un número entero válido (0 o mayor).', 'error');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_MANUAL_READS, num.toString());
      if (elements.currentSavedDisplay) {
        elements.currentSavedDisplay.textContent = `${num} ${num === 1 ? 'vez' : 'veces'}`;
      }
      showTrackerFeedback(`✓ Guardado correctamente: ${num} ${num === 1 ? 'vez' : 'veces'}.`, 'success');
    } catch (e) {
      showTrackerFeedback('No se pudo guardar en este navegador.', 'error');
    }
  }

  function showTrackerFeedback(msg, type) {
    if (!elements.trackerFeedback) return;
    elements.trackerFeedback.textContent = msg;
    elements.trackerFeedback.className = `tracker-feedback ${type}`;

    setTimeout(() => {
      if (elements.trackerFeedback && elements.trackerFeedback.textContent === msg) {
        elements.trackerFeedback.textContent = '';
      }
    }, 4500);
  }

  /* ==========================================================================
     5. RUTA «BIEN»: CALIFICACIÓN DE 5 ESTRELLAS (BROMA)
     ========================================================================== */
  function initStarRating() {
    if (!elements.starButtons || elements.starButtons.length === 0) return;

    elements.starButtons.forEach((starBtn) => {
      const val = parseInt(starBtn.getAttribute('data-value'), 10);

      // Efecto hover (resaltar hasta la estrella señalada)
      starBtn.addEventListener('mouseenter', () => highlightStarsHover(val));
      starBtn.addEventListener('mouseleave', () => restoreStarsSelection());

      // Clic para fijar selección
      starBtn.addEventListener('click', () => {
        state.ratingValue = val;
        applyRating(val);
      });

      // Accesibilidad teclado
      starBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = Math.min(5, val + 1);
          focusStar(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = Math.max(1, val - 1);
          focusStar(prev);
        }
      });
    });
  }

  function highlightStarsHover(limit) {
    elements.starButtons.forEach((btn) => {
      const v = parseInt(btn.getAttribute('data-value'), 10);
      if (v <= limit) {
        btn.classList.add('hovered');
      } else {
        btn.classList.remove('hovered');
      }
    });
  }

  function restoreStarsSelection() {
    elements.starButtons.forEach((btn) => {
      btn.classList.remove('hovered');
      const v = parseInt(btn.getAttribute('data-value'), 10);
      if (v <= state.ratingValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function applyRating(val) {
    elements.starButtons.forEach((btn) => {
      const v = parseInt(btn.getAttribute('data-value'), 10);
      const isSelected = v <= val;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-checked', v === val ? 'true' : 'false');
    });
  }

  function focusStar(index) {
    const target = Array.from(elements.starButtons).find(
      (b) => parseInt(b.getAttribute('data-value'), 10) === index
    );
    if (target) {
      target.focus();
      state.ratingValue = index;
      applyRating(index);
    }
  }

  /* ==========================================================================
     6. RUTA «MAL»: BOTÓN QUE ESQUIVA (EXACTAMENTE 3 VECES)
     ========================================================================== */
  let lastDodgeTimestamp = 0;
  let dodgeHandlersAttached = false;

  function initDodgeButton() {
    if (!elements.dodgeBtn || !elements.dodgeArea) return;

    // Reiniciar estado
    state.dodgeCount = 0;
    lastDodgeTimestamp = 0;
    elements.dodgeBtn.style.transform = 'translate(0px, 0px)';
    elements.dodgeBtn.classList.remove('tired');
    elements.dodgeBtn.textContent = 'Sí, todavía me siento mal';
    if (elements.dodgeHint) elements.dodgeHint.textContent = '';
    if (elements.malResolution) elements.malResolution.classList.add('hidden');
    elements.dodgeArea.style.display = 'flex';

    // Remover listeners previos si existían
    elements.dodgeBtn.removeEventListener('pointerenter', onDodgeAttempt);
    elements.dodgeBtn.removeEventListener('touchstart', onDodgeAttempt);

    // Escuchar intentos de tocar / pasar cursor
    elements.dodgeBtn.addEventListener('pointerenter', onDodgeAttempt);
    elements.dodgeBtn.addEventListener('touchstart', onDodgeAttempt, { passive: false });

    // Clic final una sola vez
    if (!dodgeHandlersAttached) {
      elements.dodgeBtn.addEventListener('click', () => {
        if (state.dodgeCount >= state.maxDodges) {
          resolveMalRoute();
        }
      });
      dodgeHandlersAttached = true;
    }
  }

  function onDodgeAttempt(e) {
    if (state.dodgeCount >= state.maxDodges) {
      return;
    }

    // Filtrar si pointerenter fue generado por touch para evitar doble incremento
    if (e.type === 'pointerenter' && e.pointerType === 'touch') {
      return;
    }

    const now = Date.now();
    // Protección anti-rebote (mínimo 300ms entre esquivas)
    if (now - lastDodgeTimestamp < 300) {
      return;
    }
    lastDodgeTimestamp = now;

    if (e.cancelable) {
      e.preventDefault();
    }

    state.dodgeCount += 1;

    // Calcular límites seguros dentro del contenedor y la pantalla
    const areaRect = elements.dodgeArea.getBoundingClientRect();
    const btnRect = elements.dodgeBtn.getBoundingClientRect();

    // Margen seguro para que nunca se desborde ni tape botones de retorno
    const maxDeltaX = Math.min(130, Math.max(35, Math.floor((areaRect.width - btnRect.width) / 2)));
    const maxDeltaY = 50;

    const signX = (state.dodgeCount % 2 === 1) ? 1 : -1;
    const randomX = signX * (Math.floor(Math.random() * (maxDeltaX - 30)) + 30);
    const randomY = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * maxDeltaY) + 15);

    elements.dodgeBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;

    // Actualizar pista para Valentina
    if (elements.dodgeHint) {
      if (state.dodgeCount === 1) {
        elements.dodgeHint.textContent = '¡Ups! Casi... pero todavía no. (1 de 3)';
      } else if (state.dodgeCount === 2) {
        elements.dodgeHint.textContent = '¡Muy rápida! Pero se escapó otra vez. (2 de 3)';
      } else if (state.dodgeCount === 3) {
        elements.dodgeHint.textContent = '¡Listo, ya me cansé! No me muevo más. Ahora sí puedes tocarme.';
      }
    }

    // Al llegar a 3 esquivas exactas, desactivar el movimiento y fijar el botón
    if (state.dodgeCount >= state.maxDodges) {
      elements.dodgeBtn.removeEventListener('pointerenter', onDodgeAttempt);
      elements.dodgeBtn.removeEventListener('touchstart', onDodgeAttempt);

      setTimeout(() => {
        elements.dodgeBtn.style.transform = 'translate(0px, 0px)';
        elements.dodgeBtn.classList.add('tired');
        elements.dodgeBtn.textContent = 'Sí, todavía me siento mal (¡pulsar!)';
      }, 280);
    }
  }

  function resolveMalRoute() {
    if (!elements.malResolution) return;

    elements.dodgeArea.style.display = 'none';
    elements.malResolution.classList.remove('hidden');

    const supportMessage =
      "Si todavía te sigues sintiendo mal, entonces mi carta fue horrible. Me disculpo a mi yo del pasado.\n\n" +
      "Es broma, Val. No tienes que sentirte mejor inmediatamente ni fingir que todo está bien.\n\n" +
      "Quiero que recuerdes que las cosas pueden mejorar, aunque ahora no lo parezca. No tienes que resolverlo todo hoy ni cargar con todo tú sola.\n\n" +
      "Tú puedes, tú puedes. :V";

    playTypewriterEffect(elements.typewriterText, supportMessage);
  }

  /* ==========================================================================
     7. EFECTO MÁQUINA DE ESCRIBIR
     ========================================================================== */
  function playTypewriterEffect(container, text) {
    if (!container) return;

    container.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    if (prefersReducedMotion) {
      container.textContent = text;
      container.appendChild(cursor);
      return;
    }

    let i = 0;
    state.typewriterInProgress = true;
    container.appendChild(cursor);

    function typeChar() {
      if (i < text.length) {
        const char = text.charAt(i);
        const textNode = document.createTextNode(char);
        container.insertBefore(textNode, cursor);
        i++;

        // Velocidad de escritura natural con pequeñas variaciones
        let delay = 25;
        if (char === '.' || char === '\n') delay = 140;
        else if (char === ',') delay = 70;

        setTimeout(typeChar, delay);
      } else {
        state.typewriterInProgress = false;
      }
    }

    typeChar();
  }

  /* ==========================================================================
     8. INICIALIZACIÓN GLOBAL
     ========================================================================== */
  function init() {
    initAmbientCanvas();
    trackTechnicalVisit();
    initManualTracker();
    initStarRating();
    initDodgeButton();
    playCinematicIntro();
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
