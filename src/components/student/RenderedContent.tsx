import React, { useEffect, useRef } from "react";
import { BlockStyle } from "../../types";

interface RenderedContentProps {
  html: string;
  className?: string;
  /** ⭐ Styles de blocs appliqués par l'admin */
  blocksStyle?: Record<string, BlockStyle>;
}

/**
 * ⭐ Composant de rendu LECTURE SEULE
 * - Utilisé pour l'affichage étudiant (dans SessionView)
 * - Utilisé pour l'aperçu admin (dans CourseManagement)
 * - NE CONTIENT AUCUN CONTRÔLE (pas de barre de réglage)
 * - Applique uniquement les styles passés en props
 */
export const RenderedContent: React.FC<RenderedContentProps> = ({
  html,
  className = "",
  blocksStyle = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Envelopper les blocs si pas déjà fait
    const targets = container.querySelectorAll(
      "img:not(.rte-block-wrapped), table:not(.rte-block-wrapped), blockquote:not(.rte-block-wrapped)",
    );

    targets.forEach((el, index) => {
      const hash = el.outerHTML.slice(0, 40).replace(/\W/g, "");
      const blockId = `blk_${hash}_${index}`;

      const wrapper = document.createElement("div");
      wrapper.className = "rte-block";
      wrapper.dataset.blockId = blockId;
      wrapper.dataset.blockType =
        el.tagName === "IMG"
          ? "image"
          : el.tagName === "TABLE"
            ? "table"
            : "quote";

      el.parentNode?.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      el.classList.add("rte-block-wrapped");
    });

    // 2. Appliquer les styles
    container.querySelectorAll<HTMLElement>(".rte-block").forEach((block) => {
      const id = block.dataset.blockId;
      if (!id) return;
      applyStyleToBlock(block, blocksStyle[id] || {});
    });
  }, [html, blocksStyle]);

  return (
    <div
      ref={containerRef}
      className={`rte-editor-content max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ⭐ Applique les styles (identique au RichTextEditor pour cohérence visuelle)
function applyStyleToBlock(block: HTMLElement, style: BlockStyle) {
  const inner = block.firstElementChild as HTMLElement | null;
  if (!inner) return;

  block.style.cssText = "";
  inner.style.cssText = "";

  if (style.width !== undefined) block.style.width = `${style.width}%`;

  if (style.align) {
    if (style.align === "center") {
      block.style.marginLeft = "auto";
      block.style.marginRight = "auto";
    } else if (style.align === "left") {
      block.style.marginLeft = "0";
      block.style.marginRight = "auto";
    } else {
      block.style.marginLeft = "auto";
      block.style.marginRight = "0";
    }
  }

  if (style.padding) block.style.padding = `${style.padding}px`;
  if (style.bg) block.style.backgroundColor = style.bg;

  if (style.border) {
    block.style.border = "2px solid #9ca3af";
  }

  if (style.radius !== undefined) {
    block.style.borderRadius = `${style.radius}px`;
    block.style.overflow = "hidden";
    inner.style.borderRadius = `${style.radius}px`;
  }

  if (style.shadow && style.shadow !== "none") {
    const shadows: Record<string, string> = {
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 4px 6px rgba(0,0,0,0.1)",
      lg: "0 10px 15px rgba(0,0,0,0.15)",
      xl: "0 20px 25px rgba(0,0,0,0.2)",
    };
    block.style.boxShadow = shadows[style.shadow] || "";
  }

  if (inner.tagName === "IMG") {
    if (style.height) {
      inner.style.height = `${style.height}vh`;
      inner.style.objectFit = style.objectFit || "cover";
    } else {
      inner.style.height = "auto";
    }
    if (style.objectFit) {
      inner.style.objectFit = style.objectFit;
    }
  }

  if (inner.tagName === "TABLE") {
    inner.style.width = "100%";
  }
}
