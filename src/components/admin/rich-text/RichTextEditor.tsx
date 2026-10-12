import React, { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";
import { RichTextToolbar } from "./RichTextToolbar";
import { BlockControls } from "./BlockControls";
import { BlockStyle } from "../../../types";
import "./rich-text.css";

interface RichTextEditorProps {
  initialHtml?: string;
  initialJson?: any;
  /** ⭐ Styles de blocs initialement appliqués */
  initialBlocksStyle?: Record<string, BlockStyle>;
  /** Callback à chaque modification (retourne HTML + JSON + styles de blocs) */
  onChange: (data: {
    html: string;
    json: any;
    blocksStyle: Record<string, BlockStyle>;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialHtml,
  initialJson,
  initialBlocksStyle = {},
  onChange,
  placeholder,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [blockStyles, setBlockStyles] = useState<Record<string, BlockStyle>>(
    initialBlocksStyle || {},
  );
  const blocksRef = useRef<Record<string, HTMLElement>>({});

  const editor = useEditor({
    extensions: getEditorExtensions(placeholder),
    content: initialHtml || initialJson || "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "rte-editor",
      },
    },
    onUpdate: ({ editor }) => {
      // Après chaque update, on ré-applique les styles et on émet tout
      setTimeout(() => {
        wrapBlocksAndApplyStyles();
        emitChange(editor.getHTML(), editor.getJSON());
      }, 0);
    },
  });

  // ⭐ Émet les données au parent
  const emitChange = useCallback(
    (html: string, json: any) => {
      onChange({ html, json, blocksStyle: blockStyles });
    },
    [blockStyles, onChange],
  );

  // ⭐ Enveloppe les blocs et applique les styles
  const wrapBlocksAndApplyStyles = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Envelopper chaque élément riche s'il ne l'est pas déjà
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

    // 2. Appliquer les styles sauvegardés
    container.querySelectorAll<HTMLElement>(".rte-block").forEach((block) => {
      const id = block.dataset.blockId;
      if (!id) return;
      blocksRef.current[id] = block;
      applyStyleToBlock(block, blockStyles[id] || {});
    });
  }, [blockStyles]);

  // Sync props changements
  useEffect(() => {
    if (!editor) return;
    const nextContent = initialHtml || initialJson || "<p></p>";
    const currentContent = editor.getHTML();
    if (nextContent !== currentContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      setTimeout(wrapBlocksAndApplyStyles, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHtml, initialJson, editor]);

  // Sync blockStyles (si reçu du parent)
  useEffect(() => {
    setBlockStyles(initialBlocksStyle || {});
    setTimeout(wrapBlocksAndApplyStyles, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBlocksStyle]);

  // ⭐ Clic sur un bloc
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const block = target.closest(".rte-block") as HTMLElement | null;
    if (block) {
      setActiveBlockId(block.dataset.blockId || null);
    } else {
      setActiveBlockId(null);
    }
  };

  // ⭐ Update style
  const updateStyle = (patch: Partial<BlockStyle>) => {
    if (!activeBlockId) return;
    const current = blockStyles[activeBlockId] || {};
    const next = { ...current, ...patch };
    const newStyles = { ...blockStyles, [activeBlockId]: next };
    setBlockStyles(newStyles);

    const block = blocksRef.current[activeBlockId];
    if (block) applyStyleToBlock(block, next);

    if (editor) {
      emitChange(editor.getHTML(), editor.getJSON());
    }
  };

  // ⭐ Reset style
  const resetStyle = () => {
    if (!activeBlockId) return;
    const newStyles = { ...blockStyles };
    delete newStyles[activeBlockId];
    setBlockStyles(newStyles);

    const block = blocksRef.current[activeBlockId];
    if (block) applyStyleToBlock(block, {});

    if (editor) {
      emitChange(editor.getHTML(), editor.getJSON());
    }
  };

  const activeStyle: BlockStyle = activeBlockId
    ? blockStyles[activeBlockId] || {}
    : {};
  const activeBlockType =
    (activeBlockId &&
      (
        containerRef.current?.querySelector(
          `.rte-block[data-block-id="${activeBlockId}"]`,
        ) as HTMLElement
      )?.dataset.blockType) ||
    "image";

  // Après le premier rendu, envelopper les blocs
  useEffect(() => {
    if (!editor) return;
    const t = setTimeout(wrapBlocksAndApplyStyles, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="rte-container flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rte-container">
      <RichTextToolbar editor={editor} />
      <div onClick={handleClick}>
        <EditorContent editor={editor} ref={containerRef as any} />
      </div>

      {/* ⭐ Barre de contrôle sous l'éditeur */}
      {activeBlockId && (
        <div className="mt-3 px-3 pb-3">
          <BlockControls
            activeStyle={activeStyle}
            onUpdate={updateStyle}
            onReset={resetStyle}
            blockType={activeBlockType as any}
          />
        </div>
      )}
    </div>
  );
};

// ⭐ Applique les styles à un bloc
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
