/** Floating gradient background used behind hero/auth/dashboard surfaces. */
export function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="orb left-[-10%] top-[-10%] h-[420px] w-[420px] animate-float bg-primary-400/60" />
      <div className="orb right-[-8%] top-[20%] h-[360px] w-[360px] animate-float-slow bg-emerald-300/50" />
      <div className="orb bottom-[-12%] left-[30%] h-[400px] w-[400px] animate-float bg-teal-300/40 [animation-delay:2s]" />
    </div>
  );
}
