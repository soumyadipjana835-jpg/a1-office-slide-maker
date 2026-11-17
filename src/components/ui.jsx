import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileSpreadsheet, FileText, FileType2, Presentation } from "lucide-react";
import { MODES } from "../data.js";
import { useTokens } from "../tokens.jsx";

const MODE_GLYPH = { doc: FileText, pdf: FileType2, slides: Presentation };

// Rounded app tile with the mode's gradient, as in the original composer.
export function ModeIcon({ mode, size = 20 }) {
  const m = MODES[mode];
  const Glyph = MODE_GLYPH[mode];
  return (
    <span
      className="mode-icon"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: `linear-gradient(180deg, ${m.gradient[0]}, ${m.gradient[1]})`,
      }}
    >
      <Glyph size={size * 0.56} strokeWidth={2.2} color="#fff" />
    </span>
  );
}

// File glyph for attachment chips: tinted per type, image files show a swatch.
export function FileGlyph({ file, size = 16 }) {
  if (file.kind === "image") {
    return <span className="file-swatch" style={{ width: size, height: size, background: file.swatch }} />;
  }
  if (file.kind === "sheet") return <FileSpreadsheet size={size} strokeWidth={1.75} color="#16a34a" />;
  if (file.kind === "slide") return <ModeIcon mode="slides" size={size} />;
  return <FileType2 size={size} strokeWidth={1.75} color="#dc2626" />;
}

// Signal-strength bars, like the effort picker in Codex.
export function EffortBars({ level, max = 4 }) {
  return (
    <span className="effort-bars" aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} style={{ height: 4 + i * 2.5 }} data-on={i < level} />
      ))}
    </span>
  );
}

export function Kbd({ children }) {
  return <kbd className="kbd">{children}</kbd>;
}

// Click-to-open menu anchored to its trigger. Closes on outside click or Escape.
export function Popover({ trigger, children, align = "start", side = "top", width = 260 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { spring } = useTokens();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="popover-anchor" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            className="popover"
            data-side={side}
            data-align={align}
            style={{ width }}
            initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "top" ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={spring}
          >
            {typeof children === "function" ? children(close) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuLabel({ children }) {
  return <div className="menu-label">{children}</div>;
}

export function MenuItem({ selected, onClick, icon, label, hint, trailing }) {
  return (
    <button className="menu-item" data-selected={selected || undefined} onClick={onClick}>
      {icon && <span className="menu-item-icon">{icon}</span>}
      <span className="menu-item-text">
        <span className="menu-item-label">{label}</span>
        {hint && <span className="menu-item-hint">{hint}</span>}
      </span>
      {trailing}
    </button>
  );
}
