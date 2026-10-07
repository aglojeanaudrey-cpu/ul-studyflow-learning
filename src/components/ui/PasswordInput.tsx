import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  /** Afficher l'icône à gauche (cadenas, etc.) - passer la classe CSS de padding correspondante */
  withLeftIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  withLeftIcon = false
}) => {
  const [show, setShow] = useState(false);

  const baseClass = `w-full text-xs ${withLeftIcon ? 'pl-8' : 'pl-3'} pr-10 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white focus:bg-white dark:focus:bg-[#111B21] focus:border-[#25D366] focus:outline-none`;

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`${baseClass} ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#667781] dark:text-[#8696A0] hover:text-[#075E54] dark:hover:text-[#25D366] hover:bg-[#E9EDEF] dark:hover:bg-[#222E35] transition-colors"
        title={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};