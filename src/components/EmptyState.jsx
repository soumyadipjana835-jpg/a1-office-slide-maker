import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import * as Icons from "lucide-react";
import { MODES, SUGGESTION_TABS, SUGGESTIONS } from "../data.js";
import { useTokens } from "../tokens.jsx";
import { ModeIcon } from "./ui.jsx";

const HEADLINE = {
  doc: ["Turn your ", "notes", " into ", "documents"],
  pdf: ["Turn your ", "ideas", " into ", "polished PDFs"],
  slides: ["Turn your ", "ideas", " into ", "presentations"],
};

export function Hero({ mode }) {
  const [a, b, c, d] = HEADLINE[mode];
  return (
    <div className="hero">
      <Icons.Asterisk className="hero-mark" size={28} strokeWidth={2.4} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={mode}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.22 }}
        >
          {a}
          <strong>{b}</strong>
          {c}
          <strong>{d}</strong>
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

export function ModeCards({ mode, setMode }) {
  const { spring } = useTokens();
  return (
    <div className="mode-cards">
      {Object.values(MODES).map((m) => (
        <motion.button
          key={m.id}
          className="mode-card"
          data-active={m.id === mode || undefined}
          onClick={() => setMode(m.id)}
          whileHover={{ y: -2 }}
          transition={spring}
        >
          <ModeIcon mode={m.id} size={24} />
          <span className="mode-card-title">{m.label}</span>
          <span className="mode-card-hint">{m.hint}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function Suggestions({ onPick }) {
  const [tab, setTab] = useState("suggested");
  const { spring } = useTokens();
  return (
    <div className="suggest">
      <div className="suggest-tabs">
        {SUGGESTION_TABS.map((t) => {
          const Icon = Icons[t.icon];
          return (
            <button key={t.id} className="suggest-tab" data-active={t.id === tab || undefined} onClick={() => setTab(t.id)}>
              {t.id === tab && <motion.span layoutId="suggest-tab-bg" className="suggest-tab-bg" transition={spring} />}
              <Icon size={15} strokeWidth={1.75} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={tab}
          className="suggest-list"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
        >
          {SUGGESTIONS[tab].map((s) => {
            const Icon = Icons[s.icon];
            return (
              <li key={s.text}>
                <button className="suggest-row" onClick={() => onPick(s)}>
                  <Icon size={15} strokeWidth={1.75} />
                  <span>{s.text}</span>
                  <Icons.ArrowRight className="suggest-arrow" size={16} strokeWidth={1.75} />
                </button>
              </li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
