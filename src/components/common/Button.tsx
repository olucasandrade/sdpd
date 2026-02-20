import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', disabled, className = '' }: ButtonProps) {
  const base = 'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer';
  const variants = {
    primary: 'bg-amber-500 text-noir-950 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:bg-amber-500/30 disabled:text-noir-950/50 disabled:shadow-none font-semibold',
    secondary: 'bg-noir-700 text-white/80 hover:bg-noir-600 border border-noir-500/50 hover:border-amber-500/30',
    ghost: 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/5',
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
