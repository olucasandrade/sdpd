import { motion } from "framer-motion";

interface BadgeProps {
  icon: string;
  name: string;
  size?: "sm" | "lg";
}

export function Badge({ icon, name, size = "sm" }: BadgeProps) {
  const sizes = {
    sm: "w-9 h-9 text-base",
    lg: "w-24 h-24 text-5xl",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-noir-700 to-noir-800 border border-amber-500/40 flex items-center justify-center neon-border overflow-hidden`}
      >
        <span className="leading-none">{icon}</span>
      </div>
      {size === "lg" && (
        <span className="font-display text-amber-400 text-lg tracking-wider">
          {name}
        </span>
      )}
    </motion.div>
  );
}
