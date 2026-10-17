import React from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Scale,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface LegalModalProps {
  type: "privacy" | "terms" | "mentions" | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const config = {
    privacy: {
      title: "Politique de Confidentialité",
      icon: ShieldCheck,
      subtitle: "Comment nous protégeons vos données personnelles",
    },
    terms: {
      title: "Conditions Générales d'Utilisation",
      icon: FileText,
      subtitle: "Les règles d'usage de la plateforme UL Study Flow Learning",
    },
    mentions: {
      title: "Mentions Légales",
      icon: Scale,
      subtitle: "Informations légales sur l'éditeur et l'hébergeur",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111B21] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] dark:border-[#222E35] my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white p-1.5 rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          {/* En-tête */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
              <Icon className="w-6 h-6 text-[#25D366]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-[#111B21] dark:text-white">
                {config.title}
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                {config.subtitle}
              </p>
              <p className="text-[10px] text-[#667781] dark:text-[#8696A0] mt-1">
                Dernière mise à jour : Octobre 2026
              </p>
            </div>
          </div>

          {/* Contenu */}
          <div className="prose prose-sm max-w-none text-xs text-slate-700 dark:text-[#E9EDEF] leading-relaxed space-y-4 pt-3 border-t border-[#E9EDEF] dark:border-[#222E35]">
            {type === "privacy" && <PrivacyContent />}
            {type === "terms" && <TermsContent />}
            {type === "mentions" && <MentionsContent />}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E9EDEF] dark:border-[#222E35] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[10px] text-[#667781] dark:text-[#8696A0] italic">
              En utilisant UL Study Flow Learning, vous acceptez ces documents.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54] shrink-0"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONTENU : Politique de Confidentialité
// ═══════════════════════════════════════════════════════════════

function PrivacyContent() {
  return (
    <>
      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        1. Responsable du traitement
      </h4>
      <p>
        UL Study Flow Learning est un projet pédagogique étudiant, édité par{" "}
        <strong>Kokou Jean-Audrey Aglo</strong>, étudiant à l'Université de
        Lomé, Togo. Contact :{" "}
        <a
          href="mailto:ulstudyflow@gmail.com"
          className="text-[#075E54] dark:text-[#25D366] underline"
        >
          ulstudyflow@gmail.com
        </a>
        .
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        2. Données collectées
      </h4>
      <p>Nous collectons uniquement les données nécessaires au service :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Identification</strong> : prénom, nom, numéro de téléphone,
          email (optionnel), filière, niveau, département
        </li>
        <li>
          <strong>Activité pédagogique</strong> : progression dans les séances,
          scores aux quiz, utilisation de l'assistant IA
        </li>
        <li>
          <strong>Logs techniques</strong> : adresse IP, type de navigateur,
          date de connexion (pour la sécurité)
        </li>
        <li>
          <strong>Notifications</strong> : messages envoyés par l'administration
        </li>
      </ul>
      <p className="italic text-[#667781] dark:text-[#8696A0]">
        Nous ne collectons <strong>aucune donnée bancaire</strong>. Les
        paiements sont effectués via Mix by Yas ou Flooz Togo, hors de notre
        plateforme.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        3. Finalités du traitement
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Fournir l'accès aux cours, quiz et à l'assistant IA</li>
        <li>Suivre votre progression pédagogique</li>
        <li>Gérer les demandes de déblocage d'UE</li>
        <li>Envoyer des notifications (annonces, rappels)</li>
        <li>Assurer la sécurité de la plateforme</li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        4. Durée de conservation
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Compte actif</strong> : conservé tant que vous vous connectez
          au moins une fois tous les 2 ans
        </li>
        <li>
          <strong>Compte inactif</strong> : suppression automatique après 2 ans
          sans connexion
        </li>
        <li>
          <strong>Logs de sécurité</strong> : conservés 6 mois (obligation
          légale)
        </li>
        <li>
          <strong>Progression</strong> : conservée tant que votre compte existe
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        5. Vos droits
      </h4>
      <p>Conformément aux principes de protection des données, vous pouvez :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Accéder</strong> à toutes vos données (export disponible dans
          votre profil)
        </li>
        <li>
          <strong>Rectifier</strong> vos informations (via la page Profil)
        </li>
        <li>
          <strong>Supprimer</strong> votre compte (en envoyant un email à
          ulstudyflow@gmail.com)
        </li>
        <li>
          <strong>Vous opposer</strong> au traitement (dans les cas prévus par
          la loi)
        </li>
      </ul>
      <p>
        Toute demande sera traitée sous <strong>30 jours maximum</strong>.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        6. Sous-traitants et hébergement
      </h4>
      <p>
        Vos données sont hébergées chez des prestataires techniques de confiance
        :
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Render Services Inc.</strong> (hébergement backend) —
          États-Unis
        </li>
        <li>
          <strong>Supabase Inc.</strong> (base de données PostgreSQL) — Union
          Européenne
        </li>
        <li>
          <strong>Cloudinary Ltd.</strong> (stockage vidéos/audios sécurisés) —
          États-Unis
        </li>
        <li>
          <strong>Cloudflare Inc.</strong> (hébergement frontend + CDN) —
          États-Unis
        </li>
        <li>
          <strong>Google LLC</strong> (assistant IA Gemini) — États-Unis
        </li>
      </ul>
      <p className="italic text-[#667781] dark:text-[#8696A0]">
        Ces prestataires sont liés par des engagements de confidentialité et
        n'utilisent pas vos données à des fins commerciales.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        7. Sécurité
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>Mots de passe chiffrés (PBKDF2 + SHA-512, sel unique)</li>
        <li>Connexions chiffrées en HTTPS (TLS 1.3)</li>
        <li>Vidéos protégées par watermark dynamique + URLs signées</li>
        <li>
          Row-Level Security (RLS) activée sur toutes les tables sensibles
        </li>
        <li>Authentification par cookie HttpOnly (protection XSS)</li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        8. Cookies
      </h4>
      <p>Nous utilisons uniquement des cookies techniques :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>ulsf_session_v2</strong> : cookie d'authentification
          (HttpOnly, Secure, SameSite=None)
        </li>
        <li>
          <strong>csrftoken</strong> : protection contre les attaques CSRF
        </li>
      </ul>
      <p className="italic text-[#667781] dark:text-[#8696A0]">
        Aucun cookie publicitaire ou de tracking tiers n'est utilisé. Pas de
        bannière nécessaire.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        9. Contact
      </h4>
      <p>
        Pour toute question relative à vos données personnelles :{" "}
        <a
          href="mailto:ulstudyflow@gmail.com"
          className="text-[#075E54] dark:text-[#25D366] underline"
        >
          ulstudyflow@gmail.com
        </a>
      </p>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTENU : Conditions Générales d'Utilisation
// ═══════════════════════════════════════════════════════════════

function TermsContent() {
  return (
    <>
      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        1. Objet de la plateforme
      </h4>
      <p>
        UL Study Flow Learning est une plateforme EdTech indépendante, créée par
        des étudiants de l'Université de Lomé pour les étudiants. Elle fournit
        un accompagnement pédagogique complémentaire : résumés de cours,
        podcasts audio, vidéos explicatives, fiches synthétiques, quiz
        d'auto-évaluation et assistant IA.
      </p>
      <p className="italic text-[#667781] dark:text-[#8696A0]">
        UL Study Flow Learning <strong>n'est pas</strong> une plateforme
        officielle de l'Université de Lomé. Elle ne remplace en aucun cas les
        cours dispensés par les enseignants.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        2. Inscription et compte
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          L'inscription est <strong>gratuite</strong> et réservée aux étudiants
          (filière et niveau requis)
        </li>
        <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
        <li>
          Toute utilisation frauduleuse (partage de compte, revente d'accès)
          entraîne la <strong>suspension immédiate</strong> du compte
        </li>
        <li>Un compte inactif pendant 2 ans est automatiquement supprimé</li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        3. Accès aux contenus
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>1ère séance</strong> de chaque UE : <strong>gratuite</strong>{" "}
          et accessible à tous les étudiants inscrits
        </li>
        <li>
          <strong>Séances suivantes</strong> : accessibles après déblocage de
          l'UE (détails ci-dessous)
        </li>
        <li>
          L'accès à une UE débloquée est valable{" "}
          <strong>6 mois et 10 jours</strong> à compter de la date de validation
          du paiement
        </li>
        <li>
          Après expiration, l'accès peut être prolongé par une nouvelle demande
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        4. Tarification et paiement
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Une UE</strong> : <strong>500 FCFA</strong>
        </li>
        <li>
          <strong>À partir de 3 UE achetées simultanément</strong> :{" "}
          <strong>300 FCFA par UE</strong> (soit 900 FCFA pour 3 UE)
        </li>
        <li>
          Les paiements sont effectués via <strong>Mix by Yas</strong> ou{" "}
          <strong>Flooz Togo</strong> (hors plateforme), puis validés
          manuellement par l'administration
        </li>
        <li>
          Les codes promotionnels (parrainage) peuvent donner accès à une UE
          gratuite
        </li>
      </ul>
      <p className="italic text-[#667781] dark:text-[#8696A0]">
        <strong>Important</strong> : les paiements ne sont pas remboursables une
        fois le déblocage effectué. Si un problème technique empêche l'accès,
        contactez l'administration pour résolution sous 48h.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        5. Propriété intellectuelle
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Les cours, fiches, vidéos, audios et quiz sont la propriété exclusive
          de UL Study Flow Learning et de ses auteurs
        </li>
        <li>
          <strong>
            Le téléchargement, la capture d'écran, l'enregistrement d'écran ou
            le partage des contenus sont strictement interdits
          </strong>
        </li>
        <li>
          Chaque contenu vidéo/audio est marqué d'un{" "}
          <strong>watermark nominatif</strong> (nom + téléphone de l'étudiant)
          pour tracer toute fuite
        </li>
        <li>
          Toute violation entraîne la{" "}
          <strong>suspension immédiate du compte</strong> et pourra faire
          l'objet de poursuites
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        6. Règles de conduite
      </h4>
      <p>Il est strictement interdit de :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Partager vos identifiants avec un tiers</li>
        <li>Revendre ou redistribuer les contenus</li>
        <li>Tenter de contourner les protections techniques</li>
        <li>Utiliser l'assistant IA pour du plagiat ou de la triche</li>
        <li>Publier des avis faux ou diffamatoires</li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        7. Assistant IA
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          L'assistant IA (Gemini) est un outil pédagogique d'aide à la
          compréhension
        </li>
        <li>
          Ses réponses peuvent contenir des erreurs — vérifiez toujours auprès
          de vos enseignants
        </li>
        <li>
          En mode "contexte de cours", l'IA se base sur le contenu de votre UE
          débloquée
        </li>
        <li>
          En mode "général", l'IA répond hors contexte et le signale clairement
        </li>
        <li>
          L'accès à l'IA peut être temporairement suspendu par l'administration
          en cas d'abus
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        8. Suspension et résiliation
      </h4>
      <p>
        L'administration se réserve le droit de suspendre ou supprimer un compte
        en cas de :
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Violation des présentes CGU</li>
        <li>Partage ou revente de contenus</li>
        <li>Comportement abusif envers l'équipe ou d'autres étudiants</li>
        <li>Tentative de piratage ou de contournement</li>
      </ul>
      <p>
        Aucun remboursement ne sera effectué en cas de suspension pour violation
        des CGU.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        9. Responsabilité
      </h4>
      <p>
        UL Study Flow Learning met tout en œuvre pour assurer la disponibilité
        et la qualité du service, mais ne peut être tenu responsable de :
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Interruptions techniques indépendantes de sa volonté</li>
        <li>Perte de données due à un problème chez un sous-traitant</li>
        <li>Utilisation faite par l'étudiant des contenus fournis</li>
        <li>
          Résultats académiques obtenus après utilisation de la plateforme
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        10. Modification des CGU
      </h4>
      <p>
        Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs
        seront notifiés par notification in-app au moins{" "}
        <strong>7 jours</strong> avant l'entrée en vigueur des modifications.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        11. Droit applicable
      </h4>
      <p>
        Les présentes CGU sont soumises au droit togolais. Tout litige sera
        soumis à la compétence des tribunaux de Lomé, après tentative de
        résolution amiable via ulstudyflow@gmail.com.
      </p>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTENU : Mentions Légales
// ═══════════════════════════════════════════════════════════════

function MentionsContent() {
  return (
    <>
      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        1. Éditeur de la plateforme
      </h4>
      <div className="space-y-1">
        <p>
          <strong>Nom</strong> : Kokou Jean-Audrey Aglo
        </p>
        <p>
          <strong>Statut</strong> : Projet étudiant indépendant, à but
          pédagogique
        </p>
        <p>
          <strong>Localisation</strong> : Lomé, Togo
        </p>
        <p>
          <strong>Contact email</strong> :{" "}
          <a
            href="mailto:ulstudyflow@gmail.com"
            className="text-[#075E54] dark:text-[#25D366] underline"
          >
            ulstudyflow@gmail.com
          </a>
        </p>
        <p>
          <strong>WhatsApp</strong> : +228 71 67 69 45
        </p>
      </div>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        2. Directeur de la publication
      </h4>
      <p>Kokou Jean-Audrey Aglo, en qualité d'initiateur du projet.</p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        3. Hébergement
      </h4>
      <p>La plateforme est hébergée par plusieurs prestataires techniques :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Render Services Inc.</strong> (backend Django) — 525 Brannan
          Street, Suite 300, San Francisco, CA 94107, États-Unis
        </li>
        <li>
          <strong>Cloudflare Inc.</strong> (frontend + CDN) — 101 Townsend St,
          San Francisco, CA 94107, États-Unis
        </li>
        <li>
          <strong>Supabase Inc.</strong> (base de données) — 970 Toa Payoh
          North, Singapour
        </li>
        <li>
          <strong>Cloudinary Ltd.</strong> (médias) — 3401 Hillview Ave, Palo
          Alto, CA 94304, États-Unis
        </li>
      </ul>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        4. Propriété intellectuelle
      </h4>
      <p>
        L'ensemble des contenus (textes, vidéos, audios, images, logo, code)
        présents sur UL Study Flow Learning est protégé par le droit d'auteur.
        Toute reproduction, même partielle, est interdite sans autorisation
        écrite préalable.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        5. Marque et logo
      </h4>
      <p>
        La marque <strong>UL Study Flow Learning</strong> et son logo sont la
        propriété exclusive du projet. Toute utilisation commerciale sans
        autorisation est interdite.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        6. Signalement de contenu illicite
      </h4>
      <p>
        Si vous constatez un contenu illicite (atteinte à la vie privée, contenu
        haineux, plagiat), signalez-le immédiatement à{" "}
        <a
          href="mailto:ulstudyflow@gmail.com"
          className="text-[#075E54] dark:text-[#25D366] underline"
        >
          ulstudyflow@gmail.com
        </a>
        . Toute demande sera traitée sous 48h.
      </p>

      <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
        7. Droit applicable
      </h4>
      <p>
        Le présent site est soumis au droit togolais. En cas de litige, les
        tribunaux de Lomé sont seuls compétents.
      </p>
    </>
  );
}
