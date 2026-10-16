import React from "react";
import { Globe, Network, CloudDownload, Wallet, Verified } from "lucide-react";
import { Container } from "../../ui/Container";
import testimonialImage from "@/src/assets/images/Reality.jpg";

interface Pillar {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    icon: <Network className="w-5 h-5" />,
    title: "Économie extrême de Data Internet",
    description:
      "Moins de 2 Mo par fiche téléchargeable. Un pass internet WhatsApp ou 150 F Moov/Togocom suffit pour tout réviser.",
  },
  {
    icon: <CloudDownload className="w-5 h-5" />,
    title: "Mode 100% Hors-ligne",
    description:
      "Une fois le cours ou PDF enregistré sur ton téléphone, coupe ta connexion et étudie sans aucune distraction.",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: "Micro-paiement Flooz & T-Money",
    description:
      "Pas d'abonnement mensuel piégeur ni de carte bancaire Visa/Mastercard. Tu ne paies que l'UE que tu souhaites travailler.",
  },
];

export const TogoRealitiesSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#F0F2F5] dark:bg-[#0B141A] border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Colonne gauche : Texte + 3 piliers */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 px-3.5 py-1 rounded-full">
              <Globe className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] tracking-wide">
                100% RÉALITÉS TOGOLAISES
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#075E54] dark:text-white tracking-tight leading-tight">
              Conçu sur-mesure pour les réalités du Togo & de l'UL
            </h2>

            <p className="text-base text-[#667781] dark:text-[#8696A0] leading-relaxed">
              Nous savons qu'étudier au campus universitaire de Lomé impose des
              contraintes uniques : forfaits limités, coupures de réseau et
              budgets serrés. Notre technologie a été allégée pour fonctionner
              même sur une connexion 3G instable.
            </p>

            {/* Les 3 piliers */}
            <div className="space-y-5 pt-2">
              {PILLARS.map((pillar, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#075E54] dark:text-[#25D366] mb-1">
                      {pillar.title}
                    </h4>
                    <p className="text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite : Image + badge témoignage */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-[#25D366]/30 bg-white dark:bg-[#111B21] shadow-2xl">
              <div className="h-80 md:h-115 w-full relative">
                <img
                  src={testimonialImage}
                  alt="Étudiant de l'Université de Lomé en train de réviser"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#075E54]/60 via-transparent to-transparent" />

                {/* Badge témoignage */}
                <div className="absolute bottom-6 right-6 backdrop-blur-md bg-white/95 dark:bg-[#111B21]/95 border border-[#25D366]/30 p-4 rounded-2xl shadow-xl max-w-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#25D366]">
                    <Verified className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Témoignage vérifié UL
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#111B21] dark:text-white leading-snug">
                    « Grâce aux QCM et fiche hors-ligne, j'ai validé la
                    Macroéconomie à 14,5 sans stress ni difficultés. »
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
