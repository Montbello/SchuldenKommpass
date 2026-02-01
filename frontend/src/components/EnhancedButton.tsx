import { useState } from 'react';
import './EnhancedButton.css';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Enhanced Button with Ripple Effect and Loading State
 * 
 * A modern, interactive button component with:
 * - Material Design ripple effect
 * - Loading state with spinner
 * - Multiple variants and sizes
 * - Icon support
 * - Smooth animations
 * 
 * @example
 * <EnhancedButton variant="primary" icon="🚀" onClick={handleClick}>
 *   Jetzt starten
 * </EnhancedButton>
 */
export default function EnhancedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  disabled = false,
  type = 'button'
}: EnhancedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      type={type}
      className={`enhanced-btn enhanced-btn-${variant} enhanced-btn-${size} ${loading ? 'loading' : ''}`}
      onClick={createRipple}
      disabled={loading || disabled}
    >
      {loading && (
        <span className="spinner" role="status" aria-label="Lädt">
          <span className="spinner-inner"></span>
        </span>
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
        />
      ))}
    </button>
  );
}
