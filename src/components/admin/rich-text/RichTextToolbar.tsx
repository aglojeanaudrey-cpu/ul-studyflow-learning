import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Table as TableIcon,
  Undo2,
  Redo2,
  Eraser,
  RemoveFormatting,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

interface RichTextToolbarProps {
  editor: Editor | null;
}

interface ButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "danger";
}

const TBtn: React.FC<ButtonProps> = ({
  onClick,
  active,
  disabled,
  title,
  children,
  variant = "default",
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rte-btn ${
      active ? "rte-btn-active" : ""
    } ${variant === "danger" ? "rte-btn-danger" : ""}`}
  >
    {children}
  </button>
);

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ editor }) => {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);

  if (!editor) return null;

  // Helpers
  const promptLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("URL du lien :", prev);
    if (url === null) return; // annulé

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const promptImage = () => {
    const url = window.prompt("URL de l'image :");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    setShowTableMenu(false);
  };

  return (
    <div className="rte-toolbar">
      {/* === HISTORIQUE === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </TBtn>
      </div>

      {/* === TITRES === */}
      <div className="rte-toolbar-group relative">
        <button
          type="button"
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          title="Style de titre"
          className="rte-btn flex items-center gap-0.5 w-auto px-2"
        >
          <Heading1 className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1F2C34] rounded-xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden z-20 min-w-45">
            {[
              { level: 0, label: "Paragraphe", icon: null },
              { level: 1, label: "Titre 1", icon: Heading1 },
              { level: 2, label: "Titre 2", icon: Heading2 },
              { level: 3, label: "Titre 3", icon: Heading3 },
              { level: 4, label: "Titre 4", icon: Heading4 },
              { level: 5, label: "Titre 5", icon: Heading5 },
              { level: 6, label: "Titre 6", icon: Heading6 },
            ].map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => {
                  if (opt.level === 0) {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor
                      .chain()
                      .focus()
                      .toggleHeading({
                        level: opt.level as 1 | 2 | 3 | 4 | 5 | 6,
                      })
                      .run();
                  }
                  setShowHeadingMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] flex items-center gap-2 ${
                  (opt.level === 0 && editor.isActive("paragraph")) ||
                  (opt.level > 0 &&
                    editor.isActive("heading", { level: opt.level }))
                    ? "bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] font-bold"
                    : "text-[#111B21] dark:text-white"
                }`}
              >
                {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === FORMAT TEXTE === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()
          }
          active={editor.isActive("highlight")}
          title="Surligner"
        >
          <Highlighter className="w-4 h-4" />
        </TBtn>
      </div>

      {/* === ALIGNEMENT === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justifier"
        >
          <AlignJustify className="w-4 h-4" />
        </TBtn>
      </div>

      {/* === LISTES === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </TBtn>
      </div>

      {/* === BLOCS === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </TBtn>
        {/* ⭐ Callout (encadré) */}
        <div className="relative">
          <TBtn
            onClick={() => setShowCalloutMenu(!showCalloutMenu)}
            active={editor.isActive("callout")}
            title="Insérer un encadré"
          >
            <MessageSquare className="w-4 h-4" />
          </TBtn>
          {showCalloutMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1F2C34] rounded-xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden z-20 min-w-50">
              {[
                { type: "info", emoji: "💡", label: "Information" },
                { type: "success", emoji: "✅", label: "Succès" },
                { type: "warning", emoji: "⚠️", label: "Attention" },
                { type: "danger", emoji: "🚨", label: "Danger" },
              ].map((c) => (
                <button
                  key={c.type}
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "callout",
                        attrs: { type: c.type },
                        content: [
                          {
                            type: "paragraph",
                            content: [{ type: "text", text: " " }],
                          },
                        ],
                      })
                      .run();
                    setShowCalloutMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] flex items-center gap-2"
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <TBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code inline"
        >
          <Code className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Bloc de code"
        >
          <Code2 className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Ligne horizontale"
        >
          <Minus className="w-4 h-4" />
        </TBtn>
      </div>

      {/* === INSERTION === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={promptLink}
          active={editor.isActive("link")}
          title="Insérer un lien"
        >
          <LinkIcon className="w-4 h-4" />
        </TBtn>
        <TBtn onClick={promptImage} title="Insérer une image (URL)">
          <ImageIcon className="w-4 h-4" />
        </TBtn>
        <div className="relative">
          <TBtn
            onClick={() => setShowTableMenu(!showTableMenu)}
            active={editor.isActive("table")}
            title="Tableau"
          >
            <TableIcon className="w-4 h-4" />
          </TBtn>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1F2C34] rounded-xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden z-20 min-w-55">
              <button
                type="button"
                onClick={insertTable}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942]"
              >
                ➕ Insérer un tableau 3×3
              </button>
              {editor.isActive("table") && (
                <>
                  <div className="border-t border-[#E9EDEF] dark:border-[#222E35]" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942]"
                  >
                    ➡️ Ajouter colonne
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942]"
                  >
                    ⬅️ Supprimer colonne
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942]"
                  >
                    ⬇️ Ajouter ligne
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942]"
                  >
                    ⬆️ Supprimer ligne
                  </button>
                  <div className="border-t border-[#E9EDEF] dark:border-[#222E35]" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    🗑️ Supprimer le tableau
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === NETTOYAGE === */}
      <div className="rte-toolbar-group">
        <TBtn
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Effacer le formatage"
          variant="danger"
        >
          <RemoveFormatting className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().clearNodes().run()}
          title="Effacer les styles de bloc"
          variant="danger"
        >
          <Eraser className="w-4 h-4" />
        </TBtn>
      </div>
    </div>
  );
};
