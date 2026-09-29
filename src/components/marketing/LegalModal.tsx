import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-[#E9EDEF] my-8 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#667781] hover:text-[#111B21] p-1.5 rounded-lg hover:bg-[#F0F2F5]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#075E54] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111B21]">
                {isPrivacy ? 'Politique de Confidentialité' : 'Conditions Générales d\'Utilisation'}
              </h3>
              <p className="text-xs text-[#667781]">
                Plateforme EdTech UL STUDY FLOW LEARNING · Par les étudiants pour les étudiants (Togo)
              </p>
            </div>
          </div>

          <div className="prose prose-sm text-xs text-slate-700 leading-relaxed space-y-3 pt-2 border-t border-[#E9EDEF]">
            {isPrivacy ? (
              <>
                <h4 className="font-bold text-[#111B21]">1. Collecte des données</h4>
                <p>
                  Dans le cadre de son fonctionnement, l'EdTech UL STUDY FLOW collecte uniquement les informations nécessaires au suivi pédagogique : numéro de téléphone, prénom, nom, filière et niveau d'étude.
                </p>
                <h4 className="font-bold text-[#111B21]">2. Protection et Chiffrement</h4>
                <p>
                  Les mots de passe sont chiffrés de manière irréversible selon l'algorithme PBKDF2 avec sel unique (SHA-512). Aucune information bancaire n'est stockée sur nos serveurs.
                </p>
                <h4 className="font-bold text-[#111B21]">3. Non-divulgation</h4>
                <p>
                  Vos données académiques et progressions ne sont jamais cédées, vendues ou partagées avec des tiers commerciaux.
                </p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-[#111B21]">1. Objet de la plateforme</h4>
                <p>
                  UL STUDY FLOW LEARNING est une EdTech indépendante créée par des étudiants pour les étudiants. Elle fournit un accompagnement pédagogique complémentaire (résumés de cours, audios, vidéos, questionnaires et assistant IA).
                </p>
                <h4 className="font-bold text-[#111B21]">2. Propriété intellectuelle</h4>
                <p>
                  Les polycopiés, fiches synthétiques et quiz restent la propriété de leurs auteurs et tuteurs respectifs. Toute reproduction commerciale non autorisée est interdite.
                </p>
                <h4 className="font-bold text-[#111B21]">3. Tarification</h4>
                <p>
                  L'accès à une Unité d'Enseignement complète est fixé à 500 FCFA l'unité, et à partir de 3 UE achetées, le prix d'une UE est de 300 FCFA l'unité. Le premier chapitre de chaque matière est librement accessible à des fins de découverte.
                </p>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-[#E9EDEF] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
