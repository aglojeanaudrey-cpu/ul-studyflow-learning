import React from 'react';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { Container } from '../../ui/Container';

export const MobileMoneySection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Sélectionne ton UE ou Pack',
      description:
        'Choisis ta faculté (FASEG, FDD, FDS, FLLA, FSHS), ton niveau (Licence 1, 2, 3 ou Master) et clique sur débloquer la ou les matières voulues.',
    },
    {
      number: '2',
      title: 'Saisis ton numéro à 8 chiffres',
      description:
        'Indique ton numéro T-Money ou Moov Flooz. Le système détecte automatiquement ton opérateur local togolais sans frais additionnels.',
    },
    {
      number: '3',
      title: 'Valide le push sur ton mobile',
      description:
        "Une invite USSD s'affiche directement sur l'écran de ton téléphone. Tape ton code secret habituel. Ton accès se déverrouille instantanément.",
      highlight: true,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors">
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase mb-3">
            <CreditCard className="w-4 h-4" />
            <span>Paiement local 100% mobile money</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mb-3">
            Simple comme un envoi de crédit. Activé en 5 secondes chrono.
          </h2>

          <p className="text-base text-[#667781] dark:text-[#8696A0]">
            Pas besoin de carte bancaire Visa ou Mastercard. Tout s'effectue
            avec le numéro de ton téléphone portable togolais.
          </p>

          {/* Badges opérateurs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-700/40 text-[#111B21] dark:text-white shadow-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
              <span className="text-xs font-bold">Togocom T-Money</span>
              <span className="text-xs text-[#8696A0]">(70, 90, 91, 92, 93)</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/20 border border-sky-300/60 dark:border-sky-700/40 text-[#111B21] dark:text-white shadow-sm">
              <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              <span className="text-xs font-bold">Moov Africa Flooz</span>
              <span className="text-xs text-[#8696A0]">(96, 97, 98, 99)</span>
            </div>
          </div>
        </div>

        {/* 3 étapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white dark:bg-[#111B21] p-8 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] relative"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-5 ${
                  step.highlight
                    ? 'bg-[#25D366] text-[#075E54]'
                    : 'bg-[#25D366]/15 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366]'
                }`}
              >
                {step.number}
              </div>
              <h3 className="text-base font-bold text-[#111B21] dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Carte garantie zéro engagement */}
        <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-[#111B21] border border-[#25D366]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#075E54] dark:text-[#25D366] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#111B21] dark:text-white">
                Sécurité, Clarté &amp; Validité Maîtrisée
              </h4>
              <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-0.5">
                Aucun prélèvement automatique mensuel caché. Chaque paiement
                donne accès pendant <strong>6 mois et 10 jours</strong>, couvrant
                l'intégralité du semestre et des rattrapages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Lock className="w-4 h-4 text-[#25D366]" />
            <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              Transactions chiffrées &amp; certifiées
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
};