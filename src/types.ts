export type UserRole = 'jugador' | 'cajero' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  role: UserRole;
  chipBalance: number;
  status: 'activo' | 'suspendido';
  createdAt: string;
  lastLogin: string;
  cashierPanelId?: string; // If role is 'cajero'
  assignedCashierId?: string; // If role is 'jugador', which cashier manages this player
  plainPassword?: string;
}

export interface CashierPanel {
  id: string;
  name: string; // e.g., "Caja Central Palermo", "Agencia Rosario Norte"
  operatorName: string;
  username: string;
  dni: string;
  phone: string;
  aliasCobro: string; // e.g. "LACLAVE.PALERMO.CVU"
  commissionRate: number; // e.g. 10 (%)
  chipBalance: number;
  status: 'activo' | 'suspendido';
  createdAt: string;
  totalChipsDistributed: number;
  totalChipsRedeemed: number;
  assignedUserId: string;
  slug?: string;
  notes?: string;
}

export type GameCategory = 'todos' | 'destacados' | 'slots' | 'ruleta' | 'bingo' | 'apuestas';

export interface CasinoGame {
  id: string;
  title: string;
  category: 'slots' | 'ruleta' | 'bingo' | 'apuestas';
  subtitle: string;
  provider: string;
  thumbnail: string;
  banner?: string;
  featured?: boolean;
  skinId?: string;
  tag?: 'POPULAR' | 'HOT' | 'JACKPOT' | 'NUEVO' | 'EXCLUSIVO ARG';
  jackpotAmount?: number;
  rtp: number; // e.g. 96.8
  minBet: number;
  maxBet: number;
  volatility: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
  description: string;
  features: string[];
  lines?: number;
}

export type TransactionType =
  | 'CARGA_FICHAS'
  | 'RETIRO_FICHAS'
  | 'APUESTA_JUEGO'
  | 'PREMIO_JUEGO'
  | 'BONO_BIENVENIDA'
  | 'AJUSTE_ADMIN'
  | 'EMISION_INFINITA_BOVEDA'
  | 'FONDEO_CAJERO'
  | 'TRANSFERENCIA_CAJERO'
  | 'RETIRO_RECUPERO_CAJERO';

export interface Transaction {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  gameId?: string;
  gameTitle?: string;
  hashIntegrity: string;
  status: 'COMPLETADO' | 'PENDIENTE' | 'RECHAZADO';
  notes?: string;
}

export interface GameRoundHistory {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  gameId: string;
  gameTitle: string;
  category: 'slots' | 'ruleta' | 'bingo' | 'apuestas';
  betAmount: number;
  payoutAmount: number;
  multiplier: number;
  isWin: boolean;
  resultSummary: string;
  hashSignature: string;
  details?: any;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'JACKPOT' | 'TRANSACCION' | 'SEGURIDAD' | 'SISTEMA' | 'PROMO';
  read?: boolean;
  highlightAmount?: number;
}

export interface ChipRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  requestedAt: string;
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  aliasTransferencia?: string;
  tipo: 'CARGA' | 'RETIRO';
  nota?: string;
  processedByCashierId?: string;
}

export interface SportsEvent {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  isLive?: boolean;
  score?: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over25?: number;
    under25?: number;
  };
}

// --- GAME ENGINES & SKINS ARCHITECTURE ---

export interface SlotSymbolDef {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
  payouts: Record<number, number>; // { 3: 5, 4: 20, 5: 100 }
  isWild?: boolean;
  isScatter?: boolean;
  isJackpot?: boolean;
  badge?: string;
}

export interface SlotSkin {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  category: 'slots';
  themeColor: string;
  accentColor: string;
  gradientBackground: string;
  cardBorder: string;
  symbols: SlotSymbolDef[];
  reelsCount: number;
  rowsCount: number;
  soundProfile: {
    ambientTrack: string;
    spinKey: string;
    winKey: string;
    jackpotKey: string;
  };
  features: string[];
}

export interface RouletteSkin {
  id: string;
  name: string;
  title: string;
  clothColor: string;
  feltTexture: string;
  trimColor: string;
  accentColor: string;
  isLightning: boolean;
  maxMultiplier: number;
  specialSound: string;
}

export interface BingoSkin {
  id: string;
  name: string;
  title: string;
  cardBg: string;
  ballTheme: string;
  drumColor: string;
  accentColor: string;
  ballsCount: 75 | 90;
}

export interface DatabaseInstanceMetrics {
  name: string;
  provider: 'firebase' | 'supabase' | 'local';
  projectId?: string;
  status: 'active' | 'standby' | 'quota_exhausted' | 'disabled';
  readsToday: number;
  maxDailyReads: number;
  writesToday: number;
  maxDailyWrites: number;
  storedMegabytes: number;
  maxStoredMegabytes: number;
  lastSyncTimestamp: string;
}

export interface DualDatabaseStatus {
  primary: DatabaseInstanceMetrics;
  secondary: DatabaseInstanceMetrics;
  activeTarget: 'primary' | 'secondary';
  failoverEnabled: boolean;
  cacheHitRatio: number;
  totalReadsFromMemoryCache: number;
  totalWritesSavedByBatching: number;
  dirtyBufferCount: number;
  persistenceMode: string;
}

export interface CreateGameRequest {
  title: string;
  subtitle: string;
  category: 'slots' | 'ruleta' | 'bingo';
  skinId: string;
  provider?: string;
  thumbnail: string;
  banner?: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  volatility: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
  description: string;
  features: string[];
}
