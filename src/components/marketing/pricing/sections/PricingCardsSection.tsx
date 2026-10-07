import React from 'react';
import { Lock, BookOpen, Award, ArrowRight, Star } from 'lucide-react';
import { Container } from '../../ui/Container';
import { PricingCard, PricingFeature } from '../ui/PricingCard';

interface PricingCardsSectionProps {
  onGetStarted: () => void;
}

export const PricingCardsSection: React.FC<PricingCardsSectionProps> = ({
  onGetStarted,
}) => {
  // ─────────────────────────────────────────────
  // Carte 1 : Séance 01 Gratuite
  // ─────────────────────────────────────────────
  const freeFeatures: PricingFeature[] = [
    {
      label: "1ère séance complète de l'UE choisie (FASEG, FDD, FDS, FLLA)",
      included: true,
    },
    {
      label: 'Fiche de cours PDF condensée ultra légère (< 2 Mo)',
      included: true,
    },
    {
      label: 'Écoute audio podcast 10 min (faible data)',
      included: true,
    },
    {
      label: "QCM d'auto-évaluation 5 questions avec corrigés",
      included: true,
    },
    {
      label: 'Accès direct sans carte bancaire ni formalités',
      included: true,
    },
  ];

  // ─────────────────────────────────────────────
  // Carte 2 : Pack Unité (1 UE) — 500 F
  // ─────────────────────────────────────────────
  const singleUeFeatures: PricingFeature[] = [
    {
      label: "Toutes les séances de l'UE pour 6 mois et 10 jours complets",
      included: true,
      emphasized: true,
    },
    {
      label: 'Fiches de synthèse téléchargeables conformes LMD',
      included: true,
    },
    {
      label: 'Tous les podcasts audio pour réviser',
      included: true,
    },
    {
      label: "QCM & Flashcard pour tester ta comprehension",
      included: true,
    },
    {
      label: 'Accès hors-ligne illimité sans consommer tes mégas',
      included: true,
    },
    {
      label: 'Support questions sur WhatsApp Campus Lomé',
      included: true,
    },
    {
      label:
        "À l'expiration des 6 mois et 10 jours, rachat requis pour réactivation.",
      included: true,
      description:
        'Le pack reste accessible pendant toute la durée officielle du semestre et des rattrapages.',
    },
  ];

  // ─────────────────────────────────────────────
  // Carte 3 : Pack Semestre (3 à 6 UEs) — 300 F/UE
  // ─────────────────────────────────────────────
  const packSemesterFeatures: PricingFeature[] = [
    {
      label: 'Accès intégral pendant 6 mois et 10 jours aux UEs majeures',
      included: true,
      emphasized: true,
    },
    {
      label: 'Fiches synthétiques + Cours audios complets',
      included: true,
    },
    {
      label: "Banques de QCM d'entraînement types examens UL",
      included: true,
    },
    {
      label: 'Priorité assistance pédagogique WhatsApp Lomé 7j/7',
      included: true,
    },
    {
      label: 'Bonus offert : Guide méthodologique LMD UL',
      included: true,
      emphasized: true,
    },
    {
      label:
        'Accès automatiquement clôturé à terme des 6 mois et 10 jours. Réactivation par réabonnement.',
      included: true,
      description:
        'Réabonnement simple possible sur la même UE si tu refais le semestre.',
    },
  ];

  return (
    <section
      id="offres"
      className="py-12 -mt-10 relative z-10"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Carte 1 : Séance gratuite */}
          <PricingCard
            variant="default"
            badge="Découverte Campus"
            badgeIcon={<Lock className="w-5 h-5" />}
            title="Séance 01 Gratuite"
            subtitle="Teste la qualité pédagogique de n'importe quelle matière avant de t'engager."
            price="0 F"
            priceUnit="CFA / Pour toujours"
            features={freeFeatures}
            ctaLabel="Tester une séance gratuite"
            ctaHint="Aucun engagement requis"
            onCta={onGetStarted}
          />

          {/* Carte 2 : Pack 1 UE */}
          <PricingCard
            variant="highlight"
            badge="À la Carte"
            badgeIcon={<BookOpen className="w-6 h-6" />}
            title="Pack Unité (1 UE)"
            subtitle="Idéal pour cibler une seule matière 'difficile'."
            price="500 F"
            priceUnit="CFA / Paiement unique"
            validityNote={
              <>
                Validité garantie : <strong>6 mois et 10 jours</strong>{' '}
                (Semestre + Rattrapages inclus)
              </>
            }
            features={singleUeFeatures}
            ctaLabel="Débloquer une UE (500 F)"
            ctaIcon={<Lock className="w-4 h-4" />}
            ctaHint={
              <span className="flex items-center justify-center gap-2">
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  T-Money
                </span>
                <span className="text-[#8696A0]">•</span>
                <span className="text-sky-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Flooz
                </span>
              </span>
            }
            onCta={onGetStarted}
          />

          {/* Carte 3 : Pack Semestre — Vedette */}
          <PricingCard
            variant="featured"
            badge="Le choix de 85% des étudiants de Lomé"
            badgeIcon={<Star className="w-5 h-5 fill-[#25D366] text-[#25D366]" />}
            title="Pack Semestre (3 à 6 UEs)"
            subtitle="L'assurance tout-en-un pour valider son semestre Harmattan ou Mousson du premier coup."
            price="300 F"
            priceUnit="CFA / UE"
            priceOriginal="2 500 F CFA"
            priceNote={
              <span className="bg-[#25D366]/20 text-[#25D366] text-xs font-bold px-2 py-0.5 rounded-full border border-[#25D366]/30">
                1 500 F CFA le pack complet de 5 UEs
              </span>
            }
            validityNote={
              <>
                Validité garantie : <strong>6 mois et 10 jours</strong>{' '}
                (Semestre + Rattrapages inclus)
              </>
            }
            features={packSemesterFeatures}
            ctaLabel="Prendre le Pack Semestre (dès 300 F/UE)"
            ctaIcon={<ArrowRight className="w-4 h-4" />}
            ctaHint="Paiement immédiat par USSD Flooz ou T-Money"
            onCta={onGetStarted}
          />
        </div>
      </Container>
    </section>
  );
};