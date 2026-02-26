// ============================================================
// app.js — Generala Score Tracker
// Main application: state machine, rendering, game logic
// ============================================================

const APP_VERSION = '1.0.0';
const TOTAL_ROUNDS = 10;
const STORAGE_SETTINGS = 'generala_settings';
const STORAGE_CURRENT = 'generala_current';
const STORAGE_HISTORY = 'generala_history';

// ── Categories definition ────────────────────────────────────
const CATEGORIES = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'escalera', 'full', 'poker', 'generala'
];

// Visual prefixes for category cards in round-input
const CATEGORY_ICONS = {
  ones:     '\u2680',   // ⚀
  twos:     '\u2681',   // ⚁
  threes:   '\u2682',   // ⚂
  fours:    '\u2683',   // ⚃
  fives:    '\u2684',   // ⚄
  sixes:    '\u2685',   // ⚅
  escalera: '\uD83D\uDCC8', // 📈
  full:     '\uD83C\uDFE0', // 🏠
  poker:    '\uD83C\uDCCF', // 🃏
  generala: '\u2B50',        // ⭐
  doubleGenerala: '\uD83C\uDF1F', // 🌟
};

// Numeric categories are "dice" group, the rest are "combo" group
const DICE_CATEGORIES = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
const COMBO_CATEGORIES = ['escalera', 'full', 'poker', 'generala', 'doubleGenerala'];

// Options for each category: [value, isFirstRollBonus?]
// First-roll bonus values are the last element in arrays where applicable
const CATEGORY_OPTIONS = {
  ones:     [0, 1, 2, 3, 4, 5],
  twos:     [0, 2, 4, 6, 8, 10],
  threes:   [0, 3, 6, 9, 12, 15],
  fours:    [0, 4, 8, 12, 16, 20],
  fives:    [0, 5, 10, 15, 20, 25],
  sixes:    [0, 6, 12, 18, 24, 30],
  escalera: { normal: [0, 20], bonus: 25 },
  full:     { normal: [0, 30], bonus: 35 },
  poker:    { normal: [0, 40], bonus: 45 },
  generala: { normal: [50], firstRoll: 60 },
};

// ── Default settings ─────────────────────────────────────────
const DEFAULT_SETTINGS = {
  language: 'es',
  autoWinOnGenerala: true,
  firstRollBonus: true,
  doubleGenerala: false,
  escalerWrapAround: false,
};

// ── Application state ────────────────────────────────────────
let appState = {
  screen: 'home',
  prevScreen: null,
  settings: { ...DEFAULT_SETTINGS },
  currentGame: null,
  history: [],
  // Setup state
  setupPlayers: [],
  // Round input state
  roundInputPlayer: null,
  selectedCategory: null,
  selectedValue: null,
  expandedCategory: null,
};

// ── Helpers ──────────────────────────────────────────────────

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(30);
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : currentLanguage === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/** Calculate total score for a player */
function playerTotal(scores) {
  let sum = 0;
  for (const key of CATEGORIES) {
    if (scores[key] !== null && scores[key] !== undefined) sum += scores[key];
  }
  if (scores.doubleGenerala !== null && scores.doubleGenerala !== undefined) {
    sum += scores.doubleGenerala;
  }
  return sum;
}

/** Get list of categories for current game settings */
function getActiveCategories(settings) {
  const cats = [...CATEGORIES];
  if (settings.doubleGenerala) cats.push('doubleGenerala');
  return cats;
}

/** Count how many categories a player has filled this round */
function filledCategoriesCount(playerScores) {
  let count = 0;
  for (const key of CATEGORIES) {
    if (playerScores[key] !== null && playerScores[key] !== undefined) count++;
  }
  if (playerScores.doubleGenerala !== null && playerScores.doubleGenerala !== undefined) count++;
  return count;
}

/** Check if round is complete: each player must have filled exactly (currentRound) categories total */
function isRoundComplete(game) {
  const target = game.currentRound;
  for (const p of game.players) {
    if (filledCategoriesCount(game.scores[p]) < target) return false;
  }
  return true;
}

/** Get the round score for a specific player in current round */
function getRoundScore(game, playerName) {
  // The "round score" is the value they entered this round
  // We track it as the difference from what they had before, but simpler:
  // just return the most recently filled category value
  // Actually, we need to know which category was filled this round
  // The design: each round, each player picks one category.
  // So at round N, player should have N categories filled.
  // We check if they have currentRound categories filled (done) or currentRound-1 (waiting)
  return null; // Handled differently in rendering
}

/** Create initial scores object for a player */
function createEmptyScores(settings) {
  const s = {};
  for (const c of CATEGORIES) s[c] = null;
  s.doubleGenerala = null;
  return s;
}

// ── Persistence ──────────────────────────────────────────────

function loadState() {
  appState.settings = { ...DEFAULT_SETTINGS, ...loadJSON(STORAGE_SETTINGS, {}) };
  appState.currentGame = loadJSON(STORAGE_CURRENT, null);
  appState.history = loadJSON(STORAGE_HISTORY, []);
  setLanguage(appState.settings.language);
}

function saveSettings() {
  saveJSON(STORAGE_SETTINGS, appState.settings);
}

function saveCurrentGame() {
  saveJSON(STORAGE_CURRENT, appState.currentGame);
}

function saveHistory() {
  saveJSON(STORAGE_HISTORY, appState.history);
}

// ── Icon generation ──────────────────────────────────────────

function generateIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();

  // Dice face
  const margin = size * 0.2;
  const diceSize = size - margin * 2;
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.roundRect(margin, margin, diceSize, diceSize, diceSize * 0.15);
  ctx.fill();

  // Dots (5 pattern like on a die)
  ctx.fillStyle = '#fff';
  const dotR = diceSize * 0.08;
  const cx = size / 2;
  const cy = size / 2;
  const off = diceSize * 0.25;

  const dots = [
    [cx, cy],
    [cx - off, cy - off],
    [cx + off, cy - off],
    [cx - off, cy + off],
    [cx + off, cy + off],
  ];

  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
}

function setupIcons() {
  // Only generate if not already cached
  const key192 = 'generala_icon_192';
  const key512 = 'generala_icon_512';

  let icon192 = localStorage.getItem(key192);
  let icon512 = localStorage.getItem(key512);

  if (!icon192) {
    icon192 = generateIcon(192);
    try { localStorage.setItem(key192, icon192); } catch(e) { /* quota */ }
  }
  if (!icon512) {
    icon512 = generateIcon(512);
    try { localStorage.setItem(key512, icon512); } catch(e) { /* quota */ }
  }

  // Set apple-touch-icon
  const link = document.querySelector('link[rel="apple-touch-icon"]');
  if (link) link.href = icon192;

  // Update manifest icons dynamically by creating blob URLs
  // Actually, manifest is static JSON. We'll serve the generated PNGs
  // by writing them as data URLs isn't possible in manifest.
  // Instead, we create the icon files via a different approach:
  // We'll use the link tag for apple-touch-icon and that's sufficient.
  // For the manifest, we generate actual PNG files using service worker
  // or we accept that the manifest icons won't resolve to generated images.
  // The simplest approach: create an icon endpoint in the service worker.
}

// ── Navigation ───────────────────────────────────────────────

function navigate(screen) {
  appState.prevScreen = appState.screen;
  appState.screen = screen;
  render();
}

// ── Rendering engine ─────────────────────────────────────────

const $app = () => document.getElementById('app');

function render() {
  const app = $app();
  if (!app) return;

  // Clean up floating confirm bar when leaving round-input
  const existingBar = document.querySelector('.confirm-bar');
  if (existingBar) existingBar.remove();

  const screens = {
    home: renderHome,
    setup: renderSetup,
    game: renderGame,
    'round-input': renderRoundInput,
    'game-over': renderGameOver,
    history: renderHistory,
    'history-detail': renderHistoryDetail,
    settings: renderSettings,
  };

  const renderer = screens[appState.screen] || renderHome;
  app.innerHTML = '';
  const el = renderer();
  app.appendChild(el);
}

// Helper to create elements
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') el.className = v;
    else if (k === 'onclick' || k === 'oninput' || k === 'onkeydown' || k === 'onchange') el[k] = v;
    else if (k === 'innerHTML') el.innerHTML = v;
    else if (k === 'disabled') { el.disabled = !!v; continue; }
    else if (k === 'checked') { el.checked = !!v; continue; }
    else if (k === 'type') el.type = v;
    else if (k === 'placeholder') el.placeholder = v;
    else if (k === 'value') el.value = v;
    else if (k === 'for') el.htmlFor = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('data-')) el.setAttribute(k, v);
    else el.setAttribute(k, v);
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

// ── SCREEN: Home ─────────────────────────────────────────────

function renderHome() {
  const hasCurrentGame = !!appState.currentGame;

  const screen = h('div', { className: 'screen home-screen' },
    // Top-right actions
    h('div', { className: 'header-bar home-header-bar', style: 'position:absolute;top:20px;left:16px;right:16px;' },
      h('div'),
      h('div', { className: 'header-actions' },
        renderLangSwitchCompact(),
        h('button', {
          className: 'icon-btn',
          onclick: () => navigate('settings'),
          innerHTML: '&#9881;',
        })
      )
    ),
    // Logo
    h('div', { className: 'home-logo' }, '\uD83C\uDFB2'),
    h('div', { className: 'home-title' }, 'Generala'),
    // Buttons
    h('div', { className: 'home-buttons' },
      h('button', {
        className: 'btn btn-primary btn-block',
        onclick: () => {
          appState.setupPlayers = [];
          navigate('setup');
        },
      }, t('newGame')),
      hasCurrentGame
        ? h('button', {
            className: 'btn btn-secondary btn-block',
            style: 'position:relative;',
            onclick: () => navigate('game'),
          },
          t('continueGame'),
          h('span', { className: 'badge badge-accent continue-badge' }, t('inProgress'))
        )
        : null,
      h('button', {
        className: 'btn btn-secondary btn-block',
        onclick: () => navigate('history'),
      }, t('history'))
    ),
    // Version
    h('div', { className: 'home-version' }, `${t('version')} ${APP_VERSION}`)
  );
  return screen;
}

function renderLangSwitchCompact() {
  const langs = ['ES', 'EN', 'RU'];
  const div = h('div', { className: 'lang-switch-compact' });
  for (const lang of langs) {
    const code = lang.toLowerCase();
    const btn = h('button', {
      className: code === appState.settings.language ? 'active' : '',
      onclick: () => {
        appState.settings.language = code;
        setLanguage(code);
        saveSettings();
        render();
      },
    }, lang);
    div.appendChild(btn);
  }
  return div;
}

// ── SCREEN: Setup ────────────────────────────────────────────

function renderSetup() {
  const screen = h('div', { className: 'screen' });

  // Header
  screen.appendChild(h('div', { className: 'header-bar' },
    h('h1', {}, t('newGame')),
    h('button', { className: 'btn btn-ghost btn-sm', onclick: () => navigate('home') }, t('back'))
  ));

  // Input row
  const inputRow = h('div', { className: 'setup-input-row' });
  const input = h('input', {
    className: 'input',
    type: 'text',
    placeholder: t('playerName'),
    onkeydown: (e) => { if (e.key === 'Enter') addPlayer(input); },
  });
  inputRow.appendChild(input);
  inputRow.appendChild(h('button', {
    className: 'btn btn-primary',
    onclick: () => addPlayer(input),
  }, t('addPlayer')));
  screen.appendChild(inputRow);

  // Player list
  const list = h('div', { className: 'player-list', 'data-list': 'players' });
  appState.setupPlayers.forEach((name, i) => {
    const item = h('div', {
      className: 'player-item',
      draggable: 'true',
      'data-index': String(i),
    },
      h('span', { className: 'player-drag-handle' }, '\u2630'),
      h('span', { className: 'player-name' }, name),
      h('button', {
        className: 'player-remove',
        onclick: (e) => {
          e.stopPropagation();
          appState.setupPlayers.splice(i, 1);
          vibrate();
          render();
        },
      }, '\u00D7')
    );
    setupDragAndDrop(item, i);
    list.appendChild(item);
  });
  screen.appendChild(list);

  // Hint
  if (appState.setupPlayers.length > 0 && appState.setupPlayers.length < 2) {
    screen.appendChild(h('div', { className: 'setup-hint' }, t('minPlayers')));
  } else if (appState.setupPlayers.length > 0) {
    screen.appendChild(h('div', { className: 'setup-hint' }, t('dragHint')));
  }

  // Footer
  const footer = h('div', { className: 'setup-footer' });
  footer.appendChild(h('button', {
    className: 'btn btn-primary btn-block',
    disabled: appState.setupPlayers.length < 2,
    onclick: startGame,
  }, t('startGame')));
  screen.appendChild(footer);

  // Auto-focus input after render
  requestAnimationFrame(() => input.focus());

  return screen;
}

function addPlayer(input) {
  const name = input.value.trim();
  if (!name) return;
  if (appState.setupPlayers.length >= 10) {
    showToast(t('maxPlayers'));
    return;
  }
  if (appState.setupPlayers.includes(name)) {
    showToast(t('playerExists'));
    return;
  }
  appState.setupPlayers.push(name);
  vibrate();
  render();
}

// Drag & Drop for player reordering
let dragSrcIndex = null;

function setupDragAndDrop(el, index) {
  // Touch events for mobile
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isDragging = false;

  el.addEventListener('dragstart', (e) => {
    dragSrcIndex = index;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.player-item').forEach(item => item.classList.remove('drag-over'));
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });

  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const from = dragSrcIndex;
    const to = index;
    if (from !== null && from !== to) {
      const [moved] = appState.setupPlayers.splice(from, 1);
      appState.setupPlayers.splice(to, 0, moved);
      vibrate();
      render();
    }
  });

  // Touch-based drag & drop
  el.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    touchCurrentY = e.touches[0].clientY;
    const diff = Math.abs(touchCurrentY - touchStartY);
    if (diff > 10) {
      isDragging = true;
      el.classList.add('dragging');
    }
  }, { passive: true });

  el.addEventListener('touchend', () => {
    if (isDragging) {
      el.classList.remove('dragging');
      // Find target element under touch point
      const items = document.querySelectorAll('.player-item');
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (touchCurrentY >= rect.top && touchCurrentY <= rect.bottom && i !== index) {
          const [moved] = appState.setupPlayers.splice(index, 1);
          appState.setupPlayers.splice(i, 0, moved);
          vibrate();
          render();
          break;
        }
      }
    }
  });
}

// ── Game logic ───────────────────────────────────────────────

function startGame() {
  const players = [...appState.setupPlayers];
  const scores = {};
  for (const p of players) {
    scores[p] = createEmptyScores(appState.settings);
  }

  appState.currentGame = {
    id: uuid(),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    settings: { ...appState.settings },
    players,
    scores,
    currentRound: 1,
    currentPlayerIndex: 0,
    winner: null,
    winByGenerala: false,
  };

  saveCurrentGame();
  vibrate();
  navigate('game');
}

// ── SCREEN: Game ─────────────────────────────────────────────

function renderGame() {
  const game = appState.currentGame;
  if (!game) { navigate('home'); return h('div'); }

  const screen = h('div', { className: 'screen' });

  // Header
  const header = h('div', { className: 'game-header' });
  header.appendChild(h('span', { className: 'round-info' }, t('round', game.currentRound, TOTAL_ROUNDS)));
  header.appendChild(h('button', {
    className: 'btn btn-ghost btn-sm',
    onclick: () => showConfirmDialog(t('quitGame'), t('quitConfirm'), () => {
      saveCurrentGame();
      navigate('home');
    }),
  }, t('quitGame')));
  screen.appendChild(header);

  // Progress bar
  const progress = h('div', { className: 'progress-bar' },
    h('div', {
      className: 'progress-bar-fill',
      style: `width: ${((game.currentRound - 1) / TOTAL_ROUNDS) * 100}%`,
    })
  );
  screen.appendChild(progress);

  // Collapsible score table
  screen.appendChild(renderScoreToggle(game));

  // Player list for current round
  const playerList = h('div', { className: 'game-player-list' });
  game.players.forEach((name, i) => {
    const filled = filledCategoriesCount(game.scores[name]);
    const targetForRound = game.currentRound;
    const isDone = filled >= targetForRound;
    const isActive = i === game.currentPlayerIndex && !isDone;
    const isWaiting = !isDone && !isActive;

    const item = h('div', {
      className: `game-player-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`,
      onclick: isActive ? () => openRoundInput(name) : null,
    },
      h('div', { className: 'player-info' },
        h('span', { className: 'name' }, name),
        h('span', {
          className: `player-status ${isDone ? 'done' : ''}`,
        }, isDone ? `\u2713 ${t('entered')}` : isActive ? `\u25B6 ${t('selectCategory')}` : t('waiting'))
      ),
      h('span', { className: 'player-round-score' },
        isDone ? String(playerTotal(game.scores[name])) : ''
      )
    );
    playerList.appendChild(item);
  });
  screen.appendChild(playerList);

  return screen;
}

function renderScoreToggle(game) {
  const wrapper = h('div');

  const toggleBtn = h('button', { className: 'score-toggle' },
    h('span', {}, t('scoreTable')),
    h('span', { className: 'score-toggle-arrow' }, '\u25BC')
  );

  const tableDiv = h('div', { className: 'score-mini-table' });
  const table = h('table');
  const thead = h('tr',{}, h('th', {}, ''));
  game.players.forEach(p => thead.appendChild(h('th', {}, p)));
  table.appendChild(thead);

  // Total row
  const totalRow = h('tr', {},
    h('td', { style: 'font-weight:600;color:var(--accent-gold);' }, t('total'))
  );
  game.players.forEach(p => {
    totalRow.appendChild(h('td', {}, String(playerTotal(game.scores[p]))));
  });
  table.appendChild(totalRow);

  tableDiv.appendChild(table);

  toggleBtn.addEventListener('click', () => {
    const arrow = toggleBtn.querySelector('.score-toggle-arrow');
    tableDiv.classList.toggle('open');
    arrow.classList.toggle('open');
  });

  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(tableDiv);
  return wrapper;
}

function openRoundInput(playerName) {
  appState.roundInputPlayer = playerName;
  appState.selectedCategory = null;
  appState.selectedValue = null;
  appState.expandedCategory = null;
  navigate('round-input');
}

// Advance to next player or next round
function advanceGame() {
  const game = appState.currentGame;

  // Find next player who hasn't filled this round
  let nextIndex = -1;
  for (let i = 0; i < game.players.length; i++) {
    const idx = (game.currentPlayerIndex + 1 + i) % game.players.length;
    const filled = filledCategoriesCount(game.scores[game.players[idx]]);
    if (filled < game.currentRound) {
      nextIndex = idx;
      break;
    }
  }

  if (nextIndex !== -1) {
    game.currentPlayerIndex = nextIndex;
  } else {
    // All players done this round
    if (game.currentRound >= TOTAL_ROUNDS) {
      // Game over
      finishGame();
      return;
    }
    game.currentRound++;
    game.currentPlayerIndex = 0;
  }

  saveCurrentGame();
  navigate('game');
}

function finishGame(winByGenerala = false, winnerName = null) {
  const game = appState.currentGame;

  if (winByGenerala && winnerName) {
    game.winner = winnerName;
    game.winByGenerala = true;
  } else {
    // Determine winner by score
    let maxScore = -1;
    let winners = [];
    for (const p of game.players) {
      const total = playerTotal(game.scores[p]);
      if (total > maxScore) {
        maxScore = total;
        winners = [p];
      } else if (total === maxScore) {
        winners.push(p);
      }
    }
    game.winner = winners.length === 1 ? winners[0] : null;
    game.winByGenerala = false;
  }

  game.finishedAt = new Date().toISOString();

  // Save to history
  appState.history.unshift({ ...game });
  saveHistory();

  // Clear current game
  appState.currentGame = null;
  localStorage.removeItem(STORAGE_CURRENT);

  // Navigate with the game data stored temporarily
  appState._finishedGame = game;
  navigate('game-over');
}

// ── SCREEN: Round Input ──────────────────────────────────────

function renderRoundInput() {
  const game = appState.currentGame;
  const playerName = appState.roundInputPlayer;
  if (!game || !playerName) { navigate('game'); return h('div'); }

  const playerScores = game.scores[playerName];
  const hasSelection = appState.selectedCategory !== null && appState.selectedValue !== null;
  const screen = h('div', { className: `screen ${hasSelection ? 'has-confirm-bar' : ''}` });

  // Header
  screen.appendChild(h('div', { className: 'round-input-header' },
    h('h2', {}, playerName),
    h('div', { className: 'subtitle' }, t('round', game.currentRound, TOTAL_ROUNDS)),
  ));

  // Back button
  screen.appendChild(h('button', {
    className: 'btn btn-ghost btn-sm mb-16',
    onclick: () => navigate('game'),
  }, `\u2190 ${t('back')}`));

  // Generala servida button (always visible if generala not filled and autoWin enabled)
  if (game.settings.autoWinOnGenerala && playerScores.generala === null) {
    screen.appendChild(h('button', {
      className: 'btn btn-gold btn-block generala-servida-btn',
      onclick: () => {
        showConfirmDialog(
          t('generalaServida'),
          t('generalaServidaConfirm', playerName),
          () => {
            playerScores.generala = 60;
            finishGame(true, playerName);
          }
        );
      },
    }, `\uD83C\uDFB2 ${t('generalaServida')}`));
  }

  // Category cards
  const categoryList = h('div', { className: 'category-list' });

  const allCats = getActiveCategories(game.settings);
  let prevWasDice = false;

  for (const cat of allCats) {
    // Skip doubleGenerala if generala not already recorded
    if (cat === 'doubleGenerala') {
      if (playerScores.generala === null) continue;
    }

    // Insert separator between dice (1-6) and combo categories
    const isDice = DICE_CATEGORIES.includes(cat);
    if (prevWasDice && !isDice) {
      categoryList.appendChild(h('div', { className: 'category-separator' }));
    }
    prevWasDice = isDice;

    const isUsed = playerScores[cat] !== null && playerScores[cat] !== undefined;
    const isExpanded = appState.expandedCategory === cat;
    const isSelected = appState.selectedCategory === cat;

    const cardClass = isDice ? 'category-card dice-card' : 'category-card combo-card';
    const card = h('div', {
      className: `${cardClass} ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`,
    });

    // Card header — build display name with icon prefix
    const icon = CATEGORY_ICONS[cat] || '';
    const catName = cat === 'doubleGenerala' ? t('doubleGeneralaName') : t(cat);
    const headerContent = [];
    headerContent.push(h('span', { className: 'cat-icon' }, icon));
    headerContent.push(h('span', { className: 'name' }, catName));
    if (isUsed) {
      if (playerScores[cat] === 0) {
        headerContent.push(h('span', { className: 'cross-out-label' }, '0'));
      } else {
        headerContent.push(h('span', { className: 'used-value' }, String(playerScores[cat])));
      }
    }

    const cardHeader = h('div', {
      className: 'category-card-header',
      onclick: isUsed ? null : () => {
        if (appState.expandedCategory === cat) {
          appState.expandedCategory = null;
        } else {
          appState.expandedCategory = cat;
        }
        render();
      },
    }, ...headerContent);
    card.appendChild(cardHeader);

    // Options
    if (!isUsed) {
      const optionsDiv = h('div', { className: 'category-options' });
      const options = getCategoryOptions(cat, game.settings);

      for (const opt of options) {
        const btn = h('button', {
          className: `opt-btn ${opt.isFirstRoll ? 'first-roll' : ''} ${appState.selectedCategory === cat && appState.selectedValue === opt.value ? 'selected' : ''}`,
          onclick: () => {
            appState.selectedCategory = cat;
            appState.selectedValue = opt.value;
            vibrate();
            render();
          },
        }, String(opt.value));
        optionsDiv.appendChild(btn);
      }

      // Cross out button
      optionsDiv.appendChild(h('button', {
        className: 'cross-out-btn',
        onclick: () => {
          showConfirmDialog(
            t('crossOut'),
            t('crossOutConfirm', catName),
            () => {
              playerScores[cat] = 0;
              appState.selectedCategory = null;
              appState.selectedValue = null;
              appState.expandedCategory = null;
              saveCurrentGame();
              vibrate();
              advanceGame();
            }
          );
        },
      }, `\u2716 ${t('crossOut')}`));

      card.appendChild(optionsDiv);
    }

    categoryList.appendChild(card);
  }
  screen.appendChild(categoryList);

  // Confirm bar — rendered outside screen into body to avoid transform containing block
  // Clean up any existing confirm bar first
  const existingBar = document.querySelector('.confirm-bar');
  if (existingBar) existingBar.remove();

  if (hasSelection) {
    const selIcon = CATEGORY_ICONS[appState.selectedCategory] || '';
    const catName = appState.selectedCategory === 'doubleGenerala'
      ? t('doubleGeneralaName')
      : t(appState.selectedCategory);
    const confirmBar = h('div', { className: 'confirm-bar' },
      h('div', { className: 'confirm-preview' },
        `${selIcon} ${t('preview', catName, appState.selectedValue)}`
      ),
      h('div', { className: 'confirm-actions' },
        h('button', {
          className: 'btn btn-ghost',
          onclick: () => {
            appState.selectedCategory = null;
            appState.selectedValue = null;
            render();
          },
        }, t('cancel')),
        h('button', {
          className: 'btn btn-primary',
          onclick: () => confirmRoundInput(),
        }, t('confirm'))
      )
    );
    // Append to body, not inside the animated .screen
    requestAnimationFrame(() => document.body.appendChild(confirmBar));
  }

  return screen;
}

function getCategoryOptions(cat, settings) {
  const opts = [];

  if (['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(cat)) {
    for (const v of CATEGORY_OPTIONS[cat]) {
      opts.push({ value: v, isFirstRoll: false });
    }
  } else if (cat === 'escalera' || cat === 'full' || cat === 'poker') {
    const def = CATEGORY_OPTIONS[cat];
    for (const v of def.normal) {
      opts.push({ value: v, isFirstRoll: false });
    }
    if (settings.firstRollBonus) {
      opts.push({ value: def.bonus, isFirstRoll: true });
    }
  } else if (cat === 'generala') {
    opts.push({ value: 50, isFirstRoll: false });
    // 60 is for first roll but NOT auto-win (just extra points)
    opts.push({ value: 60, isFirstRoll: true });
  } else if (cat === 'doubleGenerala') {
    opts.push({ value: 100, isFirstRoll: false });
    opts.push({ value: 120, isFirstRoll: true });
  }

  return opts;
}

function confirmRoundInput() {
  const game = appState.currentGame;
  const playerName = appState.roundInputPlayer;
  const cat = appState.selectedCategory;
  const val = appState.selectedValue;

  game.scores[playerName][cat] = val;
  appState.selectedCategory = null;
  appState.selectedValue = null;
  appState.expandedCategory = null;

  saveCurrentGame();
  vibrate();
  advanceGame();
}

// ── SCREEN: Game Over ────────────────────────────────────────

function renderGameOver() {
  const game = appState._finishedGame || appState.history[0];
  if (!game) { navigate('home'); return h('div'); }

  const screen = h('div', { className: 'screen' });

  // Header
  const header = h('div', { className: 'game-over-header' });
  header.appendChild(h('h1', {}, t('gameOver')));

  if (game.winByGenerala) {
    header.appendChild(h('div', { className: 'winner-name' }, `\uD83D\uDC51 ${game.winner}`));
    header.appendChild(h('div', { className: 'badge badge-gold win-badge' }, t('winByGenerala')));
  } else if (game.winner) {
    header.appendChild(h('div', { className: 'winner-name' }, `\uD83D\uDC51 ${t('winner', game.winner)}`));
  } else {
    header.appendChild(h('div', { className: 'winner-name' }, t('tie')));
  }
  screen.appendChild(header);

  // Final table
  screen.appendChild(renderFinalTable(game));

  // Buttons
  const buttons = h('div', { className: 'game-over-buttons' });
  buttons.appendChild(h('button', {
    className: 'btn btn-primary btn-block',
    onclick: () => {
      appState.setupPlayers = [...game.players];
      navigate('setup');
    },
  }, t('rematch')));
  buttons.appendChild(h('button', {
    className: 'btn btn-secondary btn-block',
    onclick: () => {
      appState.setupPlayers = [];
      navigate('setup');
    },
  }, t('newGameShort')));
  buttons.appendChild(h('button', {
    className: 'btn btn-ghost btn-block',
    onclick: () => navigate('history'),
  }, t('history')));
  screen.appendChild(buttons);

  return screen;
}

function renderFinalTable(game) {
  const wrapper = h('div', { className: 'final-table-wrapper' });
  const table = h('table', { className: 'final-table' });

  // Header row
  const thead = h('tr');
  thead.appendChild(h('th', {}, ''));
  game.players.forEach(p => {
    const isWinner = p === game.winner;
    thead.appendChild(h('th', {},
      isWinner ? `\uD83D\uDC51 ${p}` : p
    ));
  });
  table.appendChild(thead);

  // Determine active categories
  const cats = getActiveCategories(game.settings || appState.settings);

  // Find best in each category
  const bestInCat = {};
  for (const cat of cats) {
    let max = -1;
    for (const p of game.players) {
      const v = game.scores[p][cat];
      if (v !== null && v !== undefined && v > max) max = v;
    }
    bestInCat[cat] = max;
  }

  // Category rows
  for (const cat of cats) {
    const row = h('tr');
    const catName = cat === 'doubleGenerala' ? t('doubleGeneralaName') : t(cat);
    row.appendChild(h('td', {}, catName));

    game.players.forEach(p => {
      const v = game.scores[p][cat];
      let cls = '';
      if (v === 0) cls = 'crossed';
      else if (v !== null && v !== undefined && v === bestInCat[cat] && v > 0) cls = 'best';

      row.appendChild(h('td', { className: cls },
        v !== null && v !== undefined ? String(v) : '-'
      ));
    });

    table.appendChild(row);
  }

  // Total row
  const totalRow = h('tr', { className: 'total-row' });
  totalRow.appendChild(h('td', {}, t('total')));
  game.players.forEach(p => {
    const total = playerTotal(game.scores[p]);
    const isWinner = p === game.winner;
    totalRow.appendChild(h('td', { className: isWinner ? 'winner-cell' : '' }, String(total)));
  });
  table.appendChild(totalRow);

  wrapper.appendChild(table);
  return wrapper;
}

// ── SCREEN: History ──────────────────────────────────────────

function renderHistory() {
  const screen = h('div', { className: 'screen' });

  screen.appendChild(h('div', { className: 'header-bar' },
    h('h1', {}, t('historyTitle')),
    h('button', { className: 'btn btn-ghost btn-sm', onclick: () => navigate('home') }, t('back'))
  ));

  if (appState.history.length === 0) {
    screen.appendChild(h('div', { className: 'history-empty' }, t('noHistory')));
    return screen;
  }

  const list = h('div', { className: 'history-list' });
  appState.history.forEach((game, idx) => {
    const card = h('div', { className: 'card card-interactive history-card' });

    const content = h('div', {
      className: 'history-card-content',
      onclick: () => {
        appState._viewGame = game;
        navigate('history-detail');
      },
    });

    content.appendChild(h('div', { className: 'history-date' }, formatDate(game.startedAt)));
    content.appendChild(h('div', { className: 'history-players' },
      game.players.join(', ')
    ));

    if (game.winner) {
      content.appendChild(h('div', { className: 'history-winner' },
        h('span', {}, '\uD83D\uDC51'),
        h('span', {}, game.winner),
        h('span', { className: 'history-score' },
          `${playerTotal(game.scores[game.winner])} ${t('points')}`
        ),
        game.winByGenerala ? h('span', { className: 'badge badge-gold', style: 'margin-left:8px;' }, 'Servida') : null
      ));
    } else {
      content.appendChild(h('div', { className: 'history-winner' }, t('tie')));
    }

    card.appendChild(content);

    // Delete button
    card.appendChild(h('button', {
      className: 'icon-btn history-delete',
      onclick: (e) => {
        e.stopPropagation();
        showConfirmDialog(t('deleteGame'), t('deleteConfirm'), () => {
          appState.history.splice(idx, 1);
          saveHistory();
          vibrate();
          render();
        });
      },
      innerHTML: '&#128465;',
    }));

    list.appendChild(card);
  });
  screen.appendChild(list);

  return screen;
}

// ── SCREEN: History Detail ───────────────────────────────────

function renderHistoryDetail() {
  const game = appState._viewGame;
  if (!game) { navigate('history'); return h('div'); }

  const screen = h('div', { className: 'screen' });

  screen.appendChild(h('div', { className: 'header-bar' },
    h('h1', {}, t('historyTitle')),
    h('button', { className: 'btn btn-ghost btn-sm', onclick: () => navigate('history') }, t('back'))
  ));

  // Game info
  const info = h('div', { className: 'card mb-16' });
  info.appendChild(h('div', { style: 'margin-bottom:8px;' },
    h('span', { className: 'text-muted' }, `${t('gameDate')}: `),
    h('span', {}, formatDate(game.startedAt))
  ));
  info.appendChild(h('div', { style: 'margin-bottom:8px;' },
    h('span', { className: 'text-muted' }, `${t('gamePlayers')}: `),
    h('span', {}, game.players.join(', '))
  ));
  if (game.winner) {
    info.appendChild(h('div', {},
      h('span', { className: 'history-winner' },
        h('span', {}, '\uD83D\uDC51'),
        h('span', {}, game.winner),
        game.winByGenerala ? h('span', { className: 'badge badge-gold', style: 'margin-left:8px;' }, t('winByGenerala')) : null
      )
    ));
  } else {
    info.appendChild(h('div', { className: 'history-winner' }, t('tie')));
  }
  screen.appendChild(info);

  // Final table
  screen.appendChild(renderFinalTable(game));

  // Buttons
  const buttons = h('div', { className: 'game-over-buttons mt-16' });
  buttons.appendChild(h('button', {
    className: 'btn btn-primary btn-block',
    onclick: () => {
      appState.setupPlayers = [...game.players];
      navigate('setup');
    },
  }, t('rematch')));
  buttons.appendChild(h('button', {
    className: 'btn btn-ghost btn-block',
    onclick: () => navigate('history'),
  }, t('back')));
  screen.appendChild(buttons);

  return screen;
}

// ── SCREEN: Settings ─────────────────────────────────────────

function renderSettings() {
  const screen = h('div', { className: 'screen' });

  screen.appendChild(h('div', { className: 'header-bar' },
    h('h1', {}, t('settingsTitle')),
    h('button', { className: 'btn btn-ghost btn-sm', onclick: () => navigate('home') }, t('back'))
  ));

  // Rules section
  const rulesSection = h('div', { className: 'settings-section' });
  rulesSection.appendChild(h('h3', {}, t('rulesSection')));

  rulesSection.appendChild(renderToggle('autoWinOnGenerala', t('autoWinGenerala')));
  rulesSection.appendChild(renderToggle('firstRollBonus', t('firstRollBonus'), t('firstRollBonusDesc')));
  rulesSection.appendChild(renderToggle('doubleGenerala', t('doubleGenerala')));
  rulesSection.appendChild(renderToggle('escalerWrapAround', t('escalerWrapAround'), t('escalerWrapAroundDesc')));
  screen.appendChild(rulesSection);

  // Language section
  const langSection = h('div', { className: 'settings-section' });
  langSection.appendChild(h('h3', {}, t('languageSection')));
  const segmented = h('div', { className: 'segmented' });
  for (const [code, label] of [['es', 'ES'], ['en', 'EN'], ['ru', 'RU']]) {
    segmented.appendChild(h('button', {
      className: code === appState.settings.language ? 'active' : '',
      onclick: () => {
        appState.settings.language = code;
        setLanguage(code);
        saveSettings();
        vibrate();
        render();
      },
    }, label));
  }
  langSection.appendChild(segmented);
  screen.appendChild(langSection);

  // Data section
  const dataSection = h('div', { className: 'settings-section' });
  dataSection.appendChild(h('h3', {}, t('dataSection')));
  const dataActions = h('div', { className: 'settings-actions' });
  dataActions.appendChild(h('button', {
    className: 'btn btn-secondary btn-block',
    onclick: () => {
      showConfirmDialog(t('clearHistory'), t('clearHistoryConfirm'), () => {
        appState.history = [];
        saveHistory();
        vibrate();
        render();
      });
    },
  }, t('clearHistory')));
  dataActions.appendChild(h('button', {
    className: 'btn btn-secondary btn-block',
    onclick: () => {
      showConfirmDialog(t('resetSettings'), t('resetSettingsConfirm'), () => {
        appState.settings = { ...DEFAULT_SETTINGS };
        setLanguage(appState.settings.language);
        saveSettings();
        vibrate();
        render();
      });
    },
  }, t('resetSettings')));
  dataSection.appendChild(dataActions);
  screen.appendChild(dataSection);

  // About section
  const aboutSection = h('div', { className: 'settings-section' });
  aboutSection.appendChild(h('h3', {}, t('aboutSection')));
  aboutSection.appendChild(h('div', { className: 'setting-item', style: 'border-bottom:none;' },
    h('span', {}, `${t('version')} ${APP_VERSION}`)
  ));
  aboutSection.appendChild(h('h3', { style: 'margin-top:12px;' }, t('aboutRules')));
  aboutSection.appendChild(h('div', { className: 'about-rules-text' }, t('aboutRulesText')));
  screen.appendChild(aboutSection);

  return screen;
}

function renderToggle(key, title, desc) {
  const item = h('div', { className: 'setting-item' });
  const label = h('div', { className: 'setting-label' });
  label.appendChild(h('div', { className: 'title' }, title));
  if (desc) label.appendChild(h('div', { className: 'desc' }, desc));
  item.appendChild(label);

  const toggle = h('label', { className: 'toggle' });
  const input = h('input', {
    type: 'checkbox',
    checked: appState.settings[key],
    onchange: () => {
      appState.settings[key] = input.checked;
      saveSettings();
      vibrate();
    },
  });
  toggle.appendChild(input);
  toggle.appendChild(h('span', { className: 'toggle-slider' }));
  item.appendChild(toggle);

  return item;
}

// ── Modal / Dialog ───────────────────────────────────────────

function showConfirmDialog(title, message, onConfirm) {
  const overlay = h('div', { className: 'modal-overlay' });
  const modal = h('div', { className: 'modal' },
    h('h3', {}, title),
    h('p', {}, message),
    h('div', { className: 'modal-actions' },
      h('button', {
        className: 'btn btn-ghost',
        onclick: () => overlay.remove(),
      }, t('cancel')),
      h('button', {
        className: 'btn btn-primary',
        onclick: () => {
          overlay.remove();
          vibrate();
          onConfirm();
        },
      }, t('confirm'))
    )
  );
  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

function showToast(message) {
  // Simple inline toast — just re-render with a hint shown
  // For simplicity, use a temporary DOM element
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = h('div', {
    className: 'toast-msg',
    style: `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: var(--bg-card); color: var(--text-primary);
      padding: 10px 20px; border-radius: 8px; font-size: 0.9rem;
      z-index: 2000; animation: fadeIn 0.2s ease;
      border: 1px solid var(--border); box-shadow: var(--shadow);
    `,
  }, message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ── Service Worker registration ──────────────────────────────

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('Service Worker registered:', reg.scope);
    }).catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
}

// ── Init ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupIcons();
  registerServiceWorker();
  render();
});
