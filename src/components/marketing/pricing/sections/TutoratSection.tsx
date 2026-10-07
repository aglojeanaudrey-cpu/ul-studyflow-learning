import React from 'react';
import { MessageCircle, Video, Check, ArrowUpRight, Zap, Headset } from 'lucide-react';
import { Container } from '../../ui/Container';

interface TutoratSectionProps {
  onSelectFormula?: (formula: 'whatsapp-audio' | 'meet-video') => void;
}

export const TutoratSection: React.FC<TutoratSectionProps> = ({
  onSelectFormula,
}) => {
  const handleSelect = (formula: 'whatsapp-audio' | 'meet-video') => {
    onSelectFormula?.(formula);
    // Scroll vers le widget de réservation
    const widget = document.getElementById('booking-widget');
    if (widget) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const whatsappFeatures = [
    {
      label: (
        <>
          <strong>Échanges vocaux WhatsApp dédiés</strong> et structurés pas à pas
        </>
      ),
    },
    {
      label: "Résolution guidée d'exercices et d'équations en photo / audio",
    },
    {
      label: 'Envoi de fiches méthodologiques exclusives rédigées par le tuteur',
    },
    {
      label: "Compte-rendu de fin de séance avec axes d'amélioration LMD",
    },
  ];

  const videoFeatures = [
    {
      label: (
        <>
          <strong>Visio 1-on-1 (Google Meet ou WhatsApp Vidéo)</strong> avec
          partage d'écran
        </>
      ),
    },
    {
      label:
        'Résolution en direct sur tableau blanc numérique (Micro, Algèbre, Stats)',
    },
    {
      label:
        'Entraînement chronométré aux cas pratiques juridiques & commentaires',
    },
    {
      label: 'Enregistrement vidéo de la séance fourni + corrigé PDF annoté',
    },
  ];

  return (
    <section
      id="tutorat"
      className="py-16 sm:py-20 bg-linear-to-b from-[#25D366]/5 via-white to-[#F0F2F5]/50 dark:from-[#25D366]/5 dark:via-[#111B21] dark:to-[#0B141A] border-y border-[#25D366]/20 relative overflow-hidden"
    >
      {/* Halo décoratif */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase mb-3 shadow-sm">
            <Headset className="w-4 h-4" />
            <span>
              Nouveau • Tutorat en ligne personnalisé &amp; Coaching LMD
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mb-3">
            Un tuteur major de promo UL dédié pour débloquer tes matières
          </h2>

          <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0]">
            Besoin d'un accompagnement sur-mesure sur un chapitre complexe, un
            devoir de TD ou une méthodologie de cas pratique ? Réserve une
            séance individuelle intensive de <strong>1h30</strong> avec nos
            tuteurs certifiés.
          </p>
        </div>

        {/* 2 formules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Formule 1 : WhatsApp Audio */}
          <div className="bg-white dark:bg-[#111B21] rounded-2xl p-6 sm:p-8 border-2 border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366] transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] text-xs font-bold">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Formule 1 • WhatsApp Asynchrone &amp; Vocal
                </span>
                <span className="text-xs font-bold text-[#8696A0] uppercase tracking-wider">
                  Durée : 1h30
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#111B21] dark:text-white mb-2">
                Tutorat Écrit &amp; Audio WhatsApp
              </h3>

              <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed mb-6">
                Idéal pour éclaircir des points de cours flous, préparer une
                fiche de TD ou poser des questions ciblées sans consommer de
                data vidéo.
              </p>

              <div className="flex items-baseline gap-2 pb-6 border-b border-[#E9EDEF] dark:border-[#222E35] mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-[#25D366]">
                  1 000 F
                </span>
                <span className="text-sm text-[#667781] dark:text-[#8696A0]">
                  CFA / Séance complète de 1h30 (90 min)
                </span>
              </div>

              <ul className="space-y-3 text-sm">
                {whatsappFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                    <span className="text-[#111B21] dark:text-slate-300">
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleSelect('whatsapp-audio')}
                className="w-full py-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366] text-[#075E54] dark:text-[#25D366] font-bold text-sm hover:bg-[#25D366] hover:text-[#075E54] transition-colors flex items-center justify-center gap-2"
              >
                <span>Choisir Formule WhatsApp (1 000 F)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Formule 2 : Vidéo en direct */}
          <div className="relative bg-white dark:bg-[#111B21] rounded-2xl p-6 sm:p-8 border-2 border-[#25D366] shadow-md hover:shadow-lg flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#25D366] text-[#075E54] text-xs font-bold uppercase shadow-sm flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Recommandé examens &amp; TD</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#075E54] text-[#25D366] text-xs font-bold">
                  <Video className="w-3.5 h-3.5" />
                  Formule 2 • Visioconférence Directe
                </span>
                <span className="text-xs font-bold text-[#8696A0] uppercase tracking-wider">
                  Durée : 1h30
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#111B21] dark:text-white mb-2">
                Tutorat Vidéo en Direct
              </h3>

              <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed mb-6">
                Interaction visuelle en direct sur Google Meet ou WhatsApp Vidéo.
                Tableau blanc virtuel, démonstrations et corrections
                instantanées.
              </p>

              <div className="flex items-baseline gap-2 pb-6 border-b border-[#E9EDEF] dark:border-[#222E35] mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#25D366]">
                  1 500 F
                </span>
                <span className="text-sm text-[#667781] dark:text-[#8696A0]">
                  CFA / Séance complète de 1h30 (90 min)
                </span>
              </div>

              <ul className="space-y-3 text-sm">
                {videoFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                    <span className="text-[#111B21] dark:text-slate-300">
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleSelect('meet-video')}
                className="w-full py-3.5 rounded-xl bg-[#075E54] text-white font-bold text-sm hover:bg-[#0a6b5f] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Choisir Formule Vidéo Direct (1 500 F)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};