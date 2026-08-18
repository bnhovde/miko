import type { CSSProperties } from "react";

import { useMikoContext } from "../MikoContext";
import type { Tool } from "../editing";

export type MikoToolbarProps = {
  /** Show undo/redo alongside the tools. Default true. */
  showHistory?: boolean;
  className?: string;
  style?: CSSProperties;
};

const TOOLS: { tool: Tool; label: string; icon: string }[] = [
  { tool: "pencil", label: "Pencil", icon: "✏️" },
  { tool: "fill", label: "Fill", icon: "🪣" },
  { tool: "eraser", label: "Eraser", icon: "🧽" },
];

const buttonStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 4,
  border: active
    ? "2px solid var(--miko-selected, #333)"
    : "1px solid var(--miko-line, #999)",
  background: active ? "var(--miko-active-bg, #eee)" : "var(--miko-bg, #fff)",
  color: "var(--miko-text, #000)",
  cursor: "pointer",
  font: "inherit",
});

export function MikoToolbar({ showHistory = true, className, style }: MikoToolbarProps) {
  const { tool, setTool, undo, redo, canUndo, canRedo } = useMikoContext();

  return (
    <div
      className={className}
      style={{ display: "flex", gap: 4, flexWrap: "wrap", ...style }}
    >
      {TOOLS.map(({ tool: value, label, icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={tool === value}
          onClick={() => setTool(value)}
          style={buttonStyle(tool === value)}
        >
          <span aria-hidden>{icon}</span>
          {label}
        </button>
      ))}

      {showHistory && (
        <>
          <button
            type="button"
            aria-label="Undo"
            onClick={undo}
            disabled={!canUndo}
            style={{ ...buttonStyle(false), opacity: canUndo ? 1 : 0.4 }}
          >
            ↶
          </button>
          <button
            type="button"
            aria-label="Redo"
            onClick={redo}
            disabled={!canRedo}
            style={{ ...buttonStyle(false), opacity: canRedo ? 1 : 0.4 }}
          >
            ↷
          </button>
        </>
      )}
    </div>
  );
}
