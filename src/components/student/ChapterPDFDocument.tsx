import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  renderTipTapContent,
  defaultPdfStyles,
} from "../../lib/pdf/tipTapToReactPdf";

interface ChapterPDFDocumentProps {
  /** Titre de l'UE (ex: "ECONOMIE GENERALE") */
  ueTitle: string;
  /** Code de l'UE (ex: "ECO-101") */
  ueCode: string;
  /** Numéro de la séance */
  sessionNumber: number;
  /** Titre de la séance */
  sessionTitle: string;
  /** Numéro du chapitre */
  chapterNumber: number;
  /** Titre du chapitre */
  chapterTitle: string;
  /** Objectifs du chapitre */
  objectives?: string;
  /** Contenu riche TipTap JSON */
  contentJson?: any;
  /** Contenu HTML fallback (si pas de JSON) */
  contentHtml?: string;
  /** Date de génération */
  generatedAt?: string;
  /** Nom de l'étudiant (optionnel) */
  studentName?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111B21",
  },

  // Header
  header: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#25D366",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBrand: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
  },
  headerSubtext: {
    fontSize: 8,
    color: "#667781",
  },
  headerRight: {
    textAlign: "right",
  },
  headerMeta: {
    fontSize: 8,
    color: "#667781",
  },
  headerMetaBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E9EDEF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#667781",
  },
  pageNumber: {
    fontSize: 7,
    color: "#075E54",
    fontFamily: "Helvetica-Bold",
  },

  // Titre principal
  titleBlock: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EDEF",
  },
  chapterBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
    backgroundColor: "#ECFDF5",
    padding: "3 8",
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111B21",
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: 9,
    color: "#667781",
    marginTop: 4,
  },

  // Objectifs
  objectivesBox: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#25D366",
    borderRadius: 4,
  },
  objectivesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#075E54",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  objectivesText: {
    fontSize: 10,
    color: "#111B21",
    lineHeight: 1.4,
  },

  // Content wrapper
  content: {
    flex: 1,
  },

  // Watermark discret
  watermark: {
    position: "absolute",
    bottom: 40,
    right: 40,
    fontSize: 7,
    color: "#E9EDEF",
    fontStyle: "italic",
  },
});

/**
 * Document PDF pour un chapitre d'UL Study Flow.
 * Utilise @react-pdf/renderer + converter TipTap JSON.
 */
export const ChapterPDFDocument: React.FC<ChapterPDFDocumentProps> = ({
  ueTitle,
  ueCode,
  sessionNumber,
  sessionTitle,
  chapterNumber,
  chapterTitle,
  objectives,
  contentJson,
  contentHtml,
  generatedAt,
  studentName,
}) => {
  const date =
    generatedAt ||
    new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // Rendu du contenu : JSON prioritaire, sinon fallback texte brut
  let contentElement: React.ReactNode = null;
  if (contentJson && contentJson.content) {
    contentElement = renderTipTapContent(contentJson);
  } else if (contentHtml) {
    // Fallback : strip HTML tags et afficher en texte
    const plainText = contentHtml.replace(/<[^>]*>/g, "").trim();
    contentElement = (
      <Text style={styles.objectivesText}>
        {plainText || "Contenu non disponible."}
      </Text>
    );
  } else {
    contentElement = (
      <Text style={{ fontSize: 10, color: "#8696A0", fontStyle: "italic" }}>
        Aucun contenu n'a été rédigé pour ce chapitre.
      </Text>
    );
  }

  return (
    <Document
      title={`${ueCode} - Chapitre ${chapterNumber} : ${chapterTitle}`}
      author="UL Study Flow"
      subject={`Cours ${ueCode} - ${chapterTitle}`}
      creator="UL Study Flow"
      producer="UL Study Flow"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.headerBrand}>UL STUDYFLOW</Text>
              <Text style={styles.headerSubtext}>
                Apprendre · Comprendre · Progresser
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMetaBold}>{ueCode}</Text>
            <Text style={styles.headerMeta}>
              Séance {sessionNumber} · Chapitre {chapterNumber}
            </Text>
          </View>
        </View>

        {/* Titre du chapitre */}
        <View style={styles.titleBlock}>
          <Text style={styles.chapterBadge}>Chapitre {chapterNumber}</Text>
          <Text style={styles.chapterTitle}>{chapterTitle}</Text>
          <Text style={styles.chapterSubtitle}>
            {ueTitle} · Séance {sessionNumber} : {sessionTitle}
          </Text>
        </View>

        {/* Objectifs pédagogiques */}
        {objectives && (
          <View style={styles.objectivesBox}>
            <Text style={styles.objectivesLabel}>
              🎯 Objectifs pédagogiques
            </Text>
            <Text style={styles.objectivesText}>{objectives}</Text>
          </View>
        )}

        {/* Contenu riche */}
        <View style={styles.content}>{contentElement}</View>

        {/* Watermark discret */}
        {studentName && (
          <Text style={styles.watermark} fixed>
            Édité pour {studentName}
          </Text>
        )}

        {/* Footer avec numéro de page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Édité par UL Study Flow · ulstudyflow@gmail.com · {date}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
