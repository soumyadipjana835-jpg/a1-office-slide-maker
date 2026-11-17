import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Asterisk,
  Check,
  ChevronDown,
  Copy,
  Download,
  Maximize2,
  MessageSquareQuote,
  RotateCcw,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { DECK_SLIDES, MODES, THEMES } from "../data.js";
import { useTokens } from "../tokens.jsx";
import { FileGlyph, ModeIcon, Popover, MenuItem } from "./ui.jsx";

const ASPECT = { "16:9": "16 / 9", "4:3": "4 / 3", "1:1": "1 / 1", "9:16": "9 / 16", A4: "1 / 1.414", Letter: "1 / 1.294", Legal: "1 / 1.647", A5: "1 / 1.414" };

export default function Conversation({ messages, selectedSlide, onSelectSlide, onQuote, onFollowUp }) {
  return (
    <div className="thread">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <UserMessage key={msg.id} msg={msg} />
        ) : (
          <AssistantMessage
            key={msg.id}
            msg={msg}
            selectedSlide={selectedSlide}
            onSelectSlide={onSelectSlide}
            onQuote={onQuote}
            onFollowUp={onFollowUp}
          />
        )
      )}
    </div>
  );
}

function UserMessage({ msg }) {
  const { spring } = useTokens();
  return (
    <motion.div className="user-msg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      {msg.attachments.length > 0 && (
        <div className="user-files">
          {msg.attachments.map((f) => (
            <span key={f.id} className="user-file">
              <FileGlyph file={f} size={14} />
              {f.name}
            </span>
          ))}
        </div>
      )}
      {msg.quote && (
        <div className="user-quote">
          <MessageSquareQuote size={13} strokeWidth={1.75} />
          {msg.quote}
        </div>
      )}
      <div className="user-bubble">{msg.text}</div>
    </motion.div>
  );
}

function AssistantMessage({ msg, selectedSlide, onSelectSlide, onQuote, onFollowUp }) {
  const { spring } = useTokens();
  const bodyRef = useRef(null);
  const [reply, setReply] = useState(null);

  const onMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || !bodyRef.current?.contains(sel.anchorNode)) return setReply(null);
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const host = bodyRef.current.getBoundingClientRect();
    setReply({ text, x: rect.left - host.left + rect.width / 2, y: rect.top - host.top });
  };

  const done = msg.status === "done";

  return (
    <motion.div className="ai-msg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      <div className="ai-avatar">
        <Asterisk size={16} strokeWidth={2.4} />
      </div>
      <div className="ai-body">
        <Steps steps={msg.steps} done={done} />

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
              <div className="ai-text" ref={bodyRef} onMouseUp={onMouseUp}>
                {msg.summary.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <AnimatePresence>
                  {reply && (
                    <motion.button
                      className="reply-pop"
                      style={{ left: reply.x, top: reply.y }}
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={spring}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onQuote(reply.text);
                        setReply(null);
                        window.getSelection()?.removeAllRanges();
                      }}
                    >
                      <MessageSquareQuote size={13} strokeWidth={2} /> Reply
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Artifact artifact={msg.artifact} selectedSlide={selectedSlide} onSelectSlide={onSelectSlide} />

              <div className="ai-actions">
                {[Copy, RotateCcw, ThumbsUp, ThumbsDown].map((Icon, i) => (
                  <button key={i} className="icon-btn">
                    <Icon size={14} strokeWidth={1.75} />
                  </button>
                ))}
                <span className="ai-meta">
                  {msg.effortLabel} effort · {msg.seconds}s
                </span>
              </div>

              {msg.followUps && (
                <div className="follow-ups">
                  {msg.followUps.map((f) => (
                    <button key={f} className="follow-up" onClick={() => onFollowUp(f)}>
                      <ArrowRight size={14} strokeWidth={1.75} />
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Steps({ steps, done }) {
  const [open, setOpen] = useState(true);
  const shown = steps.filter((s) => s.state !== "hidden");
  const active = shown.find((s) => s.state === "active");
  return (
    <div className="steps">
      <button className="steps-head" onClick={() => setOpen((o) => !o)}>
        <span className={done ? "" : "shimmer"}>{done ? `Worked through ${shown.length} steps` : active?.label ?? "Finishing up"}</span>
        <ChevronDown size={14} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            className="steps-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {shown.map((s) => (
              <motion.li key={s.label} data-state={s.state} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
                <span className="step-dot">{s.state === "done" ? <Check size={10} strokeWidth={3} /> : null}</span>
                {s.label}
              </motion.li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

function Artifact({ artifact, selectedSlide, onSelectSlide }) {
  const { spring } = useTokens();
  const theme = THEMES.find((t) => t.id === artifact.theme);
  const m = MODES[artifact.mode];
  const isSlides = artifact.mode === "slides";
  const items = isSlides ? DECK_SLIDES.slice(0, artifact.count) : Array.from({ length: Math.min(artifact.count, 4) }, (_, i) => i);

  return (
    <div className="artifact">
      <div className="artifact-head">
        <ModeIcon mode={artifact.mode} size={28} />
        <div className="artifact-title">
          <span>{artifact.title}</span>
          <span className="artifact-meta">
            {artifact.count} {m.unit} · {artifact.size} · {theme.label}
          </span>
        </div>
        <div className="spacer" />
        <button className="ghost-btn">
          <Share size={14} strokeWidth={1.75} /> Share
        </button>
        <Popover
          side="bottom"
          align="end"
          width={210}
          trigger={({ toggle, open }) => (
            <button className="dark-btn" data-open={open || undefined} onClick={toggle}>
              <Download size={14} strokeWidth={2} /> Export
            </button>
          )}
        >
          {(close) =>
            (isSlides ? ["PowerPoint (.pptx)", "PDF", "Google Slides", "Images (.png)"] : ["Word (.docx)", "PDF", "Google Docs", "Markdown"]).map((f) => (
              <MenuItem key={f} label={f} onClick={close} />
            ))
          }
        </Popover>
      </div>

      <div className={isSlides ? "slide-grid" : "page-row"} data-ratio={artifact.size}>
        {items.map((item, i) => (
          <motion.button
            key={i}
            className="thumb"
            data-selected={isSlides && selectedSlide === i ? true : undefined}
            style={{ aspectRatio: ASPECT[artifact.size], background: theme.bg, color: theme.fg }}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: i * 0.04 }}
            onClick={() => isSlides && onSelectSlide(i)}
          >
            {isSlides ? <SlideArt slide={item} theme={theme} portrait={artifact.size === "9:16"} /> : <PageArt index={i} theme={theme} title={artifact.title} />}
            <span className="thumb-num">{i + 1}</span>
            {isSlides && (
              <span className="thumb-expand">
                <Maximize2 size={11} />
              </span>
            )}
          </motion.button>
        ))}
      </div>
      {isSlides && <div className="artifact-hint">Click a slide to edit just that slide.</div>}
    </div>
  );
}

function SlideArt({ slide, theme, portrait }) {
  return (
    <span className="slide-art" data-layout={slide.layout} data-portrait={portrait || undefined}>
      <span className="sa-kicker" style={{ color: theme.accent }}>{slide.kicker}</span>
      <span className="sa-title">{slide.title}</span>
      {slide.layout === "stat" && <span className="sa-stat" style={{ color: theme.accent }}>{slide.title.match(/[\d$,.%MB]+/)?.[0]}</span>}
      {slide.layout === "chart" && (
        <span className="sa-chart">
          {[30, 45, 40, 62, 75, 90].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, background: theme.accent, opacity: 0.35 + i * 0.12 }} />
          ))}
        </span>
      )}
      {slide.layout === "cards" && (
        <span className="sa-cards">
          {[0, 1, 2].map((i) => (
            <i key={i} style={{ borderColor: theme.accent }} />
          ))}
        </span>
      )}
      {slide.layout === "split" && <span className="sa-split" style={{ background: theme.accent }} />}
    </span>
  );
}

function PageArt({ index, theme, title }) {
  return (
    <span className="page-art">
      {index === 0 ? (
        <>
          <span className="pa-kicker" style={{ color: theme.accent }}>Report</span>
          <span className="pa-title">{title}</span>
        </>
      ) : (
        <span className="pa-h" />
      )}
      {Array.from({ length: index === 0 ? 5 : 9 }, (_, i) => (
        <span key={i} className="pa-line" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
      ))}
      {index === 1 && (
        <span className="sa-chart pa-chart">
          {[40, 55, 48, 70, 82].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, background: theme.accent }} />
          ))}
        </span>
      )}
    </span>
  );
}
