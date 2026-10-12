import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

/**
 * NodeView personnalisé pour les images redimensionnables.
 * Affiche une barre d'outils flottante avec :
 * - Tailles : 25% / 50% / 75% / 100%
 * - Alignement : gauche / centre / droite / pleine largeur
 * - Suppression
 */
export const ResizableImageView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const width = node.attrs.width || 100;
  const align = node.attrs.align || "center";
  const src = node.attrs.src;

  const sizeOptions = [
    { value: 25, label: "25%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100%" },
  ];

  const alignOptions = [
    { value: "left", icon: AlignLeft, label: "Gauche" },
    { value: "center", icon: AlignCenter, label: "Centre" },
    { value: "right", icon: AlignRight, label: "Droite" },
    { value: "full", icon: Maximize2, label: "Pleine largeur" },
  ];

  const getAlignmentStyle = (): React.CSSProperties => {
    switch (align) {
      case "left":
        return { marginRight: "auto", marginLeft: 0 };
      case "right":
        return { marginLeft: "auto", marginRight: 0 };
      case "full":
        return { marginLeft: 0, marginRight: 0, width: "100%" };
      case "center":
      default:
        return { marginLeft: "auto", marginRight: "auto" };
    }
  };

  return (
    <NodeViewWrapper
      className={`rte-image-wrapper ${selected ? "rte-image-selected" : ""}`}
      data-align={align}
      data-width={width}
    >
      {/* Toolbar flottante (visible au survol ou sélection) */}
      <div className="rte-image-toolbar">
        {/* Tailles */}
        <div className="rte-image-toolbar-group">
          <span className="rte-image-toolbar-label">
            <ImageIcon className="w-3 h-3" />
          </span>
          {sizeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateAttributes({ width: opt.value })}
              className={`rte-image-btn ${width === opt.value ? "rte-image-btn-active" : ""}`}
              title={`Taille ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Alignement */}
        <div className="rte-image-toolbar-group">
          {alignOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateAttributes({ align: opt.value })}
                className={`rte-image-btn-icon ${align === opt.value ? "rte-image-btn-active" : ""}`}
                title={opt.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Suppression */}
        <div className="rte-image-toolbar-group">
          <button
            type="button"
            onClick={deleteNode}
            className="rte-image-btn-icon rte-image-btn-danger"
            title="Supprimer l'image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        style={{
          width: align === "full" ? "100%" : `${width}%`,
          ...getAlignmentStyle(),
        }}
      >
        <img
          src={src}
          alt={node.attrs.alt || ""}
          className="rte-image-content"
        />
      </div>
    </NodeViewWrapper>
  );
};
