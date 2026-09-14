import { SlotSkin } from './types';

export const VAMPIRE_SKIN: SlotSkin = {
  id: 'vampire-slot',
  name: 'Vampire: Noche Sangrienta',
  title: '🦇 Vampire: Noche Sangrienta',
  subtitle: 'Demo Gótica · Fichas Virtuales',
  category: 'slots',
  themeColor: '#881337',
  accentColor: '#f43f5e',
  gradientBackground: 'linear-gradient(135deg, #111827, #4c0519)',
  cardBorder: '#881337',
  reelsCount: 5,
  rowsCount: 3,
  soundProfile: {
    ambientTrack: 'vampire-ambient',
    spinKey: 'vampire-spin',
    winKey: 'vampire-win',
    jackpotKey: 'vampire-jackpot',
  },
  features: ['Vampire Wilds', 'Blood Moon Scatters', 'Multiplicadores Góticos', 'Saldo Virtual Demo'],
  symbols: [
    {
      id: 'vampire-wild',
      name: 'Vampiro',
      label: 'VAMPIRO WILD',
      emoji: '🧛',
      color: '#f43f5e',
      payouts: { 3: 10, 4: 50, 5: 250 },
      isWild: true,
      isJackpot: true,
    },
    {
      id: 'blood-moon',
      name: 'Luna de Sangre',
      label: 'LUNA SCATTER',
      emoji: '🌕',
      color: '#fb7185',
      payouts: { 3: 5, 4: 25, 5: 100 },
      isScatter: true,
    },
    {
      id: 'gothic-skull',
      name: 'Calavera Gótica',
      label: 'CALAVERA',
      emoji: '💀',
      color: '#e2e8f0',
      payouts: { 3: 8, 4: 30, 5: 120 },
    },
    {
      id: 'bat',
      name: 'Murciélago',
      label: 'MURCIÉLAGO',
      emoji: '🦇',
      color: '#a855f7',
      payouts: { 3: 6, 4: 20, 5: 80 },
    },
    {
      id: 'coffin',
      name: 'Ataúd',
      label: 'ATAÚD',
      emoji: '⚰️',
      color: '#eab308',
      payouts: { 3: 5, 4: 15, 5: 60 },
    },
    {
      id: 'ruby-gem',
      name: 'Gema Rubí',
      label: 'RUBÍ',
      emoji: '💎',
      color: '#ef4444',
      payouts: { 3: 4, 4: 12, 5: 50 },
    },
    {
      id: 'card-a',
      name: 'As',
      label: 'A',
      emoji: '🅰️',
      color: '#f43f5e',
      payouts: { 3: 3, 4: 8, 5: 30 },
    },
    {
      id: 'card-k',
      name: 'Rey',
      label: 'K',
      emoji: '👑',
      color: '#eab308',
      payouts: { 3: 2, 4: 6, 5: 25 },
    },
    {
      id: 'card-q',
      name: 'Reina',
      label: 'Q',
      emoji: '👸',
      color: '#c084fc',
      payouts: { 3: 2, 4: 5, 5: 20 },
    },
    {
      id: 'card-j',
      name: 'Jota',
      label: 'J',
      emoji: '🃏',
      color: '#34d399',
      payouts: { 3: 1, 4: 4, 5: 15 },
    },
  ],
};

const themes = [
  ['Cleopatra: Reino Dorado', '𓂀', 'Egipto'],
  ['Tango & Fuego', '🔥', 'Argentina'], ['Gaucho de Oro', '🐎', 'Pampa'], ['Noche Porteña', '🌃', 'Buenos Aires'], ['Mate Dorado', '🧉', 'Criollo'], ['Dragón Andino', '🐉', 'Andes'], ['Reyes del Olimpo', '⚡', 'Mitología'], ['Piratas del Sur', '🏴‍☠️', 'Aventura'], ['Selva Esmeralda', '🌿', 'Naturaleza'], ['Reina del Hielo', '❄️', 'Hielo'], ['Faraón del Nilo', '𓂀', 'Egipto'], ['Robots Galácticos', '🤖', 'Espacio'], ['Dulce Fortuna', '🍬', 'Dulces'], ['Lobos de la Luna', '🐺', 'Luna'], ['Templo Maya', '🗿', 'Maya'], ['Safari Salvaje', '🦁', 'Safari'], ['Café & Fortuna', '☕', 'Café'], ['Bandidos del Oeste', '🤠', 'Oeste'], ['Sirenas del Mar', '🧜', 'Océano'], ['Bosque Encantado', '🧚', 'Fantasía']
];
const emojis = ['🍀', '💎', '⭐', '🔔', '7️⃣', '🎁'];

const otherGames: SlotSkin[] = themes.map(([title, hero, subtitle], i) => ({
  id: `demo-slot-${i + 1}`,
  name: title,
  title: `${hero} ${title}`,
  subtitle: `Demo ${subtitle}`,
  category: 'slots',
  themeColor: i === 0 ? '#d6a84f' : ['#38bdf8', '#f59e0b', '#a78bfa', '#34d399'][i % 4],
  accentColor: '#facc15',
  gradientBackground: 'linear-gradient(135deg,#111827,#172554)',
  cardBorder: '#334155',
  reelsCount: 5,
  rowsCount: 3,
  soundProfile: { ambientTrack: 'demo', spinKey: 'spin', winKey: 'win', jackpotKey: 'jackpot' },
  features: ['Demo visual', 'Motor SlotEngine', 'Saldo virtual'],
  symbols: [
    ...(i === 0 ? ['𓂀', '𓆣', '𓂋', '𓎛', '𓏏', '𓇳'] : emojis).map((emoji, j) => ({
      id: `s${j}`,
      name: emoji,
      label: emoji,
      emoji,
      color: '#fff',
      payouts: { 3: 2 + i % 4, 4: 8 + i % 10, 5: 25 + i % 25 }
    })),
    { id: 'wild', name: 'Wild', label: 'WILD', emoji: '🃏', color: '#facc15', payouts: { 3: 5, 4: 20, 5: 100 }, isWild: true },
    { id: 'scatter', name: 'Scatter', label: 'SCATTER', emoji: '🌟', color: '#f472b6', payouts: { 3: 10, 4: 30, 5: 100 }, isScatter: true }
  ]
}));

export const games: SlotSkin[] = [VAMPIRE_SKIN, ...otherGames];
