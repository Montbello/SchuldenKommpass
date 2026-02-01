import { useState } from 'react';
import './FloatingLabelInput.css';

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * FloatingLabelInput - Modern input field with animated floating label
 * 
 * Features:
 * - Animated label that floats up when focused or has value
 * - Optional icon support
 * - Error state with shake animation
 * - Accessible with proper ARIA attributes
 * - Smooth transitions
 */
export default function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  placeholder = ' ',
  disabled = false,
  required = false
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);

  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className={`floating-input-wrapper ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
      {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
      <div className="floating-input-container">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`floating-input ${icon ? 'with-icon' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        <label className={`floating-label ${isActive ? 'active' : ''}`}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
        <div className={`input-border ${focused ? 'focused' : ''}`}></div>
      </div>
      {error && (
        <span className="input-error" id={`${label}-error`} role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          {error}
        </span>
      )}
    </div>
  );
}
