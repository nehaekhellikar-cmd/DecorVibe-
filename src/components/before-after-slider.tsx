import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
  className = "",
}: { before: string; after: string; className?: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    setPos(p);
  };

  return (
    <div
      ref={ref}
      className={`relative w-full select-none overflow-hidden rounded-2xl shadow-luxury ${className}`}
      onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
      onClick={(e) => move(e.clientX)}
    >
      <img src={after} alt="After redesign" className="block h-full w-full object-cover" />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt="Before redesign"
          className="block h-full w-full object-cover"
          style={{ width: ref.current?.clientWidth ?? "100%", maxWidth: "none" }}
        />
        <div className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">Before</div>
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">After</div>
      <div
        className="absolute inset-y-0 w-0.5 bg-accent shadow-[0_0_20px_oklch(0.78_0.13_80)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg">
          ⇆
        </div>
      </div>
    </div>
  );
}
