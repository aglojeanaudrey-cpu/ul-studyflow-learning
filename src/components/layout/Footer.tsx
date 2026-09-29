import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import { UlStudyFlowLogo } from '../brand/UlStudyFlowLogo';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenContact }) => {
  return (
    <footer className="bg-[#075E54] dark:bg-[#0B141A] text-white border-t border-[#128C7E] dark:border-[#222E35] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info with real official logo */}
          <div className="md:col-span-1 space-y-3">
            <UlStudyFlowLogo size="md" lightText showTagline />
            <p className="text-xs text-emerald-100 dark:text-gray-300 leading-relaxed pt-1">
              La plateforme EdTech indépendante conçue par les étudiants de l'Université de Lomé, pour les étudiants. Apprends mieux, comprends plus vite et progresse à ton rythme.
            </p>
            <div className="pt-2 text-xs text-emerald-200/90 dark:text-emerald-400/90 space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>Lomé, Togo (Campus Universitaire)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>+228 99 70 59 20 / 71 67 69 45</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>ulstudyflow@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25D366] mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100 dark:text-gray-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-white transition-colors">
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-white transition-colors">
                  Comment ça marche
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  Tarifs & Déblocage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Foire aux questions (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Facultés supportées */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25D366] mb-3">
              Facultés couvertes
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/90 dark:text-gray-400">
              <li>FASEG · Économie & Gestion</li>
              <li>FDS · Sciences Fondamentales</li>
              <li>FDD · Droit & Sciences Politiques</li>
              <li>FLLA · Lettres, Langues et Arts (Anglais)</li>
              <li>FSHS · Sciences de l'Homme et de la Société</li>
            </ul>
          </div>

          {/* Informations Légales & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#25D366] mb-3">
              Support & Légal
            </h4>
            <div className="space-y-2 text-xs text-emerald-100 dark:text-gray-300">
              <p className="text-[11px] leading-relaxed text-emerald-200 dark:text-gray-400">
                Paiements acceptés via Mix Togo (+228 71 67 69 45) et Flooz Togo (+228 99 70 59 20).
              </p>
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-left hover:text-white text-xs underline underline-offset-2"
                >
                  Politique de confidentialité
                </button>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-left hover:text-white text-xs underline underline-offset-2"
                >
                  Conditions Générales d'Utilisation
                </button>
                <button
                  onClick={onOpenContact}
                  className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#128C7E] dark:bg-[#1F2C34] text-white hover:bg-[#1faa54] transition-colors font-medium text-xs self-start"
                >
                  Nous contacter
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#128C7E] dark:border-[#222E35] flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-200 dark:text-gray-400 gap-2">
          <div>
            © {new Date().getFullYear()} UL STUDY FLOW. Tous droits réservés.
          </div>
          <div className="text-[10px] text-emerald-300/80 dark:text-gray-500 font-mono">
            EdTech UL Lomé · V2.4 Stable
          </div>
        </div>
      </div>
    </footer>
  );
};
