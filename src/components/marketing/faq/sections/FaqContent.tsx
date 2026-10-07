import React, { useMemo } from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Container } from '../../ui/Container';
import { FaqCategoryPill } from '../ui/FaqCategoryPill';
import { FaqAccordionItem } from '../ui/FaqAccordionItem';
import { FAQ_CATEGORIES, FAQ_QUESTIONS, FaqCategoryId, } from '../data/FaqData'

interface FaqContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: FaqCategoryId | 'all';
  onCategoryChange: (category: FaqCategoryId | 'all') => void;
}

// Métadonnées des groupes (titre + icône)
const GROUP_META: Record<
  FaqCategoryId,
  { title: string; subtitle: string; color: string; iconBg: string }
> = {
  'cat-paiement': {
    title: 'Paiement Mobile Money & Activation administrative',
    subtitle:
      'Fonctionnement réel du paiement manuel sécurisé T-Money & Moov Flooz',
    color: 'amber',
    iconBg: 'bg-amber-100 dark:bg-amber-950/30',
  },
  'cat-validite': {
    title: 'Validité de 6 mois et 10 jours & Réachat',
    subtitle: "Durée d'accès, couverture des examens et rattrapages",
    color: 'emerald',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
  },
  'cat-cours': {
    title: 'Cours, Fiches PDF Hors-Ligne & Contenus en Ligne',
    subtitle:
      'Seul le PDF est téléchargeable hors-ligne (< 2 Mo) • Podcasts, quiz et vidéos en streaming',
    color: 'indigo',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
  },
  'cat-tutorat': {
    title: 'Tutorat individuel & Réservations directes',
    subtitle:
      'Accompagnement par des majors de promo (WhatsApp & Google Meet)',
    color: 'rose',
    iconBg: 'bg-rose-100 dark:bg-rose-950/30',
  },
};

// Couleur du bullet par catégorie
const BULLET_COLORS: Record<FaqCategoryId, string> = {
  'cat-paiement': 'bg-amber-500',
  'cat-validite': 'bg-[#25D366]',
  'cat-cours': 'bg-indigo-500',
  'cat-tutorat': 'bg-rose-500',
};

export const FaqContent: React.FC<FaqContentProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}) => {
  // Filtrage combiné (catégorie + recherche)
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return FAQ_QUESTIONS.filter((q) => {
      const matchesCategory =
        activeCategory === 'all' || q.category === activeCategory;

      if (!matchesCategory) return false;

            if (query === '') return true;

      // Recherche sur : titre de la question + mots-clés + id
      const questionText = q.question.toLowerCase();
      const keywordsText = (q.keywords || []).join(' ').toLowerCase();
      const idText = q.id.toLowerCase();

      return (
        questionText.includes(query) ||
        keywordsText.includes(query) ||
        idText.includes(query)
      );
    });
  }, [searchQuery, activeCategory]);

  // Groupement par catégorie
  const groupedQuestions = useMemo(() => {
    const groups: Record<FaqCategoryId, typeof FAQ_QUESTIONS> = {
      'cat-paiement': [],
      'cat-validite': [],
      'cat-cours': [],
      'cat-tutorat': [],
    };

    filteredQuestions.forEach((q) => {
      groups[q.category].push(q);
    });

    return groups;
  }, [filteredQuestions]);

  const totalVisible = filteredQuestions.length;
  const hasActiveFilter = activeCategory !== 'all' || searchQuery.trim() !== '';

  const resetAll = () => {
    onSearchChange('');
    onCategoryChange('all');
  };

  return (
    <div
      id="faq-section"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-20"
    >
      {/* Pills de filtres */}
      <div className="bg-white dark:bg-[#111B21] rounded-2xl p-2.5 shadow-xl border border-[#E9EDEF] dark:border-[#222E35] overflow-x-auto mb-8">
        <div className="flex items-center gap-2 min-w-max justify-start md:justify-center">
          {FAQ_CATEGORIES.map((category) => (
            <FaqCategoryPill
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
            />
          ))}
        </div>
      </div>

      {/* Compteur + tag filtre */}
      <div className="flex items-center justify-between px-2 mb-4 text-xs font-semibold text-[#8696A0]">
        <span>
          {totalVisible} question{totalVisible > 1 ? 's' : ''} disponible
          {totalVisible > 1 ? 's' : ''}
        </span>
        {hasActiveFilter && (
          <span className="text-[#075E54] dark:text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded border border-[#25D366]/30">
            {activeCategory !== 'all' && (
              <>
                {
                  FAQ_CATEGORIES.find((c) => c.id === activeCategory)
                    ?.shortLabel
                }
              </>
            )}
            {activeCategory !== 'all' && searchQuery && ' • '}
            {searchQuery && `Recherche : "${searchQuery}"`}
          </span>
        )}
      </div>

      {/* État vide */}
      {totalVisible === 0 && (
        <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-12 text-center shadow-sm my-6">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#111B21] dark:text-white mb-1">
            Aucune question ne correspond à votre recherche
          </h3>
          <p className="text-sm text-[#8696A0] mb-5 max-w-md mx-auto">
            Vérifie l'orthographe ou essaie un mot plus général (ex:
            "paiement", "téléphone", "12h", "Flooz", "examen").
          </p>
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] text-xs font-bold hover:bg-[#0a6b5f] transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      )}

      {/* Groupes d'accordéons */}
      <div className="space-y-10">
        {(
          Object.keys(GROUP_META) as FaqCategoryId[]
        ).map((categoryId) => {
          const questions = groupedQuestions[categoryId];
          if (questions.length === 0) return null;

          const meta = GROUP_META[categoryId];

          return (
            <div key={categoryId} className="faq-group">
              {/* En-tête du groupe */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${meta.iconBg}`}
                >
                  <span className="text-lg">
                    {FAQ_CATEGORIES.find((c) => c.id === categoryId)?.emoji}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#075E54] dark:text-[#25D366]">
                    {meta.title}
                  </h2>
                  <p className="text-xs text-[#8696A0]">{meta.subtitle}</p>
                </div>
              </div>

              {/* Accordéons */}
              <div className="space-y-3">
                {questions.map((q) => (
                  <FaqAccordionItem
                    key={q.id}
                    item={q}
                    bulletColor={BULLET_COLORS[categoryId]}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};