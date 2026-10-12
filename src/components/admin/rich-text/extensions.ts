import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { ResizableImage } from "./nodes/ResizableImage";
import { Callout } from "./nodes/Callout";

export const getEditorExtensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    codeBlock: { HTMLAttributes: { class: "rte-code-block" } },
    blockquote: { HTMLAttributes: { class: "rte-blockquote" } },
  }),

  Underline,

  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      class: "rte-link",
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),

  // ⭐ Image redimensionnable
  ResizableImage.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: { class: "rte-image" },
  }),

  // ⭐ Callouts (encadrés colorés)
  Callout,

  Table.configure({
    resizable: true,
    HTMLAttributes: { class: "rte-table" },
  }),
  TableRow,
  TableHeader,
  TableCell,

  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),

  Highlight.configure({ multicolor: true }),

  Placeholder.configure({
    placeholder: placeholder || "Commencez à rédiger votre cours…",
    emptyEditorClass: "rte-empty-editor",
    emptyNodeClass: "rte-empty-node",
    showOnlyWhenEditable: true,
  }),
];
