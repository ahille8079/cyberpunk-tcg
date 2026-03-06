import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-cyber-yellow text-cyber-black hover:box-glow-yellow font-bold",
  secondary:
    "border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 hover:box-glow-cyan",
  ghost:
    "text-cyber-light hover:text-cyber-yellow hover:bg-white/5",
} as const;

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function CyberButton({
  children,
  variant = "primary",
  href,
  onClick,
  className,
  disabled = false,
  type = "button",
}: CyberButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 font-mono text-sm uppercase tracking-wider transition-all duration-200 clip-corner",
    variants[variant],
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
