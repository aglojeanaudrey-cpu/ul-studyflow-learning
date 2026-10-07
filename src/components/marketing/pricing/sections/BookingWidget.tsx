import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  Shield,
  Send,
} from 'lucide-react';
import { Container } from '../../ui/Container';

// ─────────────────────────────────────────────────────────────
// Données : Facultés → Matières
// ─────────────────────────────────────────────────────────────
const FACULTIES: Record<string, string[]> = {
  FASEG: [
    'Microéconomie I & II',
    'Macroéconomie L1/L2',
    'Comptabilité Générale & Analytique',
    'Statistiques & Probabilités',
    'Mathématiques pour Économistes',
  ],
  FDD: [
    'Droit Constitutionnel & Institutions',
    'Introduction Générale au Droit',
    'Droit Civil & Régime des Obligations',
    'Droit Pénal Général & Procédure',
    'Méthodologie du Cas Pratique & Dissertation',
  ],
  FDS: [
    'Algèbre Linéaire & Analyse I',
    'Mécanique du Point & Électrostatique',
    'Chimie Générale & Atomistique',
    'Algorithmique & Programmation en C/Python',
    'Biologie Cellulaire & Génétique',
  ],
  FLLA: [
    'Grammaire & Linguistique Française',
    'Littérature Africaine & Comparée',
    "Techniques d'Expression & Synthèse",
    'Anglais Universitaire & Traduction',
  ],
  FSHS: [
    'Sociologie Générale & Anthropologie',
    'Histoire Contemporaine du Togo',
    'Géographie Physique & Économique',
    'Méthodologie de Recherche en SHS',
  ],
};

const FACULTY_LABELS: Record<string, string> = {
  FASEG: 'FASEG — Économie & Gestion',
  FDD: 'FDD — Droit & Sciences Politiques',
  FDS: 'FDS — Faculté des Sciences (Maths, Physique, Info)',
  FLLA: 'FLLA — Lettres, Langues & Arts',
  FSHS: "FSHS — Sciences de l'Homme & de la Société",
};

// ─────────────────────────────────────────────────────────────
// Formules disponibles
// ─────────────────────────────────────────────────────────────
type FormulaType = 'whatsapp-audio' | 'meet-video' | 'whatsapp-video';

interface Formula {
  id: FormulaType;
  label: string;
  description: string;
  price: number;
  badge: string;
}

const FORMULAS: Formula[] = [
  {
    id: 'whatsapp-audio',
    label: 'Option A • WhatsApp Audio',
    description:
      'Audio + messages écrits structurés + corrigés de TD en photo.',
    price: 1000,
    badge: '1 000 F CFA',
  },
  {
    id: 'meet-video',
    label: 'Option B • Google Meet Vidéo',
    description:
      'Visio interactive en direct, tableau blanc partagé & calculs pas à pas.',
    price: 1500,
    badge: '1 500 F CFA',
  },
  {
    id: 'whatsapp-video',
    label: 'Option C • WhatsApp Vidéo',
    description:
      'Appel vidéo direct dans WhatsApp, simple, direct et sans application supplémentaire.',
    price: 1500,
    badge: '1 500 F CFA',
  },
];

// ─────────────────────────────────────────────────────────────
// Créneaux disponibles
// ─────────────────────────────────────────────────────────────
const SLOTS = [
  '10h00 - 11h30',
  '14h30 - 16h00',
  '17h00 - 18h30',
  '19h00 - 20h30',
  '20h30 - 22h00',
  'Sur mesure',
];

const DAYS = [
  "Aujourd'hui (Créneaux express)",
  'Demain',
  'Après-demain',
  'Samedi prochain (Grandes révisions)',
  'Dimanche prochain',
];

interface BookingWidgetProps {
  onSubmitted?: () => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  onSubmitted,
}) => {
  const [faculty, setFaculty] = useState<string>('FASEG');
  const [subject, setSubject] = useState<string>(FACULTIES['FASEG'][0]);
  const [formula, setFormula] = useState<FormulaType>('whatsapp-audio');
  const [day, setDay] = useState<string>(DAYS[0]);
  const [slot, setSlot] = useState<string>(SLOTS[0]);
  const [phone, setPhone] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Met à jour la matière quand la faculté change
  const handleFacultyChange = (newFaculty: string) => {
    setFaculty(newFaculty);
    setSubject(FACULTIES[newFaculty][0]);
  };

  // Formule sélectionnée
  const selectedFormula = useMemo(
    () => FORMULAS.find((f) => f.id === formula)!,
    [formula]
  );

  // Soumission (placeholder — backend plus tard)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.trim().length < 8) {
      alert(
        'Veuillez renseigner un numéro de téléphone togolais valide (T-Money ou Flooz).'
      );
      return;
    }

    // TODO: brancher sur /api/unlock-requests (backend plus tard)
    console.log('📅 Réservation tutorat :', {
      faculty,
      subject,
      formula,
      day,
      slot,
      phone,
      price: selectedFormula.price,
    });

    setSuccess(true);
    onSubmitted?.();

    // Scroll vers le message de succès
    setTimeout(() => {
      const el = document.getElementById('booking-success-msg');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <section
      id="booking-widget"
      className="py-16 sm:py-20 bg-white dark:bg-[#111B21]"
    >
      <Container>
        <div className="bg-[#F0F2F5]/60 dark:bg-[#0B141A]/60 rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-[#25D366]/40 shadow-lg">
          {/* En-tête du widget */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E9EDEF] dark:border-[#222E35] mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#075E54] dark:text-[#25D366] text-xs font-bold uppercase mb-1">
                <CalendarCheck className="w-4 h-4" />
                <span>Réservation rapide &amp; paiement Mobile Money</span>
              </div>
              <h3 className="text-2xl font-bold text-[#111B21] dark:text-white">
                Réserve ta séance de tutorat (1h30)
              </h3>
              <p className="text-sm text-[#667781] dark:text-[#8696A0] mt-1">
                Choisis ton créneau, ta matière et confirme instantanément par
                T-Money ou Moov Flooz.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] text-xs font-bold self-start lg:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
              <span>Séances disponibles aujourd'hui &amp; cette semaine</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Faculté + Matière */}
            <div>
              <label className="block text-base font-bold text-[#111B21] dark:text-white mb-3">
                1. Choisis ta Faculté et la matière à travailler
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8696A0] uppercase mb-1">
                    Faculté / Domaine UL
                  </label>
                  <select
                    value={faculty}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] p-3 text-sm text-[#111B21] dark:text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none transition-colors"
                  >
                    {Object.keys(FACULTIES).map((code) => (
                      <option key={code} value={code}>
                        {FACULTY_LABELS[code]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8696A0] uppercase mb-1">
                    Unité d'Enseignement (UE) ciblée
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] p-3 text-sm text-[#111B21] dark:text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none transition-colors"
                  >
                    {FACULTIES[faculty].map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Formule */}
            <div>
              <label className="block text-base font-bold text-[#111B21] dark:text-white mb-3">
                2. Sélectionne ta formule et le canal de la séance (1h30)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FORMULAS.map((f) => {
                  const isSelected = formula === f.id;
                  return (
                    <label
                      key={f.id}
                      className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#25D366] bg-[#25D366]/10 ring-2 ring-[#25D366]/20'
                          : 'border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] hover:border-[#25D366]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="radio"
                          name="booking-formula"
                          value={f.id}
                          checked={isSelected}
                          onChange={() => setFormula(f.id)}
                          className="text-[#25D366] focus:ring-[#25D366] h-4 w-4"
                        />
                        <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-[#25D366]/15 px-2 py-0.5 rounded-full">
                          {f.badge}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#111B21] dark:text-white">
                        {f.label}
                      </span>
                      <span className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                        {f.description}
                      </span>
                      <span className="text-[11px] text-[#8696A0] mt-2">
                        Durée : 1h30
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Date + Créneau + Numéro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date + Créneau */}
              <div>
                <label className="block text-base font-bold text-[#111B21] dark:text-white mb-3">
                  3. Date &amp; Créneau horaire
                </label>
                <div className="space-y-3">
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] p-3 text-sm text-[#111B21] dark:text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {SLOTS.map((s) => {
                      const isSelected = slot === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={`py-2 px-2 text-center rounded-lg border text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-[#25D366] bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366]'
                              : 'border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white hover:border-[#25D366]/60'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Numéro + Récap */}
              <div>
                <label className="block text-base font-bold text-[#111B21] dark:text-white mb-3">
                  4. Ton numéro togolais (T-Money ou Flooz)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8696A0] font-bold text-sm">
                      +228
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="90 XX XX XX ou 96 XX XX XX"
                      required
                      className="w-full rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] p-3 pl-16 text-sm text-[#111B21] dark:text-white focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none placeholder:text-[#8696A0]"
                    />
                  </div>

                  <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                    Pour la réception du push USSD de paiement sécurisé et
                    l'envoi du lien de connexion de la séance par SMS &amp;
                    WhatsApp.
                  </p>

                  {/* Récap prix */}
                  <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#075E54] dark:text-[#25D366] uppercase">
                        Total à payer
                      </span>
                      <span className="text-2xl font-extrabold text-[#075E54] dark:text-[#25D366]">
                        {selectedFormula.price.toLocaleString('fr-FR')} F CFA
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-[#8696A0]">
                        Session intensive
                      </span>
                      <span className="text-sm font-bold text-[#25D366]">
                        1h30 (90 min)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA submit */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center gap-2 text-xs text-[#8696A0]">
                <Shield className="w-4 h-4 text-[#25D366]" />
                <span>
                  Confirmation instantanée par SMS &amp; WhatsApp dès validation
                  du paiement
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#25D366] text-[#075E54] font-extrabold text-sm hover:bg-[#1faa54] transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-5 h-5" />
                <span>
                  Réserver ma séance ({selectedFormula.price.toLocaleString('fr-FR')} F CFA)
                </span>
              </button>
            </div>
          </form>

          {/* Message de succès */}
          {success && (
            <div
              id="booking-success-msg"
              className="mt-6 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366] text-[#075E54] dark:text-[#25D366] text-sm flex items-start gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <strong>Demande de réservation enregistrée !</strong> Une
                notification push T-Money / Flooz a été générée. Tu recevras le
                lien de connexion et le contact du tuteur major sur ton WhatsApp
                dès confirmation.
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};