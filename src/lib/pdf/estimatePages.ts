/**
 * Estimation du nombre de pages PDF à partir du contenu TipTap JSON.
 *
 * Heuristiques (basées sur une mise en page A4 standard) :
 * - 1 page ≈ 3000 caractères de texte brut
 * - Ou 1 page ≈ 500 mots
 * - Les titres H1/H2 ajoutent un peu d'espace
 * - Les tableaux/images sont plus volumineux
 */

interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
  attrs?: Record<string, any>;
  marks?: any[];
}

const CHARS_PER_PAGE = 3000;
const BASE_PAGES = 1; // Page de garde / header

export function estimatePdfPages(json: any): number {
  if (!json || !json.content) return BASE_PAGES;

  let charCount = 0;
  let extraPages = 0;

  const walk = (node: TipTapNode) => {
    // Texte brut
    if (node.type === "text" && node.text) {
      charCount += node.text.length;
    }

    // Titres → ajoutent du poids (espace vertical)
    if (node.type === "heading") {
      charCount += 80; // Équivalent d'espace vertical
    }

    // Images → 0.4 page chacune
    if (node.type === "image") {
      extraPages += 0.4;
    }

    // Tableaux → estimer selon le nombre de cellules
    if (node.type === "table") {
      const rows = node.content?.length || 0;
      extraPages += Math.ceil(rows / 15) * 0.3; // ~15 lignes par page de tableau
    }

    // Blocs code
    if (node.type === "codeBlock") {
      charCount += 200; // Espace supplémentaire
    }

    // Citations
    if (node.type === "blockquote") {
      charCount += 100;
    }

    // Récursion
    if (node.content) {
      node.content.forEach(walk);
    }
  };

  walk(json);

  const textPages = Math.ceil(charCount / CHARS_PER_PAGE);
  return Math.max(1, BASE_PAGES + textPages + Math.ceil(extraPages));
}

/**
 * Retourne aussi une estimation du nombre de mots.
 */
export function countWords(json: any): number {
  if (!json || !json.content) return 0;

  let words = 0;
  const walk = (node: TipTapNode) => {
    if (node.type === "text" && node.text) {
      words += node.text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (node.content) {
      node.content.forEach(walk);
    }
  };
  walk(json);
  return words;
}

/**
 * Compte le nombre de caractères bruts.
 */
export function countCharacters(json: any): number {
  if (!json || !json.content) return 0;

  let chars = 0;
  const walk = (node: TipTapNode) => {
    if (node.type === "text" && node.text) {
      chars += node.text.length;
    }
    if (node.content) {
      node.content.forEach(walk);
    }
  };
  walk(json);
  return chars;
}
