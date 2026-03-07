import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cyber-grey py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-center text-xs font-mono text-cyber-light/30">
        <span>RIPPERDECK</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-cyber-light/50 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-cyber-light/50 transition-colors">Terms</Link>
        </div>
        <span>Not affiliated with CD Projekt Red or WeirdCo</span>
      </div>
    </footer>
  );
}
