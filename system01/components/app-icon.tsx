export type AppIconName =
  | "overview"
  | "clients"
  | "processes"
  | "documents"
  | "agenda"
  | "reports"
  | "history"
  | "menu"
  | "close"
  | "arrow-left"
  | "arrow-right"
  | "plus"
  | "search"
  | "download"
  | "edit"
  | "trash"
  | "file"
  | "calendar"
  | "clock"
  | "alert"
  | "check"
  | "print"
  | "filter";

type AppIconProps = {
  name: AppIconName;
  className?: string;
  strokeWidth?: number;
};

export function AppIcon({ name, className = "h-5 w-5", strokeWidth = 1.8 }: AppIconProps) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "overview":
      return (
        <svg {...props}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
        </svg>
      );
    case "clients":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.8 20c.7-3.1 2.6-4.7 5.2-4.7s4.5 1.6 5.2 4.7" />
          <path d="M16.3 6.1a2.6 2.6 0 0 1 0 5.1" />
          <path d="M16.2 15.5c2.1.3 3.5 1.8 4 4.5" />
        </svg>
      );
    case "processes":
      return (
        <svg {...props}>
          <path d="M5 4.5h10l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14.5 4.7V9h4.1" />
          <path d="M7.5 13h8" />
          <path d="M7.5 16.5h6" />
        </svg>
      );
    case "documents":
    case "file":
      return (
        <svg {...props}>
          <path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14 3.8V8h4" />
          <path d="M8 12h8" />
          <path d="M8 15.5h6" />
        </svg>
      );
    case "agenda":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v4" />
          <path d="M16.5 3.5v4" />
          <path d="M3.5 10h17" />
          <path d="M8 14h3" />
          <path d="M8 17h6" />
        </svg>
      );
    case "reports":
      return (
        <svg {...props}>
          <path d="M4 20.5V4.8" />
          <path d="M4 20.5h16" />
          <path d="M8 17v-4" />
          <path d="M12 17V8" />
          <path d="M16 17v-7" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7" />
          <path d="M4 5.5v4h4" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...props}>
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="10.8" cy="10.8" r="5.7" />
          <path d="m15.2 15.2 4.3 4.3" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M12 3.5v11" />
          <path d="m7.7 10.4 4.3 4.3 4.3-4.3" />
          <path d="M4.5 20.5h15" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="m4.8 16.9-.9 3.2 3.2-.9L18.3 8a2.2 2.2 0 0 0-3.1-3.1Z" />
          <path d="m13.8 4.2 3.9 3.9" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M4.5 7h15" />
          <path d="M9 3.5h6" />
          <path d="m6.5 7 .8 12.2a1.4 1.4 0 0 0 1.4 1.3h6.6a1.4 1.4 0 0 0 1.4-1.3L17.5 7" />
          <path d="M10 11v5.5" />
          <path d="M14 11v5.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v4" />
          <path d="M16.5 3.5v4" />
          <path d="M3.5 10h17" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3.2 2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M10.3 4.5 3.8 18a1.5 1.5 0 0 0 1.4 2.1h13.6a1.5 1.5 0 0 0 1.4-2.1L13.7 4.5a1.9 1.9 0 0 0-3.4 0Z" />
          <path d="M12 9v4.2" />
          <path d="M12 16.6h.01" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12.5 4.2 4.2L19 7" />
        </svg>
      );
    case "print":
      return (
        <svg {...props}>
          <path d="M6.5 8V3.5h11V8" />
          <rect x="4" y="8" width="16" height="8" rx="1.8" />
          <path d="M6.5 14.5h11v6h-11z" />
          <path d="M16.5 11.5h.01" />
        </svg>
      );
    case "filter":
      return (
        <svg {...props}>
          <path d="M4 5h16" />
          <path d="M7 12h10" />
          <path d="M10 19h4" />
        </svg>
      );
    default:
      return null;
  }
}
