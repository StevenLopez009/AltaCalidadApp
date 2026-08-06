export function HeroBackground() {
  return (
    <>
      {/* Fondo principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a1a] via-[#F25C05] to-[#d84b00]" />

      {/* Glow izquierdo */}
      <div className="absolute -left-32 -top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-[180px]" />

      {/* Glow derecho */}
      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-red-700/30 blur-[150px]" />

      {/* Líneas diagonales tecnológicas */}
      <div className="absolute left-0 top-40 h-px w-[450px] rotate-[-25deg] bg-white/20" />

      <div className="absolute right-20 top-32 h-px w-[350px] rotate-[35deg] bg-white/20" />

      <div className="absolute bottom-40 left-20 h-px w-[300px] rotate-[15deg] bg-white/20" />

      {/* Circuitos superiores */}
      <div className="absolute left-32 top-16">
        <div className="h-24 w-px bg-white/30" />
        <div className="h-px w-40 bg-white/30" />

        <div className="mt-6 flex gap-3">
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="h-2 w-2 rounded-full bg-white/50" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Marco superior izquierdo */}
      <div className="absolute left-24 top-10 h-44 w-44 border border-white/10" />

      {/* Marco tecnológico derecho */}
      <div className="absolute right-32 top-24 h-56 w-56 border border-white/20">
        <div className="absolute -left-3 top-10 h-6 w-6 border-l border-t border-white" />

        <div className="absolute -right-3 bottom-10 h-6 w-6 border-r border-b border-white" />
      </div>

      {/* Línea vertical */}
      <div className="absolute left-24 top-20 h-44 w-px bg-white/20" />

      {/* Línea horizontal */}
      <div className="absolute left-24 top-20 h-px w-52 bg-white/20" />

      {/* Cruz HUD */}
      <div className="absolute left-[52%] top-32 text-5xl text-white/60">×</div>

      {/* Círculos estilo interfaz */}
      <div className="absolute right-24 top-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/30">
        <div className="h-10 w-10 rounded-full border border-white/50" />
      </div>

      {/* Puntos de conexión */}
      <div className="absolute left-12 top-[40%] flex flex-col gap-3">
        <span className="h-3 w-3 rounded-full bg-white/70" />
        <span className="h-3 w-3 rounded-full bg-white/70" />
        <span className="h-3 w-3 rounded-full bg-white/70" />
        <span className="h-3 w-3 rounded-full bg-black" />
      </div>

      {/* Línea de datos inferior */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <span className="h-px w-32 bg-white/30" />

        <span className="h-3 w-3 rounded-full border border-white" />

        <span className="h-px w-32 bg-white/30" />
      </div>

      {/* Número gigante */}
      <h2
        className="
          absolute right-16 bottom-0
          text-[350px]
          font-black
          text-white/5
        "
      >
        AC
      </h2>
    </>
  );
}
