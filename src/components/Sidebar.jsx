import { Asterisk, FolderClosed, LayoutGrid, Library, PanelLeft, Search, SquarePen } from "lucide-react";
import { RECENTS } from "../data.js";
import { Kbd, ModeIcon } from "./ui.jsx";

const NAV = [
  { id: "new", label: "New chat", icon: SquarePen },
  { id: "search", label: "Search", icon: Search, kbd: "⌘K" },
  { id: "library", label: "Library", icon: Library },
  { id: "templates", label: "Templates", icon: LayoutGrid, badge: "New" },
];

const PROJECTS = ["Brewline", "Marketing Q3", "Personal"];

export default function Sidebar({ onNewChat, onCollapse, activeRecent }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="brand">
          <Asterisk size={20} strokeWidth={2.4} />
          A1 Office
        </span>
        <button className="icon-btn" aria-label="Collapse sidebar" onClick={onCollapse}>
          <PanelLeft size={16} strokeWidth={1.75} />
        </button>
      </div>

      <nav className="side-nav">
        {NAV.map(({ id, label, icon: Icon, kbd, badge }) => (
          <button key={id} className="side-item" data-active={id === "new" && !activeRecent ? true : undefined} onClick={id === "new" ? onNewChat : undefined}>
            <Icon size={15} strokeWidth={1.75} />
            <span>{label}</span>
            {kbd && <Kbd>{kbd}</Kbd>}
            {badge && <span className="badge-new">{badge}</span>}
          </button>
        ))}
      </nav>

      <div className="side-group">
        <div className="side-label">Create</div>
        {["doc", "pdf", "slides"].map((m) => (
          <button key={m} className="side-item">
            <ModeIcon mode={m} size={16} />
            <span>{{ doc: "Docs", pdf: "PDFs", slides: "Presentations" }[m]}</span>
          </button>
        ))}
      </div>

      <div className="side-group">
        <div className="side-label">Projects</div>
        {PROJECTS.map((p) => (
          <button key={p} className="side-item">
            <FolderClosed size={15} strokeWidth={1.75} />
            <span>{p}</span>
          </button>
        ))}
      </div>

      <div className="side-group grow">
        <div className="side-label">Recents</div>
        {RECENTS.map((r) => (
          <button key={r} className="side-item plain" data-active={r === activeRecent || undefined}>
            <span>{r}</span>
          </button>
        ))}
      </div>

      <div className="side-foot">
        <div className="plan-card">
          <div className="plan-title">Brand kit</div>
          <div className="plan-sub">Fonts, colours and logo applied to everything you create.</div>
          <div className="plan-swatches">
            {["#0b0b0f", "#2f6fed", "#f4f4f6", "#ea580c"].map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
            <span>Set up</span>
          </div>
        </div>
        <div className="account">
          <span className="avatar">A</span>
          <span className="account-name">My workspace</span>
          <span className="plan-pill">Free</span>
        </div>
      </div>
    </aside>
  );
}
