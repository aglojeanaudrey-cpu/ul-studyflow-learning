import React from "react";
import { Text, View, Image, Link } from "@react-pdf/renderer";

/**
 * Styles PDF par défaut (peuvent être surchargés par le parent).
 */
export const defaultPdfStyles = {
  h1: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1pt solid #E9EDEF",
  },
  h2: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
    marginTop: 14,
    marginBottom: 6,
  },
  h3: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111B21",
    marginTop: 12,
    marginBottom: 4,
  },
  h4: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111B21",
    marginTop: 10,
    marginBottom: 4,
  },
  h5: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#3B4A54",
    marginTop: 8,
    marginBottom: 3,
  },
  h6: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#667781",
    marginTop: 6,
    marginBottom: 3,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111B21",
    marginBottom: 6,
    textAlign: "justify" as const,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  italic: {
    fontFamily: "Helvetica-Oblique",
  },
  boldItalic: {
    fontFamily: "Helvetica-BoldOblique",
  },
  underline: {
    textDecoration: "underline" as const,
  },
  strike: {
    textDecoration: "line-through" as const,
  },
  highlight: {
    backgroundColor: "#fef08a",
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline" as const,
  },
  blockquote: {
    marginVertical: 6,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 6,
    borderLeft: "3pt solid #25D366",
    backgroundColor: "#ecfdf5",
    fontSize: 11,
    fontStyle: "italic" as const,
    color: "#3B4A54",
  },
  codeInline: {
    fontFamily: "Courier",
    backgroundColor: "#F0F2F5",
    color: "#075E54",
    paddingHorizontal: 3,
    paddingVertical: 1,
    fontSize: 10,
  },
  codeBlock: {
    fontFamily: "Courier",
    backgroundColor: "#0B141A",
    color: "#E9EDEF",
    padding: 10,
    borderRadius: 6,
    fontSize: 9,
    marginVertical: 6,
    lineHeight: 1.4,
  },
  bulletList: {
    marginLeft: 12,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: "row" as const,
    marginBottom: 3,
  },
  listBullet: {
    width: 12,
    fontSize: 11,
    color: "#075E54",
  },
  listNumber: {
    width: 16,
    fontSize: 11,
    color: "#075E54",
    fontFamily: "Helvetica-Bold",
  },
  listContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#111B21",
  },
  hr: {
    marginVertical: 10,
    borderTop: "1pt solid #E9EDEF",
  },
  image: {
    marginVertical: 8,
    borderRadius: 4,
    maxWidth: "100%",
  },
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E9EDEF",
  },
  tableRow: {
    flexDirection: "row" as const,
  },
  tableHeaderCell: {
    backgroundColor: "#F0F2F5",
    padding: 6,
    borderWidth: 1,
    borderColor: "#E9EDEF",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111B21",
    flex: 1,
  },
  tableCell: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#E9EDEF",
    fontSize: 10,
    color: "#111B21",
    flex: 1,
  },
};

/**
 * Récupère le style d'un mark en fonction de son type.
 */
function getMarkStyle(markType: string, styles: any): any {
  switch (markType) {
    case "bold":
      return styles.bold;
    case "italic":
      return styles.italic;
    case "underline":
      return styles.underline;
    case "strike":
      return styles.strike;
    case "highlight":
      return styles.highlight;
    case "link":
      return styles.link;
    case "code":
      return styles.codeInline;
    default:
      return {};
  }
}

/**
 * Convertit un tableau de marques en style cumulé.
 */
function mergeMarks(marks: any[] | undefined, styles: any): any {
  if (!marks || marks.length === 0) return {};
  const combined: any = {};
  for (const mark of marks) {
    const markStyle = getMarkStyle(mark.type, styles);
    Object.assign(combined, markStyle);
  }
  return combined;
}

/**
 * Récupère le texte brut concaténé d'un node (pour listes, etc.).
 */
function extractText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractText).join("");
  }
  return "";
}

/**
 * Récupère une URL de lien depuis les marques d'un node texte.
 */
function extractLinkHref(node: any): string | null {
  if (!node.marks) return null;
  const linkMark = node.marks.find((m: any) => m.type === "link");
  return linkMark?.attrs?.href || null;
}

/**
 * Rend un noeud texte avec ses marques.
 */
function renderTextNode(
  node: any,
  index: number,
  styles: any,
  linkStyle: any,
): React.ReactNode {
  const style = mergeMarks(node.marks, styles);
  const href = extractLinkHref(node);

  if (href) {
    return (
      <Link key={index} src={href} style={[style, linkStyle]}>
        {node.text || ""}
      </Link>
    );
  }

  return (
    <Text key={index} style={style}>
      {node.text || ""}
    </Text>
  );
}

/**
 * Rend un paragraphe (avec ses enfants inline).
 */
function renderParagraph(node: any, key: string, styles: any): React.ReactNode {
  const textAlign = node.attrs?.textAlign || "left";
  const children = (node.content || []).map((child: any, i: number) =>
    renderTextNode(child, i, styles, styles.link),
  );

  return (
    <Text key={key} style={[styles.paragraph, { textAlign }]}>
      {children.length > 0 ? children : " "}
    </Text>
  );
}

/**
 * Rend un titre H1-H6.
 */
function renderHeading(node: any, key: string, styles: any): React.ReactNode {
  const level = node.attrs?.level || 1;
  const styleKey = `h${level}` as keyof typeof styles;
  const textAlign = node.attrs?.textAlign || "left";

  const children = (node.content || []).map((child: any, i: number) =>
    renderTextNode(child, i, styles, styles.link),
  );

  return (
    <Text key={key} style={[styles[styleKey] as any, { textAlign }]}>
      {children}
    </Text>
  );
}

/**
 * Rend une liste (bullet ou ordonnée).
 */
function renderList(
  node: any,
  key: string,
  styles: any,
  isOrdered: boolean,
): React.ReactNode {
  const items = node.content || [];
  return (
    <View key={key} style={styles.bulletList}>
      {items.map((item: any, i: number) => {
        const content = item.content || [];
        const firstParagraph = content[0];
        const restContent = content.slice(1);

        return (
          <View key={i} style={styles.listItem}>
            <Text style={isOrdered ? styles.listNumber : styles.listBullet}>
              {isOrdered ? `${i + 1}.` : "•"}
            </Text>
            <View style={styles.listContent}>
              {firstParagraph &&
                renderNode(firstParagraph, `li-${i}-0`, styles)}
              {restContent.map((c: any, j: number) =>
                renderNode(c, `li-${i}-${j + 1}`, styles),
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Rend une citation (blockquote).
 */
function renderBlockquote(
  node: any,
  key: string,
  styles: any,
): React.ReactNode {
  const children = (node.content || []).map((child: any, i: number) =>
    renderNode(child, `bq-${i}`, styles),
  );

  return (
    <View key={key} style={styles.blockquote}>
      <Text style={{ fontSize: 11, fontStyle: "italic", color: "#3B4A54" }}>
        {children}
      </Text>
    </View>
  );
}

/**
 * Rend un bloc de code.
 */
function renderCodeBlock(node: any, key: string, styles: any): React.ReactNode {
  const code = extractText(node);
  return (
    <View key={key} style={styles.codeBlock}>
      <Text style={{ fontFamily: "Courier", fontSize: 9, color: "#E9EDEF" }}>
        {code || " "}
      </Text>
    </View>
  );
}

/**
 * Rend une image.
 */
function renderImage(node: any, key: string, styles: any): React.ReactNode {
  const src = node.attrs?.src;
  if (!src) return null;

  return <Image key={key} src={src} style={styles.image} />;
}

/**
 * Rend un séparateur horizontal.
 */
function renderHorizontalRule(key: string, styles: any): React.ReactNode {
  return <View key={key} style={styles.hr} />;
}

/**
 * Rend un tableau (récursif).
 */
function renderTable(node: any, key: string, styles: any): React.ReactNode {
  const rows = node.content || [];
  return (
    <View key={key} style={styles.table}>
      {rows.map((row: any, ri: number) => (
        <View key={ri} style={styles.tableRow} wrap={false}>
          {(row.content || []).map((cell: any, ci: number) => {
            const isHeader = cell.type === "tableHeader";
            const cellStyle = isHeader
              ? styles.tableHeaderCell
              : styles.tableCell;
            const cellText = extractText(cell);

            return (
              <View key={ci} style={cellStyle}>
                <Text style={{ fontSize: 10 }}>{cellText || " "}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/**
 * Dispatch : rend un noeud selon son type.
 */
function renderNode(node: any, key: string, styles: any): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case "paragraph":
      return renderParagraph(node, key, styles);
    case "heading":
      return renderHeading(node, key, styles);
    case "bulletList":
      return renderList(node, key, styles, false);
    case "orderedList":
      return renderList(node, key, styles, true);
    case "blockquote":
      return renderBlockquote(node, key, styles);
    case "codeBlock":
      return renderCodeBlock(node, key, styles);
    case "image":
      return renderImage(node, key, styles);
    case "horizontalRule":
      return renderHorizontalRule(key, styles);
    case "table":
      return renderTable(node, key, styles);
    case "hardBreak":
      return <Text key={key}>{"\n"}</Text>;
    case "text":
      return renderTextNode(node, 0, styles, styles.link);
    default:
      // Fallback : si le noeud a des enfants, on les rend
      if (node.content && Array.isArray(node.content)) {
        return (
          <View key={key}>
            {node.content.map((c: any, i: number) =>
              renderNode(c, `${key}-${i}`, styles),
            )}
          </View>
        );
      }
      return null;
  }
}

/**
 * Point d'entrée : convertit un JSON TipTap en composants React-PDF.
 */
export function renderTipTapContent(
  json: any,
  customStyles?: Partial<typeof defaultPdfStyles>,
): React.ReactNode {
  if (!json || !json.content) return null;

  const styles = { ...defaultPdfStyles, ...(customStyles || {}) };

  return (
    <>
      {json.content.map((node: any, i: number) =>
        renderNode(node, `node-${i}`, styles),
      )}
    </>
  );
}
