export default function DragonDuelBackground() {
  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl">
      {/* Background Image */}
      <div className="absolute inset-0 bg-dragon-duel bg-cover bg-center animate-aura-pulse" />

      {/* Motion swirl layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-red-500/20 mix-blend-overlay animate-aura-spin" />

      {/* Dark overlay for card readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Text or whatever you want on top */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-4xl font-bold drop-shadow-lg">
          Yugi-Scan: Duel Energy Mode
        </h1>
        <p className="text-lg opacity-80 mt-2">Blue-Eyes vs Red-Eyes — Eternal Clash</p>
      </div>
    </div>
  );
}
