import React from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const CALLOUT_TYPES = [
  { value: "info", label: "Information", icon: Info, emoji: "💡" },
  { value: "success", label: "Succès", icon: CheckCircle2, emoji: "✅" },
  { value: "warning", label: "Attention", icon: AlertTriangle, emoji: "⚠️" },
  { value: "danger", label: "Danger", icon: AlertCircle, emoji: "🚨" },
] as const;

/**
 * NodeView pour les callouts (encadrés colorés).
 * Permet de changer le type (info/success/warning/danger) via un menu.
 */
export const CalloutNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const type = node.attrs.type || "info";
  const config =
    CALLOUT_TYPES.find((t) => t.value === type) || CALLOUT_TYPES[0];
  const Icon = config.icon;

  return (
    <NodeViewWrapper
      className={`rte-callout rte-callout-${type}`}
      data-type={type}
      data-callout=""
    >
      {/* Header avec sélecteur de type */}
      <div className="rte-callout-header" contentEditable={false}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rte-callout-type-btn"
          title="Changer le type"
        >
          <Icon className="w-4 h-4" />
          <span className="rte-callout-emoji">{config.emoji}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>

        {menuOpen && (
          <div className="rte-callout-menu">
            {CALLOUT_TYPES.map((t) => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    updateAttributes({ type: t.value });
                    setMenuOpen(false);
                  }}
                  className={`rte-callout-menu-item ${type === t.value ? "active" : ""}`}
                >
                  <TIcon className="w-3.5 h-3.5" />
                  <span>
                    {t.emoji} {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contenu éditable */}
      <NodeViewContent className="rte-callout-content" />
    </NodeViewWrapper>
  );
};
