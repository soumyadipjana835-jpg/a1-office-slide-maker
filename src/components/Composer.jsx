import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  AudioLines,
  Check,
  ChevronDown,
  CornerDownRight,
  Globe,
  Link,
  ListOrdered,
  Mic,
  Minus,
  Palette,
  Paperclip,
  Plus,
  RectangleHorizontal,
  Sparkles,
  Square,
  Type,
  X,
} from "lucide-react";
import { EFFORTS, MODES, THEMES } from "../data.js";
import { useTokens } from "../tokens.jsx";
import { EffortBars, FileGlyph, Kbd, MenuItem, MenuLabel, ModeIcon, Popover } from "./ui.jsx";

const RATIO_BOX = { "16:9": [16, 9], "4:3": [14, 10.5], "1:1": [11, 11], "9:16": [8, 14], A4: [9.5, 13], Letter: [10, 13], Legal: [9, 15], A5: [9, 12.5] };

function RatioGlyph({ value }) {
  const [w, h] = RATIO_BOX[value] ?? [12, 12];
  return <span className="ratio-glyph" style={{ width: w, height: h }} />;
}

export default function Composer({
  mode,
  setMode,
  options,
  setOption,
  effort,
  setEffort,
  attachments,
  onRemoveAttachment,
  onAddSamples,
  quote,
  onClearQuote,
  onSend,
  busy,
  placeholder,
  footer,
  seed,
}) {
  const [text, setText] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [hovered, setHovered] = useState(null);
  const inputRef = useRef(null);
  const { spring } = useTokens();

  // A picked suggestion or follow-up drops its text into the input.
  useEffect(() => {
    if (!seed) return;
    setText(seed.text);
    inputRef.current?.focus();
  }, [seed]);

  const m = MODES[mode];
  const editing = attachments.some((a) => a.kind === "slide");
  const effortItem = EFFORTS.find((e) => e.id === effort);
  const theme = THEMES.find((t) => t.id === options.theme);
  const canSend = text.trim().length > 0 && !busy;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim(), { webSearch });
    setText("");
  };

  return (
    <div className="composer-shell">
      <AnimatePresence initial={false}>
        {attachments.length > 0 && (
          <motion.div
            className="chip-row"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={spring}
          >
            <div className="chip-row-inner">
              <AnimatePresence initial={false}>
                {attachments.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    className="chip"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                    transition={spring}
                    onMouseEnter={() => file.summary && setHovered(file.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <FileGlyph file={file} />
                    <span className="chip-name">{file.name}</span>
                    <button className="chip-x" aria-label={`Remove ${file.name}`} onClick={() => onRemoveAttachment(file.id)}>
                      <X size={13} strokeWidth={2} />
                    </button>
                    <AnimatePresence>
                      {hovered === file.id && <FilePreview file={file} />}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="composer">
        <AnimatePresence initial={false}>
          {quote && (
            <motion.div
              className="quote-chip"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={spring}
            >
              <CornerDownRight size={14} strokeWidth={1.75} />
              <span className="quote-text">{quote}</span>
              <button className="icon-btn sm" aria-label="Remove quote" onClick={onClearQuote}>
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={inputRef}
          className="composer-input"
          rows={2}
          value={text}
          placeholder={editing ? "Describe the change to the selected slide…" : placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <div className="toolbar">
          <Popover
            width={240}
            trigger={({ toggle, open }) => (
              <button className="circle-btn" data-open={open || undefined} aria-label="Add" onClick={toggle}>
                <Plus size={16} strokeWidth={1.75} />
              </button>
            )}
          >
            {(close) => (
              <>
                <MenuItem icon={<Paperclip size={15} />} label="Upload files" hint="PDF, images, sheets, slides" onClick={() => { onAddSamples(); close(); }} />
                <MenuItem icon={<Link size={15} />} label="Add a link" hint="Web page or Google Doc" onClick={close} />
                <MenuItem icon={<Type size={15} />} label="Paste brand kit" hint="Fonts, colours, logo" onClick={close} />
              </>
            )}
          </Popover>

          <Popover
            width={248}
            trigger={({ toggle, open }) => (
              <button className="mode-btn" data-open={open || undefined} onClick={toggle}>
                <ModeIcon mode={mode} />
                <span>{m.label}</span>
                <ChevronDown size={14} strokeWidth={2} className="chev" />
              </button>
            )}
          >
            {(close) => (
              <>
                <MenuLabel>Create a</MenuLabel>
                {Object.values(MODES).map((item, i) => (
                  <MenuItem
                    key={item.id}
                    selected={item.id === mode}
                    icon={<ModeIcon mode={item.id} size={22} />}
                    label={item.label}
                    hint={item.hint}
                    trailing={<Kbd>⌘{i + 1}</Kbd>}
                    onClick={() => { setMode(item.id); close(); }}
                  />
                ))}
              </>
            )}
          </Popover>

          <div className="toolbar-divider" />

          <OptionMenu
            icon={<RectangleHorizontal size={15} strokeWidth={1.75} />}
            value={options.size}
            title={m.options.size.label}
          >
            {(close) =>
              m.options.size.values.map((v) => (
                <MenuItem
                  key={v}
                  selected={v === options.size}
                  icon={<span className="ratio-cell"><RatioGlyph value={v} /></span>}
                  label={v}
                  trailing={v === options.size && <Check size={14} />}
                  onClick={() => { setOption("size", v); close(); }}
                />
              ))
            }
          </OptionMenu>

          <OptionMenu icon={<ListOrdered size={15} strokeWidth={1.75} />} value={options.count} title={m.unit} width={220}>
            {() => (
              <div className="stepper">
                <span className="stepper-label">{m.unit}</span>
                <div className="stepper-ctrl">
                  <button className="icon-btn" aria-label="Fewer" onClick={() => setOption("count", Math.max(m.options.count.min, options.count - 1))}>
                    <Minus size={14} />
                  </button>
                  <span className="stepper-value">{options.count}</span>
                  <button className="icon-btn" aria-label="More" onClick={() => setOption("count", Math.min(m.options.count.max, options.count + 1))}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </OptionMenu>

          <OptionMenu
            icon={<span className="theme-dot" style={{ background: theme.bg, boxShadow: `inset 0 0 0 1px rgba(0,0,0,.12), inset -4px 0 0 ${theme.accent}` }} />}
            value={theme.label}
            title="Theme"
          >
            {(close) =>
              THEMES.map((t) => (
                <MenuItem
                  key={t.id}
                  selected={t.id === options.theme}
                  icon={<span className="theme-swatch" style={{ background: t.bg, color: t.fg }}><i style={{ background: t.accent }} />Aa</span>}
                  label={t.label}
                  trailing={t.id === options.theme && <Check size={14} />}
                  onClick={() => { setOption("theme", t.id); close(); }}
                />
              ))
            }
          </OptionMenu>

          <OptionMenu icon={<Palette size={15} strokeWidth={1.75} />} value={options.tone} title={m.options.tone.label} hideOnNarrow>
            {(close) =>
              m.options.tone.values.map((v) => (
                <MenuItem
                  key={v}
                  selected={v === options.tone}
                  label={v}
                  trailing={v === options.tone && <Check size={14} />}
                  onClick={() => { setOption("tone", v); close(); }}
                />
              ))
            }
          </OptionMenu>

          <div className="spacer" />

          <button
            className="ghost-btn web-toggle"
            data-on={webSearch || undefined}
            aria-pressed={webSearch}
            title="Research the web"
            onClick={() => setWebSearch((v) => !v)}
          >
            <Globe size={15} strokeWidth={1.75} />
          </button>

          <Popover
            align="end"
            width={272}
            trigger={({ toggle, open }) => (
              <button className="effort-btn" data-open={open || undefined} onClick={toggle}>
                <EffortBars level={effortItem.bars} />
                <span>{effortItem.label}</span>
              </button>
            )}
          >
            {(close) => (
              <>
                <MenuLabel>Effort</MenuLabel>
                {EFFORTS.map((e) => (
                  <MenuItem
                    key={e.id}
                    selected={e.id === effort}
                    icon={<EffortBars level={e.bars} />}
                    label={e.label}
                    hint={e.hint}
                    trailing={e.id === effort && <Check size={14} />}
                    onClick={() => { setEffort(e.id); close(); }}
                  />
                ))}
              </>
            )}
          </Popover>

          <button className="ghost-btn" aria-label="Dictate">
            <Mic size={16} strokeWidth={1.75} />
          </button>

          <motion.button
            className="send-btn"
            data-label={editing || undefined}
            data-ready={canSend || busy || undefined}
            onClick={submit}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            aria-label={editing ? "Update" : "Send"}
          >
            {busy ? (
              <Square size={11} fill="currentColor" />
            ) : editing ? (
              <>
                <Sparkles size={14} strokeWidth={2} />
                <span>Update</span>
              </>
            ) : text ? (
              <ArrowUp size={17} strokeWidth={2.2} />
            ) : (
              <AudioLines size={17} strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </div>

      {footer && <div className="composer-footer">{footer}</div>}
    </div>
  );
}

function OptionMenu({ icon, value, title, children, width = 200, hideOnNarrow }) {
  return (
    <Popover
      width={width}
      trigger={({ toggle, open }) => (
        <button className="option-btn" data-open={open || undefined} data-narrow-hide={hideOnNarrow || undefined} onClick={toggle} title={title}>
          {icon}
          <span>{value}</span>
        </button>
      )}
    >
      {(close) => (
        <>
          <MenuLabel>{title}</MenuLabel>
          {children(close)}
        </>
      )}
    </Popover>
  );
}

function FilePreview({ file }) {
  const { spring } = useTokens();
  return (
    <motion.div
      className="file-preview"
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -2, transition: { duration: 0.1 } }}
      transition={spring}
    >
      <div className="fp-name">{file.name}</div>
      <div className="fp-meta">
        <FileGlyph file={file} size={13} />
        {file.meta.map((part, i) => (
          <span key={part}>
            {i > 0 && <i className="dot">•</i>}
            {part}
          </span>
        ))}
      </div>
      <div className="fp-card">
        <div className="fp-ai">
          <Sparkles size={11} strokeWidth={2} /> Summary by AI
        </div>
        <div className="fp-title">{file.summaryTitle}</div>
        {file.summary.map((p, i) => (
          <p key={i} className={/^\d+\./.test(p) ? "fp-section" : undefined}>
            {p}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
