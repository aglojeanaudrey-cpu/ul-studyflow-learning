/**
 * Constantes globales UL Study Flow.
 */

export const SUPPORT = {
  phone: "", // ← le 1er numéro actif
  phoneAlt: "", // ← le 2ᵉ numéro actif
  email: "ulstudyflow@gmail.com",
  location: "Lomé, Togo (Campus Universitaire)",
  faqUrl: "/faq",
} as const;

export const BRAND = {
  name: "Ul-StudyFlow-Learning",
  tagline: "Apprendre • Comprendre • Progresser",
  year: 2026,
} as const;

export const PRICING = {
  singleUe: 500, // F CFA par UE
  packUe: 300, // F CFA par UE dès 3 UEs
  currency: "FcFa",
} as const;

export const STATS = {
  students: "4 800+",
  successRate: "94%",
  rating: "4.8 / 5",
  compliance: "100%",
} as const;

// URL de téléchargement de l'APK hébergé sur GitHub Releases
export const APK_DOWNLOAD_URL =
  "https://github.com/aglojeanaudrey-cpu/ul-studyflow-learning/releases/download/v3.0.0/Ul-StudyFlow-Learning.apk";
