import React from "react";
import { Star, TrendingDown, TrendingUp, Quote, PiggyBank } from "lucide-react";
import { Container } from "../../ui/Container";
import Afiwa from "@/src/assets/images/afiwa.jpg";

export const TestimonialSection: React.FC = () => {
  return (
    <section
      id="avis"
      className="py-16 sm:py-20 bg-[#F0F2F5]/60 dark:bg-[#0B141A]/60 border-t border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Colonne gauche : image + badge flottant */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#25D366]/30">
              <img
                src={Afiwa}
                alt="Étudiante de l'Université de Lomé sur le campus"
                className="w-full h-[420px] object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Badge flottant bas */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#111B21]/95 backdrop-blur-md p-4 rounded-xl border border-white/40 shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-[#075E54] dark:text-[#25D366]">
                    Afi Mawuena D.
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                  Licence 2 Sciences Économiques &amp; Gestion (FASEG) • Campus
                  de Lomé
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite : quote + comparaison budget */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase mb-4">
              <PiggyBank className="w-4 h-4" />
              <span>Économie réelle sur le budget étudiant</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21] dark:text-white tracking-tight mb-4 leading-tight">
              « J'ai dépensé 1 500 F au lieu de 12 000 F en photocopies
              illisibles à l'Amphi 600. »
            </h2>

            <p className="text-base sm:text-lg text-[#667781] dark:text-[#8696A0] mb-6 leading-relaxed">
              « Chaque semestre, le budget photocopie devant la FASEG ou le
              restaurant universitaire est un vrai casse-tête. Avec le pack
              semestre UL STUDY FLOW payé en 30 secondes sur mon T-Money, j'ai
              eu tous mes résumés propres et les podcasts audios pendant le
              trajet Adidogomé-Campus, valides 6 mois et 10 jours complets
              jusqu'au rattrapage. En plus, une séance de tutorat Meet de 1h30
              avant l'examen m'a permis d'obtenir 15/20 en Microéconomie.
              Résultat : semestre validé avec 14,2 de moyenne sans stress. »
            </p>

            {/* Comparaison budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#E9EDEF] dark:border-[#222E35]">
              {/* Méthode traditionnelle */}
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Méthode traditionnelle
                </span>
                <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                  ~12 000 F CFA
                </p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 leading-relaxed">
                  Polycopiés papiers lourds, polycopiés incomplets, photocopies
                  noircies aux amphis.
                </p>
              </div>

              {/* Avec UL Study Flow */}
              <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/40">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] dark:text-[#25D366] uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Avec UL STUDY FLOW
                </span>
                <p className="text-2xl font-extrabold text-[#075E54] dark:text-[#25D366] mt-1">
                  1 500 F CFA
                </p>
                <p className="text-xs text-[#075E54]/80 dark:text-[#25D366]/80 mt-1 leading-relaxed font-medium">
                  Pack 5 UEs complet : audio + fiches + QCM + accès garanti 6
                  mois et 10 jours.
                </p>
              </div>
            </div>

            {/* Citation décorative */}
            <div className="mt-6 flex items-start gap-3 text-xs text-[#8696A0] italic">
              <Quote className="w-4 h-4 shrink-0 mt-0.5 text-[#25D366]" />
              <span>
                Témoignage authentique d'une étudiante FASEG, semestre Harmattan
                2025-2026.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
