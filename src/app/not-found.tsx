import { NeonText } from "@/components/ui/neon-text";
import { CyberButton } from "@/components/ui/cyber-button";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-6">
      <NeonText
        as="h1"
        color="magenta"
        className="text-8xl font-bold font-mono hover:animate-glitch"
      >
        404
      </NeonText>
      <p className="text-cyber-light/50 font-mono">
        This sector of Night City doesn&apos;t exist.
      </p>
      <CyberButton href="/" variant="secondary">
        Return Home
      </CyberButton>
    </div>
  );
}
