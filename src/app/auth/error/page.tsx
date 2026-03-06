import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold font-mono text-cyber-magenta mb-4">
          AUTHENTICATION FAILED
        </h1>
        <p className="text-cyber-light/60 font-mono text-sm mb-8">
          Something went wrong during sign-in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-cyber-yellow text-cyber-yellow font-mono uppercase tracking-wider text-sm hover:bg-cyber-yellow/10 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
