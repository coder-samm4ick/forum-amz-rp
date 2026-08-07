type IconProps = { className?: string };

const base = (className?: string) => ({
  className: className ?? "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconNews = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 11l14-5v12L3 13v-2z" /><path d="M7 13.5V18a2 2 0 0 0 4 0v-3" /><path d="M17 8.5a3 3 0 0 1 0 5" /><path d="M20 6.5a6.5 6.5 0 0 1 0 9" /></svg>
);
export const IconRules = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IconComplaint = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 4v6" /><path d="M6 10h12" /><path d="M6 10l-2.5 5a3 3 0 0 0 5.5 0L6.5 10" /><path d="M18 10l-2.5 5a3 3 0 0 0 5.5 0L18.5 10" /><path d="M8 21h8" /><path d="M12 10v11" /></svg>
);
export const IconFaction = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9.5" r="2.3" /><path d="M14.5 19a4.8 4.8 0 0 1 6-4.6" /></svg>
);
export const IconTech = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1a2 2 0 1 0 2.8 2.8l4.9-4.9a4 4 0 0 0 4.7-5.6l-2.6 2.6-2.2-.6-.6-2.2 2.5-2.7z" /><path d="M17 17l3 3" /></svg>
);
export const IconFlood = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6z" /><path d="M8.5 9h7" /><path d="M8.5 12h4.5" /></svg>
);
export const IconMarket = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 7h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 7z" /><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" /></svg>
);
export const IconFolder = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>
);
export const IconPin = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 17v5" /><path d="M7 4h10l-1 6 2.5 3.5a1 1 0 0 1-.8 1.5H6.3a1 1 0 0 1-.8-1.5L8 10 7 4z" /></svg>
);
export const IconLock = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IconEye = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconReply = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v4" /></svg>
);
export const IconArrowRight = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 12h16" /><path d="M13 5l7 7-7 7" /></svg>
);
export const IconUsers = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="8.5" cy="8" r="3.2" /><path d="M2.5 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 20a5 5 0 0 1 6-4.8" /></svg>
);
export const IconServer = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01" /><path d="M7 16.5h.01" /><path d="M17 7.5h-4" /><path d="M17 16.5h-4" /></svg>
);
export const IconShield = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z" /><path d="M12 8v4" /><path d="M12 15h.01" /></svg>
);
export const IconRestart = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3v4h-4" /></svg>
);
export const IconCopy = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
export const IconPlus = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const IconTrash = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6.5 7l1 13h9l1-13" /><path d="M10 11v5" /><path d="M14 11v5" /></svg>
);
export const IconUp = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
);
export const IconDown = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 5v14" /><path d="M5 12l7 7 7-7" /></svg>
);
export const IconFlame = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1.8.8-3.4 1.6-4.6C9.6 8 11 9 11.5 8 12.5 6.5 12 2 12 2z" /><path d="M12 22a4 4 0 0 1-4-4c0-2 1.5-3.5 4-6 2.5 2.5 4 4 4 6a4 4 0 0 1-4 4z" /></svg>
);
export const IconChat = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 4c4.7 0 8.5 3 8.5 6.8S16.7 17.5 12 17.5c-.9 0-1.8-.1-2.6-.3L5 20l.9-3.6C4.2 15.2 3.5 13.4 3.5 10.8 3.5 7 7.3 4 12 4z" /></svg>
);
export const IconLogout = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M15 8l4 4-4 4" /><path d="M19 12H9" /></svg>
);
export const IconSearch = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
);
export const IconBolt = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" /></svg>
);

export const IconCrown = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M4 18h16" /><path d="M4 18l-1-9 5 3.5L12 6l4 6.5L21 9l-1 9H4z" /></svg>
);
export const IconSignal = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 19v-4" /><path d="M10 19v-8" /><path d="M15 19V7" /><path d="M20 19V4" /></svg>
);
export const IconClock = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconSend = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M21 3L10.5 13.5" /><path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3z" /></svg>
);
export const IconDoc = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M6 3h8l4 4v14H6V3z" /><path d="M14 3v4h4" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
);

export const CATEGORY_ICONS: Record<string, (p: IconProps) => React.ReactNode> = {
  news: IconNews,
  rules: IconRules,
  complaint: IconComplaint,
  faction: IconFaction,
  tech: IconTech,
  flood: IconFlood,
  market: IconMarket,
  folder: IconFolder,
};

export const ICON_KEYS = Object.keys(CATEGORY_ICONS);
