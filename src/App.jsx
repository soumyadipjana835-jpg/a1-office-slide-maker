import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DialRoot, useDialKit } from "dialkit";
import { FolderClosed, PanelLeft, Share, Sparkles } from "lucide-react";
import { EFFORTS, FOLLOW_UPS, MODES, SAMPLE_FILES } from "./data.js";
import { TokensContext } from "./tokens.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Composer from "./components/Composer.jsx";
import Conversation from "./components/Conversation.jsx";
import { Hero, ModeCards, Suggestions } from "./components/EmptyState.jsx";
import CreditChip from "./components/CreditChip.jsx";

const FONTS = {
  Inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  Geist: "'Geist', ui-sans-serif, system-ui, sans-serif",
  Figtree: "'Figtree', ui-sans-serif, system-ui, sans-serif",
  System: "ui-sans-serif, system-ui, -apple-system, sans-serif",
};

const defaultOptions = (mode) => {
  const o = MODES[mode].options;
  return { size: o.size.default, count: o.count.default, tone: o.tone.default, theme: "midnight" };
};

const titleFrom = (text) => {
  const words = text.replace(/[^\w\s'-]/g, "").split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export default function App() {
  // DialKit actions call into the latest closures through this ref.
  const actions = useRef({});

  const d = useDialKit(
    "A1 Office",
    {
      colors: {
        canvas: "#ffffff",
        sidebar: "#fafafa",
        shell: "#f4f4f6",
        surface: "#ffffff",
        ink: "#0b0b0f",
        muted: "#6b6b76",
        border: "#ebebef",
        accent: "#2f6fed",
      },
      shape: {
        composerRadius: [22, 8, 32],
        chipRadius: [10, 4, 20],
        buttonRadius: [10, 4, 20],
        shadow: [0.06, 0, 0.24, 0.01],
      },
      type: {
        font: { type: "select", options: ["Inter", "Geist", "Figtree", "System"] },
        size: [14, 12, 16, 0.5],
        headline: [30, 22, 44],
      },
      layout: {
        showSidebar: true,
        contentWidth: [740, 560, 960],
        showModeCards: true,
        showSuggestions: true,
      },
      motion: { type: "spring", visualDuration: 0.32, bounce: 0.18 },
      stepSpeed: [1, 0.25, 3, 0.25],
      demo: {
        sampleChat: { type: "action" },
        addFiles: { type: "action" },
        reset: { type: "action" },
      },
    },
    {
      id: "a1-office",
      persist: true,
      onAction: (path) => actions.current[path]?.(),
    }
  );

  const [mode, setMode] = useState("slides");
  const [optionsByMode, setOptionsByMode] = useState(() => ({
    doc: defaultOptions("doc"),
    pdf: defaultOptions("pdf"),
    slides: defaultOptions("slides"),
  }));
  const [effort, setEffort] = useState("high");
  const [attachments, setAttachments] = useState([]);
  const [quote, setQuote] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [seed, setSeed] = useState(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const timers = useRef([]);
  const scrollRef = useRef(null);

  const options = optionsByMode[mode];
  const setOption = (key, value) => setOptionsByMode((all) => ({ ...all, [mode]: { ...all[mode], [key]: value } }));

  // ⌘1–3 switch the output mode.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const m = { 1: "doc", 2: "pdf", 3: "slides" }[e.key];
      if (m) {
        e.preventDefault();
        setMode(m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const addSampleFiles = () =>
    setAttachments((cur) => [...cur, ...SAMPLE_FILES.filter((f) => !cur.some((c) => c.id === f.id))]);

  const selectSlide = (i) => {
    const next = selectedSlide === i ? null : i;
    setSelectedSlide(next);
    setAttachments((list) => {
      const rest = list.filter((a) => a.kind !== "slide");
      return next === null ? rest : [...rest, { id: "slide", kind: "slide", name: `Slide ${next + 1} selected` }];
    });
  };

  // Simulated generation: each step lights up in turn, then the artifact appears.
  const send = (text, { webSearch = false } = {}) => {
    clearTimers();
    const effortItem = EFFORTS.find((e) => e.id === effort);
    const files = attachments.filter((a) => a.kind !== "slide");
    const editingSlide = selectedSlide;
    const m = MODES[mode];
    const lastArtifact = [...messages].reverse().find((x) => x.artifact)?.artifact;

    const steps = [
      ...files.map((f) => ({ label: `Reading ${f.name}` })),
      ...(webSearch ? [{ label: "Researching the web" }] : []),
      ...(editingSlide !== null
        ? [{ label: `Editing slide ${editingSlide + 1}` }, { label: "Checking it matches the deck" }]
        : [
            ...(effortItem.bars >= 3 ? [{ label: "Planning the outline" }] : []),
            { label: `Designing ${options.count} ${m.unit}` },
            ...(effortItem.bars >= 4 ? [{ label: "Reviewing every page" }] : []),
          ]),
    ].map((s, i) => ({ ...s, state: i === 0 ? "active" : "hidden" }));

    const artifact = editingSlide !== null && lastArtifact ? lastArtifact : { mode, title: titleFrom(text), ...options };

    const id = Date.now();
    const userFiles = editingSlide !== null ? [...files, { id: "slide", kind: "slide", name: `Slide ${editingSlide + 1}` }] : files;
    setMessages((cur) => [
      ...cur,
      { id: `u${id}`, role: "user", text, attachments: userFiles, quote },
      { id: `a${id}`, role: "assistant", status: "working", steps, artifact, effortLabel: effortItem.label },
    ]);
    setAttachments([]);
    setQuote(null);
    setSelectedSlide(null);
    setBusy(true);

    const update = (fn) => setMessages((cur) => cur.map((msg) => (msg.id === `a${id}` ? fn(msg) : msg)));
    const stepMs = (650 + effortItem.bars * 150) / d.stepSpeed;

    steps.forEach((_, i) => {
      timers.current.push(
        setTimeout(
          () =>
            update((msg) => ({
              ...msg,
              steps: msg.steps.map((s, j) => ({ ...s, state: j <= i ? "done" : j === i + 1 ? "active" : "hidden" })),
            })),
          stepMs * (i + 1)
        )
      );
    });

    timers.current.push(
      setTimeout(() => {
        const summary =
          editingSlide !== null
            ? [`I rebuilt slide ${editingSlide + 1} to match your request and kept the rest of the deck as it was. Type and colours still follow the ${artifact.theme} theme.`]
            : [
                `Here is your ${m.label.toLowerCase()}: ${options.count} ${m.unit} in ${options.size}, with a ${options.tone.toLowerCase()} tone and the ${artifact.theme} theme.`,
                files.length
                  ? `I pulled the key numbers from ${files.map((f) => f.name).join(" and ")} and used them as proof points. Select any sentence to ask about it.`
                  : "Select any sentence to ask about it, or click a slide to change only that slide.",
              ];
        update((msg) => ({
          ...msg,
          status: "done",
          steps: msg.steps.map((s) => ({ ...s, state: "done" })),
          summary,
          seconds: Math.round((stepMs * (steps.length + 1)) / 100) / 10,
          followUps: FOLLOW_UPS,
        }));
        setBusy(false);
      }, stepMs * (steps.length + 1))
    );
  };

  const reset = () => {
    clearTimers();
    setMessages([]);
    setAttachments([]);
    setQuote(null);
    setSelectedSlide(null);
    setBusy(false);
  };

  actions.current = {
    "demo.reset": reset,
    "demo.addFiles": addSampleFiles,
    "demo.sampleChat": () => {
      reset();
      setMode("slides");
      setAttachments(SAMPLE_FILES.slice(0, 2));
      setTimeout(() => actions.current.sendSample(), 60);
    },
    sendSample: () => send("A 10-slide seed pitch for Brewline using my notes and moodboard"),
  };

  const tokens = useMemo(() => ({ spring: d.motion }), [d.motion]);
  const showSidebar = d.layout.showSidebar && !sidebarHidden;
  const empty = messages.length === 0;
  const c = d.colors;

  const cssVars = {
    "--canvas": c.canvas,
    "--sidebar": c.sidebar,
    "--shell": c.shell,
    "--surface": c.surface,
    "--ink": c.ink,
    "--muted": c.muted,
    "--border": c.border,
    "--accent": c.accent,
    "--r-composer": `${d.shape.composerRadius}px`,
    "--r-chip": `${d.shape.chipRadius}px`,
    "--r-btn": `${d.shape.buttonRadius}px`,
    "--shadow-a": d.shape.shadow,
    "--font": FONTS[d.type.font],
    "--fs": `${d.type.size}px`,
    "--headline": `${d.type.headline}px`,
    "--content": `${d.layout.contentWidth}px`,
  };

  const composer = (
    <Composer
      mode={mode}
      setMode={setMode}
      options={options}
      setOption={setOption}
      effort={effort}
      setEffort={setEffort}
      attachments={attachments}
      onRemoveAttachment={(fid) => {
        if (fid === "slide") setSelectedSlide(null);
        setAttachments((cur) => cur.filter((a) => a.id !== fid));
      }}
      onAddSamples={addSampleFiles}
      quote={quote}
      onClearQuote={() => setQuote(null)}
      onSend={send}
      busy={busy}
      seed={seed}
      placeholder={empty ? `Describe the ${MODES[mode].label.toLowerCase()} you want to make…` : "Ask for changes, or describe something new…"}
      footer={
        empty && (
          <>
            <span className="footer-item">
              <FolderClosed size={14} strokeWidth={1.75} /> No project
            </span>
            <span className="footer-item">
              <Sparkles size={14} strokeWidth={1.75} /> Brand kit off
            </span>
            <span className="spacer" />
            <span className="footer-note">Enter to send · Shift+Enter for a new line</span>
          </>
        )
      }
    />
  );

  return (
    <TokensContext.Provider value={tokens}>
      <div className="app" style={cssVars}>
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.div
              className="sidebar-wrap"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 248, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={d.motion}
            >
              <Sidebar onNewChat={reset} onCollapse={() => setSidebarHidden(true)} activeRecent={empty ? null : "Brewline seed deck"} />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="main">
          <header className="topbar">
            {!showSidebar && (
              <button className="icon-btn" aria-label="Show sidebar" onClick={() => setSidebarHidden(false)}>
                <PanelLeft size={16} strokeWidth={1.75} />
              </button>
            )}
            <span className="topbar-title">{empty ? "New chat" : titleFrom(messages[0].text)}</span>
            <span className="spacer" />
            {!empty && (
              <button className="ghost-btn">
                <Share size={14} strokeWidth={1.75} /> Share
              </button>
            )}
          </header>

          {empty ? (
            <div className="home">
              <div className="column">
                <Hero mode={mode} />
                {composer}
                {d.layout.showModeCards && <ModeCards mode={mode} setMode={setMode} />}
                {d.layout.showSuggestions && (
                  <Suggestions
                    onPick={(s) => {
                      setMode(s.mode);
                      setSeed({ text: s.text, n: Date.now() });
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="scroll" ref={scrollRef}>
                <div className="column">
                  <Conversation
                    messages={messages}
                    selectedSlide={selectedSlide}
                    onSelectSlide={selectSlide}
                    onQuote={setQuote}
                    onFollowUp={(f) => setSeed({ text: f, n: Date.now() })}
                  />
                </div>
              </div>
              <div className="dock">
                <div className="column">{composer}</div>
              </div>
            </>
          )}
        </main>
        <DialRoot position="top-right" defaultOpen={false} />
        <CreditChip />
      </div>
    </TokensContext.Provider>
  );
}
