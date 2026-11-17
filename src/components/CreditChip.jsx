import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import avatar from "../assets/soumyadip.png";

// 9×8 pixel heart. "1" = filled cell.
const GRID = [
  "011000110",
  "111101111",
  "111111111",
  "111111111",
  "011111110",
  "001111100",
  "000111000",
  "000010000",
];
const filled = (r, c) => GRID[r]?.[c] === "1";
const CELLS = GRID.flatMap((row, r) =>
  [...row].flatMap((v, c) => {
    if (v !== "1") return [];
    const edge = !filled(r - 1, c) || !filled(r + 1, c) || !filled(r, c - 1) || !filled(r, c + 1);
    return [{ r, c, edge }];
  })
);

function PixelHeart({ liked }) {
  return (
    <svg viewBox="0 0 9 8" width="18" height="16" shapeRendering="crispEdges" aria-hidden>
      {CELLS.map(({ r, c, edge }) =>
        liked || edge ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" /> : null
      )}
      {liked && <rect x="1" y="1" width="1" height="1" fill="#fff" opacity="0.75" />}
    </svg>
  );
}

const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(a) * 19, y: Math.sin(a) * 19, big: i % 2 === 0 };
});

const SEEN = "a1-credit-seen";
const wasSeen = () => {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    localStorage.setItem(SEEN, "1");
  } catch {}
};

const rand = (a, b) => a + Math.random() * (b - a);

export default function CreditChip() {
  const [taps, setTaps] = useState(0); // session-only, drives the animations
  const [flyers, setFlyers] = useState([]);
  const nextId = useRef(0);
  const reduce = useReducedMotion();
  const liked = taps > 0;

  // First-visit nudge: a soft heartbeat and a small hint, once, then never again.
  const [hint, setHint] = useState(false);
  const dismiss = () => {
    setHint(false);
    markSeen();
  };
  useEffect(() => {
    if (wasSeen()) return;
    const show = setTimeout(() => setHint(true), 3200);
    const hide = setTimeout(dismiss, 9500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const like = () => {
    dismiss();
    setTaps((n) => n + 1);
    if (reduce) return;
    const id = nextId.current++;
    setFlyers((f) => [
      ...f.slice(-14),
      { id, dx: rand(-34, 34), rot: rand(-28, 28), rise: rand(78, 120), size: rand(11, 17), soft: Math.random() > 0.55 },
    ]);
  };

  const drop = (id) => setFlyers((f) => f.filter((x) => x.id !== id));

  return (
    <motion.aside
      className="credit-chip"
      onPointerEnter={() => hint && dismiss()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", visualDuration: 0.5, bounce: 0.2, delay: 0.6 }}
    >
      <img className="credit-avatar" src={avatar} alt="Soumyadip" width="28" height="28" />
      <span className="credit-text">
        <span className="credit-eyebrow">Made by</span>
        <span className="credit-name">Soumyadip</span>
      </span>

      <motion.button
        className="credit-like"
        data-liked={liked || undefined}
        aria-label="Send a like"
        onClick={like}
        whileTap={{ scale: 0.84 }}
        transition={{ type: "spring", duration: 0.25, bounce: 0.4 }}
      >
        <motion.span
          key={`heart-${taps}`}
          className="credit-heart"
          initial={false}
          animate={
            !reduce && taps > 0
              ? { scale: [0.7, 1.3, 1] }
              : hint && !reduce
                ? { scale: [1, 1.25, 1, 1.25, 1] }
                : { scale: 1 }
          }
          transition={
            hint && taps === 0
              ? { duration: 0.9, times: [0, 0.2, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }
              : { duration: 0.4, ease: [0.2, 0.9, 0.3, 1.2] }
          }
        >
          <PixelHeart liked={liked} />
        </motion.span>

        {!reduce && liked && (
          <span key={`burst-${taps}`} className="credit-burst" aria-hidden>
            <motion.i
              className="credit-ring"
              initial={{ scale: 0.3, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            {SPARKS.map((s, i) => (
              <motion.i
                key={i}
                className="credit-spark"
                data-big={s.big || undefined}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: s.x, y: s.y, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.15, 0.8, 0.3, 1], delay: 0.02 }}
              />
            ))}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {hint && (
          <motion.span
            className="credit-hint"
            role="status"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: "spring", visualDuration: 0.4, bounce: 0.25 }}
          >
            Psst, tap the heart
          </motion.span>
        )}
      </AnimatePresence>

      <span className="credit-flyers" aria-hidden>
        {flyers.map((f) => (
          <motion.span
            key={f.id}
            className="credit-flyer"
            style={{ color: f.soft ? "#ff7a93" : "#ff3b5c", width: f.size * 1.125, height: f.size }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 0, rotate: 0 }}
            animate={{
              x: [0, f.dx * 0.35, f.dx],
              y: [0, -f.rise * 0.35, -f.rise],
              scale: [0.4, 1.15, 0.9],
              opacity: [0, 1, 0],
              rotate: [0, f.rot * 0.5, f.rot],
            }}
            transition={{ duration: 1.15, ease: "easeOut", times: [0, 0.25, 1] }}
            onAnimationComplete={() => drop(f.id)}
          >
            <svg viewBox="0 0 9 8" width="100%" height="100%" shapeRendering="crispEdges">
              {CELLS.map(({ r, c }) => (
                <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" />
              ))}
            </svg>
          </motion.span>
        ))}
      </span>
    </motion.aside>
  );
}
