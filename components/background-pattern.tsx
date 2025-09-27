export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        // UPDATE: Increased grid opacity from 20 to 40
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          // UPDATE: Increased sphere opacity from /10 to /20
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/20 blur-xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          // UPDATE: Increased sphere opacity from /10 to /20
          className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-purple-500/20 blur-xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
        <div
          // UPDATE: Increased sphere opacity from /10 to /20
          className="absolute top-1/2 left-3/4 w-20 h-20 rounded-full bg-cyan-500/20 blur-xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
      </div>
    </div>
  )
}