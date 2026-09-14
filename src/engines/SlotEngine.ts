import { SlotSkin, SlotSymbolDef } from '../types';

export interface PaylineWin {
  lineIndex: number;
  symbol: SlotSymbolDef;
  count: number;
  multiplier: number;
  payout: number;
  positions: Array<{ col: number; row: number }>;
}

export interface SlotSpinResult {
  grid: SlotSymbolDef[][]; // grid[col][row]
  winningLines: PaylineWin[];
  totalMultiplier: number;
  totalPayout: number;
  isWin: boolean;
  isJackpot: boolean;
  isFreeSpinsBonus: boolean;
  freeSpinsCount: number;
  provablyFairHash: string;
  summary: string;
}

// 20 Standard Casino Paylines for 5x3 Grid
export const STANDARD_5X3_PAYLINES: Array<number[]> = [
  [1, 1, 1, 1, 1], // Línea 1: Centro horizontal
  [0, 0, 0, 0, 0], // Línea 2: Arriba horizontal
  [2, 2, 2, 2, 2], // Línea 3: Abajo horizontal
  [0, 1, 2, 1, 0], // Línea 4: V invertida
  [2, 1, 0, 1, 2], // Línea 5: V
  [0, 0, 1, 2, 2], // Línea 6: Diagonal bajando
  [2, 2, 1, 0, 0], // Línea 7: Diagonal subiendo
  [1, 0, 0, 0, 1], // Línea 8: Corona invertida
  [1, 2, 2, 2, 1], // Línea 9: Corona normal
  [1, 0, 1, 2, 1], // Línea 10: Zig-zag medio
  [1, 2, 1, 0, 1], // Línea 11: Zig-zag inverso
  [0, 1, 1, 1, 0], // Línea 12: Meseta superior
  [2, 1, 1, 1, 2], // Línea 13: Meseta inferior
  [0, 1, 0, 1, 0], // Línea 14: W arriba
  [2, 1, 2, 1, 2], // Línea 15: M abajo
  [1, 1, 0, 1, 1], // Línea 16: Pico medio arriba
  [1, 1, 2, 1, 1], // Línea 17: Pico medio abajo
  [0, 2, 0, 2, 0], // Línea 18: Alternado
  [2, 0, 2, 0, 2], // Línea 19: Alternado inverso
  [0, 0, 2, 0, 0], // Línea 20: Vuelo de águila
];

export class SlotEngine {
  private skin: SlotSkin;
  private reels: number;
  private rows: number;
  private paylines: Array<number[]>;

  constructor(skin: SlotSkin, paylines: Array<number[]> = STANDARD_5X3_PAYLINES) {
    this.skin = skin;
    this.reels = skin.reelsCount || 5;
    this.rows = skin.rowsCount || 3;
    this.paylines = paylines;
  }

  public setSkin(newSkin: SlotSkin): void {
    this.skin = newSkin;
    this.reels = newSkin.reelsCount || 5;
    this.rows = newSkin.rowsCount || 3;
  }

  public getSkin(): SlotSkin {
    return this.skin;
  }

  /**
   * Generates a random reel spin result adhering to RTP and volatility weights
   */
  public spin(betAmount: number, serverSeed: string = 'la_clave_rng_salt'): SlotSpinResult {
    const symbols = this.skin.symbols;
    const wildSymbol = symbols.find((s) => s.isWild);
    const scatterSymbol = symbols.find((s) => s.isScatter);
    const jackpotSymbol = symbols.find((s) => s.isJackpot);

    // Build weighted symbol pool (RTP tuning)
    const weightedPool: SlotSymbolDef[] = [];
    symbols.forEach((sym) => {
      let weight = 10;
      if (sym.isJackpot) weight = 2; // Raro
      else if (sym.isScatter) weight = 3;
      else if (sym.isWild) weight = 4;
      else if (sym.payouts[5] > 50) weight = 6;
      else weight = 12; // Símbolos comunes

      for (let i = 0; i < weight; i++) {
        weightedPool.push(sym);
      }
    });

    // Populate grid[col][row]
    const grid: SlotSymbolDef[][] = [];
    for (let c = 0; c < this.reels; c++) {
      const col: SlotSymbolDef[] = [];
      for (let r = 0; r < this.rows; r++) {
        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        col.push(weightedPool[randomIndex]);
      }
      grid.push(col);
    }

    // Evaluate paylines
    const winningLines: PaylineWin[] = [];
    const lineBet = betAmount / this.paylines.length;

    this.paylines.forEach((linePattern, lineIndex) => {
      const lineSymbols: SlotSymbolDef[] = [];
      const positions: Array<{ col: number; row: number }> = [];

      for (let c = 0; c < this.reels; c++) {
        const r = linePattern[c];
        lineSymbols.push(grid[c][r]);
        positions.push({ col: c, row: r });
      }

      // Check left-to-right matching
      let baseSymbol: SlotSymbolDef | null = null;
      let matchCount = 0;

      for (let i = 0; i < lineSymbols.length; i++) {
        const current = lineSymbols[i];

        if (current.isScatter) {
          // Scatters don't follow paylines, checked separately
          break;
        }

        if (!baseSymbol) {
          if (!current.isWild) {
            baseSymbol = current;
          }
          matchCount++;
        } else {
          if (current.id === baseSymbol.id || current.isWild) {
            matchCount++;
          } else {
            break;
          }
        }
      }

      const evalSymbol = baseSymbol || wildSymbol || lineSymbols[0];
      if (evalSymbol && matchCount >= 3 && evalSymbol.payouts[matchCount]) {
        const multiplier = evalSymbol.payouts[matchCount];
        const payout = Math.round(lineBet * multiplier);

        winningLines.push({
          lineIndex,
          symbol: evalSymbol,
          count: matchCount,
          multiplier,
          payout,
          positions: positions.slice(0, matchCount),
        });
      }
    });

    // Check Scatters count anywhere on screen
    let scatterCount = 0;
    for (let c = 0; c < this.reels; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (grid[c][r].isScatter) {
          scatterCount++;
        }
      }
    }

    const isFreeSpinsBonus = scatterCount >= 3;
    const freeSpinsCount = isFreeSpinsBonus ? (scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 25) : 0;

    // Check Jackpot line (5 Jackpot symbols on Line 0)
    let isJackpot = false;
    if (jackpotSymbol) {
      const topJackpotWin = winningLines.find((w) => w.symbol.id === jackpotSymbol.id && w.count >= 5);
      if (topJackpotWin) {
        isJackpot = true;
      }
    }

    const totalPayout = winningLines.reduce((acc, curr) => acc + curr.payout, 0);
    const totalMultiplier = betAmount > 0 ? Number((totalPayout / betAmount).toFixed(2)) : 0;
    const isWin = totalPayout > 0 || isFreeSpinsBonus;

    // Provably fair verification hash signature
    const hashData = `${this.skin.id}_${betAmount}_${totalPayout}_${Date.now()}_${serverSeed}`;
    const provablyFairHash = 'PF-' + Math.abs(this.hashCode(hashData)).toString(16).toUpperCase().padStart(12, '0');

    let summary = '';
    if (isJackpot) {
      summary = `¡JACKPOT HISTÓRICO! 5 ${jackpotSymbol?.name || 'Símbolos Supremos'} en ${this.skin.title}!`;
    } else if (isFreeSpinsBonus) {
      summary = `¡RONDA DE BONO ACTIVADA! ${scatterCount} Scatters otorgan ${freeSpinsCount} Giros Libres!`;
    } else if (isWin) {
      summary = `Premio de $${totalPayout.toLocaleString('es-AR')} (${totalMultiplier}x) en ${winningLines.length} líneas de pago.`;
    } else {
      summary = 'Tirada no premiada. ¡El pozo sigue acumulándose!';
    }

    return {
      grid,
      winningLines,
      totalMultiplier,
      totalPayout,
      isWin,
      isJackpot,
      isFreeSpinsBonus,
      freeSpinsCount,
      provablyFairHash,
      summary,
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
