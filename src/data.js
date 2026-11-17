// Static content for the A1 Office chat prototype.

export const MODES = {
  doc: {
    id: "doc",
    label: "Doc",
    hint: "Reports, briefs, proposals",
    gradient: ["#60a5fa", "#2563eb"],
    unit: "pages",
    options: {
      size: { label: "Page", values: ["A4", "Letter", "Legal"], default: "A4" },
      count: { min: 1, max: 40, default: 4 },
      tone: { label: "Tone", values: ["Professional", "Friendly", "Academic", "Persuasive"], default: "Professional" },
    },
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    hint: "Print-ready, fixed layout",
    gradient: ["#f87171", "#dc2626"],
    unit: "pages",
    options: {
      size: { label: "Page", values: ["A4", "Letter", "A5"], default: "A4" },
      count: { min: 1, max: 40, default: 6 },
      tone: { label: "Layout", values: ["Report", "Brochure", "One-pager", "Résumé"], default: "Report" },
    },
  },
  slides: {
    id: "slides",
    label: "Slides",
    hint: "Decks for any screen",
    gradient: ["#fb923c", "#ea580c"],
    unit: "slides",
    options: {
      size: { label: "Ratio", values: ["16:9", "4:3", "1:1", "9:16"], default: "16:9" },
      count: { min: 3, max: 30, default: 10 },
      tone: { label: "Tone", values: ["Pitch", "Teaching", "Report", "Story"], default: "Pitch" },
    },
  },
};

export const EFFORTS = [
  { id: "low", label: "Low", bars: 1, hint: "Fast draft, light polish" },
  { id: "medium", label: "Medium", bars: 2, hint: "Balanced speed and quality" },
  { id: "high", label: "High", bars: 3, hint: "Researches, plans an outline first" },
  { id: "max", label: "Max", bars: 4, hint: "Deep research, self-reviews every page" },
];

export const THEMES = [
  { id: "midnight", label: "Midnight", bg: "#0f1021", fg: "#f4f4ff", accent: "#8b8cff" },
  { id: "paper", label: "Paper", bg: "#fbfaf7", fg: "#1b1b1f", accent: "#e2572c" },
  { id: "sand", label: "Sand", bg: "#efe6d8", fg: "#2b2117", accent: "#9a6b3c" },
  { id: "forest", label: "Forest", bg: "#13261f", fg: "#eaf4ee", accent: "#7ed3a4" },
  { id: "mono", label: "Mono", bg: "#ffffff", fg: "#0b0b0f", accent: "#0b0b0f" },
];

export const SUGGESTION_TABS = [
  { id: "suggested", label: "Suggested", icon: "Lightbulb" },
  { id: "pitch", label: "Pitch", icon: "Presentation" },
  { id: "report", label: "Report", icon: "FileText" },
  { id: "learn", label: "Teaching", icon: "BookOpen" },
  { id: "personal", label: "Personal", icon: "Star" },
];

export const SUGGESTIONS = {
  suggested: [
    { icon: "Presentation", mode: "slides", text: "A 10-slide investor pitch for a specialty coffee subscription." },
    { icon: "FileText", mode: "doc", text: "A quarterly marketing report with charts from my spreadsheet." },
    { icon: "FileType2", mode: "pdf", text: "A one-page product brochure for a skincare launch." },
  ],
  pitch: [
    { icon: "Presentation", mode: "slides", text: "Seed round deck: problem, solution, traction, ask." },
    { icon: "Presentation", mode: "slides", text: "Sales deck that turns these case studies into proof points." },
    { icon: "Presentation", mode: "slides", text: "Product launch keynote with a bold, minimal style." },
  ],
  report: [
    { icon: "FileText", mode: "doc", text: "Summarise the attached meeting notes into a decision memo." },
    { icon: "FileType2", mode: "pdf", text: "Annual impact report with an executive summary up front." },
    { icon: "FileText", mode: "doc", text: "Competitive analysis of three note-taking apps." },
  ],
  learn: [
    { icon: "Presentation", mode: "slides", text: "A 6-slide lesson on photosynthesis for 12-year-olds." },
    { icon: "FileText", mode: "doc", text: "A study guide with practice questions from this PDF." },
    { icon: "Presentation", mode: "slides", text: "Onboarding course for new support agents." },
  ],
  personal: [
    { icon: "FileType2", mode: "pdf", text: "A clean, one-page résumé from my LinkedIn profile." },
    { icon: "FileText", mode: "doc", text: "A two-week trip plan for Japan in spring." },
    { icon: "FileType2", mode: "pdf", text: "Wedding menu cards in a soft, editorial style." },
  ],
};

export const SAMPLE_FILES = [
  {
    id: "f1",
    kind: "pdf",
    name: "brewline-notes.pdf",
    meta: ["PDF", "2.3MB", "12 PAGES"],
    summaryTitle: "Brewline kickoff notes",
    summary: [
      "Brewline is a monthly specialty-coffee subscription aimed at home baristas. The team agreed to raise a seed round in Q1 and to lead with retention numbers.",
      "1. Traction",
      "4,200 active subscribers, 92% month-two retention, average order value of $34.",
    ],
  },
  {
    id: "f2",
    kind: "image",
    name: "moodboard.png",
    meta: ["PNG", "1.1MB", "2400×1600"],
    swatch: "linear-gradient(135deg,#f9a8d4,#a5b4fc 55%,#fde68a)",
    summaryTitle: "Warm, editorial moodboard",
    summary: [
      "Soft gradients in peach, lilac and butter yellow. Large serif headlines, generous white space, product shots on plain backgrounds.",
    ],
  },
  {
    id: "f3",
    kind: "sheet",
    name: "q3-metrics.xlsx",
    meta: ["XLSX", "86KB", "3 SHEETS"],
    summaryTitle: "Q3 metrics workbook",
    summary: ["Subscribers, churn and revenue by month from July to September, with a cohort table on sheet 2."],
  },
];

export const RECENTS = [
  "Brewline seed deck",
  "Q3 marketing report",
  "Skincare brochure",
  "Onboarding course",
  "Japan trip plan",
  "Résumé refresh",
];

export const DECK_SLIDES = [
  { kicker: "Brewline", title: "Café-grade coffee, at home", layout: "cover" },
  { kicker: "Problem", title: "Great beans, wasted at home", layout: "split" },
  { kicker: "Solution", title: "Roasted to order, dialled for you", layout: "split" },
  { kicker: "Traction", title: "4,200 subscribers, 92% retention", layout: "stat" },
  { kicker: "Product", title: "Three tiers, one ritual", layout: "cards" },
  { kicker: "Market", title: "$48B home coffee market", layout: "stat" },
  { kicker: "Model", title: "$34 AOV, 71% margin", layout: "chart" },
  { kicker: "Team", title: "Roasters and operators", layout: "cards" },
  { kicker: "Roadmap", title: "From 4k to 40k subscribers", layout: "chart" },
  { kicker: "The ask", title: "$2.5M seed to scale roasting", layout: "cover" },
];

export const FOLLOW_UPS = [
  "Make the traction slide more visual",
  "Add speaker notes to every slide",
  "Turn this deck into a one-page PDF summary",
];
