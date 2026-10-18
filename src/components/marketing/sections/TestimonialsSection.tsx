import React from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Container } from "../ui/Container";
import { SectionBadge } from "../ui/SectionBadge";
import { SectionHeader } from "../ui/SectionHeader";
import Ela from "@/src/assets/images/ela.webp";
import Koffi from "@/src/assets/images/koffi.webp";
import Afiwa from "@/src/assets/images/afiwa.webp";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "En amphi 1500, c'était impossible de tout noter. Grâce aux fiches et aux quiz Ul-StudyFlow-Learning, j'ai validé ma Microéconomie avec 15/20 sans rattrapages !",
    name: "Koffi Mensah",
    role: "FASEG · Semestre 2",
    avatar: Koffi,
  },
  {
    quote:
      "Le déblocage par T-Money à 300 F est presque immédiat et les cours en audio m'ont sauvée pour réviser.",
    name: "Afiwa Adjo",
    role: "Faculté de Droit (FDD) · L1",
    avatar: Afiwa,
  },
  {
    quote:
      "Les explications détaillées des QCM permettent de comprendre les pièges fréquents des examens de Lomé. Une vraie révolution pour nous étudiants !",
    name: "Ela S.",
    role: "FDS / Sciences · L2",
    avatar: Ela,
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="temoignages"
      className="py-20 bg-gradient-to-b from-white to-[#25D366]/5 dark:from-[#111B21] dark:to-[#075E54]/10 border-y border-[#E9EDEF] dark:border-[#222E35] transition-colors"
    >
      <Container>
        <SectionHeader
          badge={
            <SectionBadge icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Avis vérifiés d'étudiants de l'Université de Lomé
            </SectionBadge>
          }
          title="Ils ont validé leur semestre grâce à UL-STUDYFLOW-LEARNING"
          subtitle="Rejoins des milliers d'étudiants qui ont troqué le stress et le manque de temps contre des mentions et des moyennes sécurisées."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#111B21] rounded-3xl p-7 border border-[#E9EDEF] dark:border-[#222E35] shadow-sm hover:shadow-xl hover:border-[#25D366]/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 px-2 py-0.5 rounded-full">
                    Note 5/5
                  </span>
                </div>

                <p className="text-[#111B21] dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 italic">
                  « {testimonial.quote} »
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-[#E9EDEF] dark:border-[#222E35]">
                <img
                  alt={`Portrait ${testimonial.name}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#25D366]"
                  src={testimonial.avatar}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-[#111B21] dark:text-white text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
