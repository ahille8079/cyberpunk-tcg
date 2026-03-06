export default function Loading() {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center">
      <div className="space-y-3 w-64">
        <div className="h-3 bg-cyber-grey rounded animate-pulse" />
        <div className="h-3 bg-cyber-grey rounded animate-pulse w-3/4" />
        <div className="h-3 bg-cyber-grey rounded animate-pulse w-1/2" />
        <div className="mt-6 text-xs font-mono text-cyber-light/30 text-center">
          Loading...
        </div>
      </div>
    </div>
  );
}
