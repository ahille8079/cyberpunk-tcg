import { cn } from "@/lib/utils";

const glowClasses = {
  yellow: "neon-glow-yellow text-cyber-yellow",
  cyan: "neon-glow-cyan text-cyber-cyan",
  magenta: "neon-glow-magenta text-cyber-magenta",
  blue: "neon-glow-blue text-cyber-blue",
} as const;

interface NeonTextProps {
  children: React.ReactNode;
  color?: keyof typeof glowClasses;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  pulse?: boolean;
}

export function NeonText({
  children,
  color = "yellow",
  as: Tag = "span",
  className,
  pulse = false,
}: NeonTextProps) {
  return (
    <Tag
      className={cn(
        glowClasses[color],
        pulse && "animate-neon-pulse",
        className
      )}
    >
      {children}
    </Tag>
  );
}
