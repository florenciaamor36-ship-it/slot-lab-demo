import React, { useEffect, useState } from 'react';
import { SlotSpinResult } from '../engines/SlotEngine';

const ASSET_BASE = `${import.meta.env.BASE_URL}assets/slots/vampire`;

interface VampireBigWinOverlayProps {
  result: SlotSpinResult;
  onClose: () => void;
}

export const VampireBigWinOverlay: React.FC<VampireBigWinOverlayProps> = ({ result, onClose }) => {
  const [animatedPayout, setAnimatedPayout] = useState(0);

  useEffect(() => {
    const target = result.totalPayout;
    const duration = 1200; // 1.2s count up animation
    const steps = 30;
    const increment = Math.ceil(target / steps);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedPayout(target);
        clearInterval(timer);
      } else {
        setAnimatedPayout(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.totalPayout]);

  return (
    <div
      className="vampire-big-win-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Gran Premio Demo Vampírico"
    >
      <div className="vampire-big-win-backdrop" onClick={onClose} />

      <div className="vampire-big-win-card">
        <button
          className="vampire-overlay-close"
          onClick={onClose}
          aria-label="Cerrar ventana de premio"
        >
          ×
        </button>

        <div className="vampire-jackpot-header">
          {result.isJackpot ? '🦇 GRAN JACKPOT VAMPÍRICO 🦇' : '🩸 VICTORIA VAMPÍRICA 🩸'}
        </div>

        <div className="vampire-jackpot-img-wrapper">
          <img
            src={`${ASSET_BASE}/overlays/vampire-jackpot.jpg`}
            alt="Jackpot Vampírico"
            className="vampire-jackpot-img"
          />
        </div>

        <div className="vampire-payout-counter">
          <span className="vampire-payout-num">{animatedPayout.toLocaleString('es-AR')}</span>
          <small>FICHAS VIRTUALES DEMO</small>
        </div>

        <div className="vampire-multiplier-badge">
          MULTIPLICADOR: {result.totalMultiplier}x
        </div>

        <div className="vampire-watermark-demo">
          MODO DEMO · SIN DINERO REAL · SOLO DIVERSIÓN
        </div>

        <button className="vampire-claim-btn" onClick={onClose}>
          CONTINUAR JUGANDO
        </button>
      </div>
    </div>
  );
};
