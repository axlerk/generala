// ============================================================
// i18n.js — Internationalization module for Generala Score Tracker
// Supports: Russian (ru), Spanish (es), English (en)
// ============================================================

const TRANSLATIONS = {
  // ── Russian ──────────────────────────────────────────────
  ru: {
    // App
    appName: 'Generala Score Tracker',
    version: 'Версия',

    // Home screen
    newGame: 'Новая игра',
    continueGame: 'Продолжить',
    inProgress: 'В процессе',
    history: 'История',
    settings: 'Настройки',

    // Setup screen
    addPlayer: 'Добавить',
    playerName: 'Имя игрока',
    startGame: 'Начать игру',
    back: 'Назад',
    minPlayers: 'Минимум 2 игрока',
    maxPlayers: 'Максимум 10 игроков',
    playerExists: 'Игрок с таким именем уже есть',
    enterName: 'Введите имя',
    dragHint: 'Перетащите для изменения порядка',

    // Game screen
    round: 'Раунд {0} / {1}',
    scoreTable: 'Таблица счёта',
    waiting: 'ожидает',
    entered: 'введено',
    total: 'Итого',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    quitGame: 'Выйти из игры',
    quitConfirm: 'Выйти из текущей игры? Прогресс будет сохранён.',
    yes: 'Да',
    no: 'Нет',

    // Round input
    selectCategory: 'Выберите категорию',
    crossOut: 'Зачеркнуть',
    crossOutConfirm: 'Зачеркнуть «{0}»? Будет записано 0 очков.',
    preview: '{0} → {1} очков',
    firstRoll: '1-й бросок',
    generalaServida: 'Generala с 1-го броска (победа)',
    generalaServidaConfirm: '{0} выбросил(а) Generala с 1-го броска! Это мгновенная победа. Подтвердить?',
    points: 'очков',

    // Game over
    gameOver: 'Игра окончена!',
    winner: 'Победитель: {0}',
    tie: 'Ничья!',
    winByGenerala: 'Победа через Generala servida!',
    rematch: 'Реванш',
    newGameShort: 'Новая игра',
    bestInCategory: 'Лучший результат',

    // History
    historyTitle: 'История игр',
    noHistory: 'Пока нет завершённых игр',
    deleteGame: 'Удалить',
    deleteConfirm: 'Удалить эту игру из истории?',
    players: 'Игроки',

    // History detail
    gameDate: 'Дата',
    gamePlayers: 'Игроки',

    // Settings
    settingsTitle: 'Настройки',
    rulesSection: 'Правила',
    autoWinGenerala: 'Generala с 1-го броска — автопобеда',
    firstRollBonus: 'Бонус за первый бросок',
    firstRollBonusDesc: 'Дополнительные очки за Escalera/Full/Póquer с 1-го броска',
    doubleGenerala: 'Двойная Generala',
    escalerWrapAround: 'Escalera wrap-around',
    escalerWrapAroundDesc: '1-2-3-4-5 и 2-3-4-5-6 считаются Escalera',
    languageSection: 'Язык',
    dataSection: 'Данные',
    clearHistory: 'Очистить историю',
    clearHistoryConfirm: 'Удалить всю историю игр?',
    resetSettings: 'Сбросить настройки',
    resetSettingsConfirm: 'Сбросить все настройки по умолчанию?',
    aboutSection: 'О приложении',
    aboutRules: 'Правила Generala',
    aboutRulesText: `Generala — настольная игра с пятью кубиками, популярная в Латинской Америке. Каждый игрок за ход делает до 3 бросков, пытаясь собрать комбинации. Игра длится 10 раундов. Категории: Единицы–Шестёрки (сумма выпавших), Escalera (лесенка — 20 или 25 с 1-го броска), Full (фулл-хаус — 30 или 35), Póquer (четыре одинаковых — 40 или 45), Generala (пять одинаковых — 50 или 60 с 1-го броска). Generala с первого броска (servida) может быть мгновенной победой. Побеждает игрок с наибольшей суммой очков.`,

    // Categories
    ones: 'Единицы',
    twos: 'Двойки',
    threes: 'Тройки',
    fours: 'Четвёрки',
    fives: 'Пятёрки',
    sixes: 'Шестёрки',
    escalera: 'Escalera (лесенка)',
    full: 'Full (фулл)',
    poker: 'Póquer (покер)',
    generala: 'Generala',
    doubleGeneralaName: 'Doble Generala',
  },

  // ── Spanish ──────────────────────────────────────────────
  es: {
    appName: 'Generala Score Tracker',
    version: 'Versión',

    newGame: 'Nueva partida',
    continueGame: 'Continuar',
    inProgress: 'En curso',
    history: 'Historial',
    settings: 'Ajustes',

    addPlayer: 'Agregar',
    playerName: 'Nombre del jugador',
    startGame: 'Iniciar partida',
    back: 'Atrás',
    minPlayers: 'Mínimo 2 jugadores',
    maxPlayers: 'Máximo 10 jugadores',
    playerExists: 'Ya existe un jugador con ese nombre',
    enterName: 'Ingrese el nombre',
    dragHint: 'Arrastre para cambiar el orden',

    round: 'Ronda {0} / {1}',
    scoreTable: 'Tabla de puntajes',
    waiting: 'esperando',
    entered: 'anotado',
    total: 'Total',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    quitGame: 'Salir de la partida',
    quitConfirm: '¿Salir de la partida actual? El progreso se guardará.',
    yes: 'Sí',
    no: 'No',

    selectCategory: 'Seleccione una categoría',
    crossOut: 'Tachar',
    crossOutConfirm: '¿Tachar «{0}»? Se anotarán 0 puntos.',
    preview: '{0} → {1} puntos',
    firstRoll: '1er tiro',
    generalaServida: 'Generala servida (victoria)',
    generalaServidaConfirm: '¡{0} sacó Generala servida! Esto es una victoria instantánea. ¿Confirmar?',
    points: 'puntos',

    gameOver: '¡Partida terminada!',
    winner: 'Ganador: {0}',
    tie: '¡Empate!',
    winByGenerala: '¡Victoria por Generala servida!',
    rematch: 'Revancha',
    newGameShort: 'Nueva partida',
    bestInCategory: 'Mejor resultado',

    historyTitle: 'Historial de partidas',
    noHistory: 'Aún no hay partidas finalizadas',
    deleteGame: 'Eliminar',
    deleteConfirm: '¿Eliminar esta partida del historial?',
    players: 'Jugadores',

    gameDate: 'Fecha',
    gamePlayers: 'Jugadores',

    settingsTitle: 'Ajustes',
    rulesSection: 'Reglas',
    autoWinGenerala: 'Generala servida — victoria automática',
    firstRollBonus: 'Bonificación por primer tiro',
    firstRollBonusDesc: 'Puntos extra por Escalera/Full/Póquer en el 1er tiro',
    doubleGenerala: 'Doble Generala',
    escalerWrapAround: 'Escalera wrap-around',
    escalerWrapAroundDesc: '1-2-3-4-5 y 2-3-4-5-6 cuentan como Escalera',
    languageSection: 'Idioma',
    dataSection: 'Datos',
    clearHistory: 'Borrar historial',
    clearHistoryConfirm: '¿Eliminar todo el historial de partidas?',
    resetSettings: 'Restablecer ajustes',
    resetSettingsConfirm: '¿Restablecer todos los ajustes a los predeterminados?',
    aboutSection: 'Acerca de',
    aboutRules: 'Reglas de Generala',
    aboutRulesText: `Generala es un juego de dados con cinco dados, popular en Latinoamérica. Cada jugador tiene hasta 3 tiros por turno para formar combinaciones. El juego dura 10 rondas. Categorías: Ases–Seises (suma de los dados), Escalera (secuencia — 20 o 25 en el 1er tiro), Full (full house — 30 o 35), Póquer (cuatro iguales — 40 o 45), Generala (cinco iguales — 50 o 60 en el 1er tiro). La Generala servida (en el primer tiro) puede ser victoria instantánea. Gana el jugador con más puntos.`,

    ones: 'Ases',
    twos: 'Doses',
    threes: 'Treses',
    fours: 'Cuatros',
    fives: 'Cincos',
    sixes: 'Seises',
    escalera: 'Escalera',
    full: 'Full',
    poker: 'Póquer',
    generala: 'Generala',
    doubleGeneralaName: 'Doble Generala',
  },

  // ── English ──────────────────────────────────────────────
  en: {
    appName: 'Generala Score Tracker',
    version: 'Version',

    newGame: 'New Game',
    continueGame: 'Continue',
    inProgress: 'In Progress',
    history: 'History',
    settings: 'Settings',

    addPlayer: 'Add',
    playerName: 'Player name',
    startGame: 'Start Game',
    back: 'Back',
    minPlayers: 'Minimum 2 players',
    maxPlayers: 'Maximum 10 players',
    playerExists: 'Player with this name already exists',
    enterName: 'Enter name',
    dragHint: 'Drag to reorder',

    round: 'Round {0} / {1}',
    scoreTable: 'Score Table',
    waiting: 'waiting',
    entered: 'entered',
    total: 'Total',
    confirm: 'Confirm',
    cancel: 'Cancel',
    quitGame: 'Quit Game',
    quitConfirm: 'Quit the current game? Progress will be saved.',
    yes: 'Yes',
    no: 'No',

    selectCategory: 'Select a category',
    crossOut: 'Cross out',
    crossOutConfirm: 'Cross out "{0}"? 0 points will be recorded.',
    preview: '{0} → {1} points',
    firstRoll: '1st roll',
    generalaServida: 'Generala servida (instant win)',
    generalaServidaConfirm: '{0} rolled Generala on the first throw! This is an instant win. Confirm?',
    points: 'points',

    gameOver: 'Game Over!',
    winner: 'Winner: {0}',
    tie: "It's a tie!",
    winByGenerala: 'Won by Generala servida!',
    rematch: 'Rematch',
    newGameShort: 'New Game',
    bestInCategory: 'Best result',

    historyTitle: 'Game History',
    noHistory: 'No completed games yet',
    deleteGame: 'Delete',
    deleteConfirm: 'Delete this game from history?',
    players: 'Players',

    gameDate: 'Date',
    gamePlayers: 'Players',

    settingsTitle: 'Settings',
    rulesSection: 'Rules',
    autoWinGenerala: 'Generala servida — instant win',
    firstRollBonus: 'First roll bonus',
    firstRollBonusDesc: 'Extra points for Escalera/Full/Poker on the 1st roll',
    doubleGenerala: 'Double Generala',
    escalerWrapAround: 'Escalera wrap-around',
    escalerWrapAroundDesc: '1-2-3-4-5 and 2-3-4-5-6 both count as Escalera',
    languageSection: 'Language',
    dataSection: 'Data',
    clearHistory: 'Clear History',
    clearHistoryConfirm: 'Delete all game history?',
    resetSettings: 'Reset Settings',
    resetSettingsConfirm: 'Reset all settings to defaults?',
    aboutSection: 'About',
    aboutRules: 'Generala Rules',
    aboutRulesText: `Generala is a dice game played with five dice, popular in Latin America. Each player gets up to 3 rolls per turn to form combinations. The game lasts 10 rounds. Categories: Ones–Sixes (sum of matching dice), Escalera (straight — 20 or 25 on 1st roll), Full House (30 or 35), Four of a Kind (40 or 45), Generala (five of a kind — 50 or 60 on 1st roll). Generala servida (on the first throw) can be an instant win. The player with the highest total score wins.`,

    ones: 'Ones',
    twos: 'Twos',
    threes: 'Threes',
    fours: 'Fours',
    fives: 'Fives',
    sixes: 'Sixes',
    escalera: 'Escalera (straight)',
    full: 'Full house',
    poker: 'Four of a kind',
    generala: 'Generala',
    doubleGeneralaName: 'Double Generala',
  },
};

// Current language (will be set from settings)
let currentLanguage = 'ru';

/**
 * Translation function with interpolation support.
 * Usage: t('round', 3, 10) → "Round 3 / 10"
 * Falls back to English if key is missing in current language.
 */
function t(key, ...args) {
  let str =
    (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) ||
    (TRANSLATIONS.en && TRANSLATIONS.en[key]) ||
    key;

  // Replace {0}, {1}, ... with positional arguments
  args.forEach((arg, i) => {
    str = str.replace(new RegExp(`\\{${i}\\}`, 'g'), arg);
  });

  return str;
}

/**
 * Set the current language and persist to settings.
 */
function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
  }
}
