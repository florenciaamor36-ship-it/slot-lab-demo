import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SlotEngine, SlotSpinResult } from './engines/SlotEngine';
import { games } from './games';
import { VampireSlot } from './components/VampireSlot';
import { VampireBigWinOverlay } from './components/VampireBigWinOverlay';
import './style.css';

const CLEOPATRA_ASSET_BASE = `${import.meta.env.BASE_URL}assets/slots/cleopatra`;
const CLEOPATRA_SYMBOLS: Record<string, string> = {
  s0: 'cleopatra-wild', s1: 'eye-of-horus', s2: 'ankh', s3: 'scarab',
  s4: 'coin', s5: 'lotus', wild: 'cleopatra-wild', scatter: 'bonus'
};

class AudioController {
  private ctx: AudioContext | null = null;
  private getContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    return this.ctx;
  }
  play(kind: 'spin' | 'stop' | 'win' | 'jackpot') {
    const ctx = this.getContext(); if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const notes = kind === 'jackpot' ? [392, 523, 659, 784, 1046] : kind === 'win' ? [523, 659, 784] : kind === 'stop' ? [220] : [180, 220, 260];
    notes.forEach((frequency, index) => {
      const start = ctx.currentTime + index * (kind === 'spin' ? .055 : .09);
      const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
      oscillator.type = kind === 'spin' ? 'sine' : 'triangle'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(kind === 'jackpot' ? .16 : .07, start + .02); gain.gain.exponentialRampToValueAtTime(.0001, start + .17);
      oscillator.connect(gain).connect(ctx.destination); oscillator.start(start); oscillator.stop(start + .19);
    });
  }
}
const audio = new AudioController();

function CleopatraOverlay({ result, onClose }: { result: SlotSpinResult; onClose: () => void }) {
  return <div className="big-win-overlay" role="dialog" aria-modal="true" aria-label="Premio grande demo">
    <div className="big-win-card">
      <button className="overlay-close" onClick={onClose} aria-label="Cerrar premio">×</button>
      <img src={`${CLEOPATRA_ASSET_BASE}/overlays/golden-jackpot.jpg`} alt="Cleopatra Golden Jackpot" />
      <strong>{result.totalPayout.toLocaleString('es-AR')} fichas</strong>
      <span>PREMIO DEMO · FICHAS VIRTUALES</span>
    </div>
  </div>;
}

function App() {
  const [selected, setSelected] = useState(0);
  const [bet, setBet] = useState(100);
  const [balance, setBalance] = useState(10000);
  const [result, setResult] = useState<SlotSpinResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showBigWin, setShowBigWin] = useState(false);

  const game = games[selected];
  const isVampire = game.id === 'vampire-slot';
  const isCleopatra = game.id === 'demo-slot-1';

  const engine = useMemo(() => new SlotEngine(game), [game]);

  const spin = () => {
    if (spinning || balance < bet) return;
    audio.play('spin'); setSpinning(true); setResult(null); setShowBigWin(false);
    window.setTimeout(() => {
      const r = engine.spin(bet, 'demo-only');
      setBalance((b) => b - bet + r.totalPayout);
      setResult(r);
      setSpinning(false);
      audio.play(r.isJackpot ? 'jackpot' : r.isWin ? 'win' : 'stop');
      if (r.isJackpot || r.totalMultiplier >= 20) setShowBigWin(true);
    }, 900);
  };

  const handleVampireSpinComplete = (spinResult: SlotSpinResult) => {
    setBalance((b) => b + spinResult.totalPayout);
    setResult(spinResult);
    if (spinResult.isJackpot || spinResult.totalMultiplier >= 20) {
      setShowBigWin(true);
    }
  };

  const handleVampireDeductBalance = (amount: number) => {
    setBalance((b) => b - amount);
    setResult(null);
    setShowBigWin(false);
  };

  const grid = result?.grid ?? [];

  return (
    <div className={`app ${isVampire ? 'vampire-app' : isCleopatra ? 'cleopatra-app' : ''}`}>
      <header>
        <b>🎰 SLOT LAB DEMO</b>
        <span>Motor común SlotEngine · fichas virtuales · no dinero real</span>
      </header>
      <main>
        <aside>
          <h2>Máquinas ({games.length})</h2>
          {games.map((g, i) => (
            <button
              className={`machine-nav-btn ${i === selected ? 'active' : ''} ${g.id === 'vampire-slot' ? 'vampire-nav-btn' : ''}`}
              onClick={() => {
                setSelected(i);
                setResult(null);
                setShowBigWin(false);
              }}
              key={g.id}
            >
              {g.title}
              <small>{g.subtitle}</small>
            </button>
          ))}
        </aside>

        <section>
          <div className="hero">
            <div className="sparkles">✦ ✧ ✦</div>
            <p>{game.subtitle}</p>
            <h1>{game.title}</h1>
            <span>Motor común SlotEngine · Demo {selected + 1}/{games.length}</span>
          </div>

          {/* Render Dedicated Vampire Slot Machine Component */}
          {isVampire && (
            <VampireSlot
              engine={engine}
              balance={balance}
              bet={bet}
              onBetChange={setBet}
              onSpinComplete={handleVampireSpinComplete}
              onDeductBalance={handleVampireDeductBalance}
            />
          )}

          {/* Cleopatra Machine */}
          {!isVampire && isCleopatra && (
            <div className="cleopatra-machine" style={{ backgroundImage: `url(${CLEOPATRA_ASSET_BASE}/frames/cabinet-bg.jpg)` }}>
              <img className="cleopatra-logo" src={`${CLEOPATRA_ASSET_BASE}/frames/cleopatra-logo.jpg`} alt="Cleopatra" />
              <div className={`grid cleopatra-grid ${spinning ? 'spinning' : ''} ${result?.isWin ? 'winner' : ''}`}>
                {(grid.length ? grid.flat() : Array.from({ length: 15 }, () => null)).map((s, i) => (
                  <div className="cell" key={i}>
                    {s ? <><img src={`${CLEOPATRA_ASSET_BASE}/symbols/${CLEOPATRA_SYMBOLS[s.id] ?? 'coin'}.png`} alt={s.label} /><small>{s.label}</small></> : '❔'}
                  </div>
                ))}
              </div>
              <img className="control-art" src={`${CLEOPATRA_ASSET_BASE}/frames/control-panel.jpg`} alt="Panel de control Cleopatra" />
              <button className="hotspot hotspot-spin" onClick={spin} disabled={spinning}>{spinning ? 'GIRANDO…' : 'GIRAR'}</button>
              <button className="hotspot hotspot-minus" onClick={() => setBet((v) => Math.max(10, v - 10))} aria-label="Bajar apuesta">−</button>
              <button className="hotspot hotspot-plus" onClick={() => setBet((v) => Math.min(1000, v + 10))} aria-label="Subir apuesta">+</button>
            </div>
          )}

          {/* Standard Generic Machines */}
          {!isVampire && !isCleopatra && (
            <div className={`grid ${spinning ? 'spinning' : ''} ${result?.isWin ? 'winner' : ''}`}>
              {(grid.length ? grid.flat() : Array.from({ length: 15 }, () => null)).map((s, i) => (
                <div className="cell" key={i} style={{ color: s?.color }}>
                  {s?.emoji ?? '❔'}<small>{s?.label}</small>
                </div>
              ))}
            </div>
          )}

          {/* Controls bar for generic/cleopatra machines */}
          {!isVampire && (
            <div className="controls">
              <span>Saldo demo: <b>{balance.toLocaleString('es-AR')}</b></span>
              <label>
                Apuesta{' '}
                <input
                  type="number"
                  value={bet}
                  min="10"
                  max="1000"
                  step="10"
                  onChange={(e) => setBet(Math.max(10, Number(e.target.value) || 10))}
                />
              </label>
              {!isCleopatra && (
                <button className="spin" onClick={spin} disabled={spinning}>
                  {spinning ? 'GIRANDO…' : 'GIRAR'}
                </button>
              )}
            </div>
          )}

          {/* Balance display for Vampire machine */}
          {isVampire && (
            <div className="vampire-global-balance-bar">
              <span>Saldo Demo Virtual: <b>{balance.toLocaleString('es-AR')} fichas</b></span>
            </div>
          )}

          <div className={`message ${result?.isWin ? 'win' : ''}`}>
            {result?.summary ?? 'Elegí una máquina y girá para probarla.'}
          </div>

          <p className="note">
            Demo matemática con fichas virtuales. El resultado y la validación no representan dinero real ni un sistema de premios conectado.
          </p>
        </section>
      </main>

      {/* Overlays */}
      {showBigWin && result && isVampire && (
        <VampireBigWinOverlay result={result} onClose={() => setShowBigWin(false)} />
      )}
      {showBigWin && result && !isVampire && (
        <CleopatraOverlay result={result} onClose={() => setShowBigWin(false)} />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
