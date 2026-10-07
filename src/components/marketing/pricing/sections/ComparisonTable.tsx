import React from 'react';
import { Clock } from 'lucide-react';
import { Container } from '../../ui/Container';
import { FeatureRow, FeatureCheck, FeatureCross } from '../ui/FeatureRow';

export const ComparisonTable: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#111B21] transition-colors">
      <Container>
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mb-3">
            Ce que tu reçois exactement dans chaque formule
          </h2>
          <p className="text-base text-[#667781] dark:text-[#8696A0]">
            La transparence fait partie intégrante de notre engagement envers la
            communauté universitaire de Lomé.
          </p>
        </div>

        {/* Conteneur scrollable (mobile) */}
        <div className="overflow-x-auto rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] shadow-sm bg-white dark:bg-[#111B21]">
          <table className="w-full text-left border-collapse min-w-[720px]">
            {/* En-tête du tableau */}
            <thead>
              <tr className="border-b border-[#E9EDEF] dark:border-[#222E35] bg-[#F0F2F5] dark:bg-[#0B141A]">
                <th className="py-4 px-5 text-sm font-bold text-[#111B21] dark:text-white w-2/5">
                  Contenu &amp; Ressources incluses
                </th>
                <th className="py-4 px-4 text-sm font-bold text-[#111B21] dark:text-white text-center w-1/5">
                  Séance 01 Gratuite
                </th>
                <th className="py-4 px-4 text-sm font-bold text-[#075E54] dark:text-[#25D366] text-center w-1/5">
                  Pack 1 UE (500 F)
                </th>
                <th className="py-4 px-4 text-sm font-bold text-[#075E54] dark:text-[#25D366] text-center w-1/5 bg-[#25D366]/10 dark:bg-[#25D366]/5 border-x border-[#25D366]/30">
                  Pack Semestre (300 F/UE)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
              {/* Ligne 0 : Durée de validité (mise en avant) */}
              <tr className="bg-[#25D366]/5 dark:bg-[#25D366]/10 font-semibold">
                <td className="py-4 px-5 text-sm font-bold text-[#075E54] dark:text-[#25D366]">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#25D366] mt-0.5 shrink-0" />
                    <div>
                      <span>Durée de validité de l'accès</span>
                      <p className="text-xs text-[#8696A0] font-normal mt-0.5">
                        À expiration, rachat requis pour réactiver
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-sm text-[#8696A0]">
                  Accès découverte permanent
                </td>
                <td className="py-4 px-4 text-center text-sm font-bold text-[#075E54] dark:text-[#25D366]">
                  6 mois et 10 jours
                  <span className="block text-xs font-normal text-[#8696A0]">
                    (Semestre + Rattrapages)
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-sm font-extrabold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/5 dark:bg-[#25D366]/10 border-x border-[#25D366]/30">
                  6 mois et 10 jours
                  <span className="block text-xs font-semibold text-[#25D366]">
                    (Semestre + Rattrapages)
                  </span>
                </td>
              </tr>

              {/* Ligne 1 : Fiches PDF */}
              <FeatureRow
                label="Fiches de synthèse PDF condensées (< 2 Mo)"
                description="Conformes au programme officiel LMD de l'UL"
                col1="1 fiche (Séance 1)"
                col2="Toutes les séances de l'UE"
                col3="Toutes les UEs du semestre"
              />

              {/* Ligne 2 : Podcasts audio */}
              <FeatureRow
                label="Podcasts audio de cours (Écoute zémidjan/maison)"
                description="Format compressé basse consommation de mégas"
                col1="1 podcast de 10 min"
                col2="Tous les chapitres audio"
                col3="Illimité pour tout le semestre"
              />

              {/* Ligne 3 : QCM */}
              <FeatureRow
                label="Banques de QCM &amp; Quiz d'auto-évaluation"
                description="Avec explications détaillées des erreurs"
                col1="5 questions test"
                col2="50+ questions ciblées"
                col3="300+ QCM types examens"
              />

              {/* Ligne 4 : Annales */}
              <FeatureRow
                label="Annales d'examens et sujets types corrigés"
                description="Sessions normales et sessions de rattrapage"
                col1={<FeatureCross />}
                col2="3 dernières années de l'UE"
                col3="5 dernières années + corrigés types"
              />

              {/* Ligne 5 : Mode hors-ligne */}
              <FeatureRow
                label="Mode Hors-Ligne (Zéro crédit nécessaire après chargement)"
                col1={<FeatureCross />}
                col2={<FeatureCheck />}
                col3={<FeatureCheck />}
              />

              {/* Ligne 6 : Assistance WhatsApp */}
              <FeatureRow
                label="Assistance &amp; Réponses aux questions via WhatsApp Campus"
                col1={<FeatureCross />}
                col2="Standard (24h)"
                col3="Prioritaire veille d'examens (1h)"
              />

              {/* Ligne 7 : Bonus Guide méthodologique */}
              <tr className="bg-[#25D366]/10 dark:bg-[#25D366]/5">
                <td className="py-4 px-5 text-sm font-medium text-[#075E54] dark:text-[#25D366]">
                  Bonus : Guide méthodologique de rédaction d'examens LMD
                </td>
                <td className="py-4 px-4 text-center">
                  <FeatureCross />
                </td>
                <td className="py-4 px-4 text-center">
                  <FeatureCross />
                </td>
                <td className="py-4 px-4 text-center bg-[#25D366]/10 dark:bg-[#25D366]/5 border-x border-[#25D366]/30">
                  <span className="text-[#25D366] font-bold text-sm inline-flex items-center gap-1 justify-center">
                    <FeatureCheck /> Inclus offert
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note sous le tableau */}
        <p className="text-center text-xs text-[#8696A0] mt-6">
          💡 Les durées de validité (6 mois et 10 jours) couvrent l'intégralité du
          semestre universitaire et la période officielle des rattrapages.
        </p>
      </Container>
    </section>
  );
};