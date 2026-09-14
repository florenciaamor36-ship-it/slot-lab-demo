import React, { useState, useEffect, useRef, useTransition } from 'react';
import { SlotEngine, SlotSpinResult } from '../engines/SlotEngine';
import { VAMPIRE_SKIN } from '../games';
import { SlotSymbolDef } from '../types';

const ASSET_BASE = `${import.meta.env.BASE_URL}assets/slots/vampire`;

const SYMBOL_IMAGE_MAP: Record<string, string> = {
  'vampire-wild': 'vampire-wild.png',
  'blood-moon': 'blood-moon.png',
  'gothic-skull': 'gothic-skull.png',
  'bat': 'bat.png',
  'coffin': 'coffin.png',
  'ruby-gem': 'ruby-gem.png',
  'card-a': 'card-a.png',
  'card-k': 'card-k.png',
  'card-q': 'card-q.png',
  'card-j': 'card-j.png',
};

// Central Audio Controller with synthetic fallbacks and mute toggle support
export class VampireAudioController {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    return this.ctx;
  }

  public play(kind: 'spin' | 'stop' | 'win' | 'jackpot') {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    if (kind === 'spin') {
      // Atmospheric low spin rumble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (kind === 'stop') {
      // Heavy mechanical thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (kind === 'win') {
      // Gothic arpeggio win chiming
      const notes = [311.13, 369.99, 466.16, 622.25]; // D# minor gothic chord
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.32);
      });
    } else if (kind === 'jackpot') {
      // Dramatic organ-like sweep for jackpot
      const chord = [233.08, 311.13, 349.23, 466.16, 622.25, 932.33];
      chord.forEach((freq, idx) => {
        const start = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.85);
      });
    }
  }
}

export const vampireAudio = new VampireAudioController();

interface VampireSlotProps {
  engine: SlotEngine;
  balance: number;
  bet: number;
  onBetChange: (newBet: number) => void;
  onSpinComplete: (result: SlotSpinResult) => void;
  onDeductBalance: (amount: number) => void;
}

export const VampireSlot: React.FC<VampireSlotProps> = ({
  engine,
  balance,
  bet,
  onBetChange,
  onSpinComplete,
  onDeductBalance,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([true, true, true, true, true]);
  const [grid, setGrid] = useState<SlotSymbolDef[][]>([]);
  const [lastResult, setLastResult] = useState<SlotSpinResult | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [muted, setMuted] = useState(false);

  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  const spinningRef = useRef(spinning);
  spinningRef.current = spinning;

  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const betRef = useRef(bet);
  betRef.current = bet;

  // Toggle Mute
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    vampireAudio.setMuted(next);
  };

  const handleSpin = () => {
    if (spinningRef.current || balanceRef.current < betRef.current) {
      if (autoPlayRef.current) setAutoPlay(false);
      return;
    }

    onDeductBalance(betRef.current);
    setSpinning(true);
    setStoppedReels([false, false, false, false, false]);
    setLastResult(null);

    vampireAudio.play('spin');

    const result = engine.spin(betRef.current, 'vampire-seed-' + Date.now());

    // Staggered reel stops (Col 0, 1, 2, 3, 4)
    const reelDelays = [400, 650, 900, 1150, 1400];

    reelDelays.forEach((delay, colIndex) => {
      setTimeout(() => {
        setStoppedReels((prev) => {
          const next = [...prev];
          next[colIndex] = true;
          return next;
        });
        vampireAudio.play('stop');
      }, delay);
    });

    // Final completion when all reels stop
    setTimeout(() => {
      setGrid(result.grid);
      setLastResult(result);
      setSpinning(false);
      onSpinComplete(result);

      if (result.isJackpot) {
        vampireAudio.play('jackpot');
      } else if (result.isWin) {
        vampireAudio.play('win');
      }

      // Handle autoplay sequence
      if (autoPlayRef.current && balanceRef.current >= betRef.current) {
        setTimeout(() => {
          if (autoPlayRef.current) handleSpin();
        }, 1200);
      } else if (autoPlayRef.current && balanceRef.current < betRef.current) {
        setAutoPlay(false);
      }
    }, 1500);
  };

  const toggleAutoPlay = () => {
    const nextState = !autoPlay;
    setAutoPlay(nextState);
    if (nextState && !spinning) {
      handleSpin();
    }
  };

  return (
    <div className="vampire-slot-container" role="region" aria-label="Máquina Tragamonedas Vampiro Demo">
      {/* Gothic Frame Header */}
      <div className="vampire-cabinet-header">
        <img
          src={`${ASSET_BASE}/frames/vampire-logo.png`}
          alt="Vampire: Blood Night Logo"
          className="vampire-cabinet-logo"
        />
        <div className="vampire-demo-badge">MODO DEMO · FICHAS VIRTUALES</div>
      </div>

      {/* Main 5x3 Reel Box */}
      <div
        className="vampire-reels-frame"
        style={{ backgroundImage: `url(${ASSET_BASE}/frames/cabinet-bg.jpg)` }}
      >
        <div className="vampire-reels-container" tabIndex={0} aria-label="Rodillos de slot 5x3">
          {Array.from({ length: 5 }).map((_, col) => {
            const isReelStopped = stoppedReels[col];
            const colSymbols = grid[col] || [];

            return (
              <div
                key={col}
                className={`vampire-reel-column ${!isReelStopped ? 'vampire-reel-spinning' : ''}`}
                style={{ animationDelay: `${col * 0.08}s` }}
              >
                {Array.from({ length: 3 }).map((_, row) => {
                  const sym = colSymbols[row];
                  const isWinningPos =
                    lastResult?.winningLines.some((wl) =>
                      wl.positions.some((p) => p.col === col && p.row === row)
                    ) ?? false;

                  return (
                    <div
                      key={row}
                      className={`vampire-cell ${isWinningPos ? 'vampire-cell-win' : ''}`}
                    >
                      {sym ? (
                        <div className="vampire-symbol-wrapper">
                          <img
                            src={`${ASSET_BASE}/symbols/${SYMBOL_IMAGE_MAP[sym.id] || 'vampire-wild.png'}`}
                            alt={sym.name}
                            className="vampire-symbol-img"
                          />
                          <span className="vampire-symbol-label">{sym.label}</span>
                        </div>
                      ) : (
                        <div className="vampire-symbol-placeholder">🦇</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Hotspot HTML Control Panel */}
        <div className="vampire-control-panel" role="toolbar" aria-label="Controles del juego">
          {/* Bet Minus Hotspot Button */}
          <button
            className="vampire-hotspot vampire-hotspot-minus"
            onClick={() => onBetChange(Math.max(10, bet - 10))}
            disabled={spinning}
            aria-label="Disminuir apuesta"
            title="Disminuir Apuesta"
          >
            −
          </button>

          {/* Bet Display Hotspot */}
          <div className="vampire-hotspot-display vampire-hotspot-bet" aria-live="polite">
            <small>APUESTA</small>
            <span>{bet}</span>
          </div>

          {/* Bet Plus Hotspot Button */}
          <button
            className="vampire-hotspot vampire-hotspot-plus"
            onClick={() => onBetChange(Math.min(1000, bet + 10))}
            disabled={spinning}
            aria-label="Aumentar apuesta"
            title="Aumentar Apuesta"
          >
            +
          </button>

          {/* Main SPIN Button */}
          <button
            className={`vampire-hotspot vampire-hotspot-spin ${spinning ? 'vampire-spin-active' : ''}`}
            onClick={handleSpin}
            disabled={spinning || balance < bet}
            aria-label="Girar rodillos"
          >
            {spinning ? 'GIRANDO…' : 'GIRAR'}
          </button>

          {/* Autoplay Button */}
          <button
            className={`vampire-hotspot vampire-hotspot-auto ${autoPlay ? 'vampire-auto-active' : ''}`}
            onClick={toggleAutoPlay}
            disabled={spinning && !autoPlay}
            aria-label={autoPlay ? 'Detener juego automático' : 'Iniciar juego automático'}
            title="Autoplay"
          >
            {autoPlay ? 'AUTO ON' : 'AUTO'}
          </button>

          {/* Paytable Modal Toggle Button */}
          <button
            className="vampire-hotspot vampire-hotspot-info"
            onClick={() => setShowPaytable(true)}
            aria-label="Ver tabla de pagos"
            title="Tabla de Pagos"
          >
            ℹ️
          </button>

          {/* Audio Mute Button */}
          <button
            className={`vampire-hotspot vampire-hotspot-audio ${muted ? 'vampire-audio-muted' : ''}`}
            onClick={toggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            title="Audio"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <div className="vampire-paytable-modal" role="dialog" aria-modal="true" aria-label="Tabla de Pagos Gótica">
          <div className="vampire-paytable-content">
            <button
              className="vampire-paytable-close"
              onClick={() => setShowPaytable(false)}
              aria-label="Cerrar tabla de pagos"
            >
              ×
            </button>
            <h3>📜 TABLA DE PAGOS VAMPÍRICA</h3>
            <p className="vampire-paytable-sub">Pagos multiplicados por apuesta por línea (20 Líneas de pago demo)</p>

            <div className="vampire-paytable-grid">
              {VAMPIRE_SKIN.symbols.map((sym) => (
                <div key={sym.id} className="vampire-paytable-card">
                  <img
                    src={`${ASSET_BASE}/symbols/${SYMBOL_IMAGE_MAP[sym.id]}`}
                    alt={sym.name}
                  />
                  <div>
                    <strong>{sym.name} {sym.isWild ? '(WILD)' : sym.isScatter ? '(SCATTER)' : ''}</strong>
                    <ul>
                      {sym.payouts[5] && <li>5x = {sym.payouts[5]}x</li>}
                      {sym.payouts[4] && <li>4x = {sym.payouts[4]}x</li>}
                      {sym.payouts[3] && <li>3x = {sym.payouts[3]}x</li>}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <p className="vampire-demo-disclaimer">
              ⚠️ JUEGO DEMO EDUCATIVO. Sin premios ni transacciones con dinero real.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
