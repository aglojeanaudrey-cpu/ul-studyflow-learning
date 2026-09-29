import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  Image as ImageIcon,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  Palette
} from 'lucide-react';
import { UlStudyFlowLogo } from './UlStudyFlowLogo';
import { UlStudyFlowIcon } from './UlStudyFlowIcon';

interface DownloadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadLogoModal: React.FC<DownloadLogoModalProps> = ({ isOpen, onClose }) => {
  const [downloadedMap, setDownloadedMap] = useState<Record<string, boolean>>({});
  const [previewBg, setPreviewBg] = useState<'green' | 'dark' | 'white'>('green');

  if (!isOpen) return null;

  const triggerDownload = (url: string, filename: string, key: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadedMap((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const downloadSvgLogo = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 130" width="100%" height="100%">
  <defs>
    <linearGradient id="ulGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B4B3F" />
      <stop offset="50%" stop-color="#075E54" />
      <stop offset="100%" stop-color="#25D366" />
    </linearGradient>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0B4B3F" />
      <stop offset="100%" stop-color="#25D366" />
    </linearGradient>
  </defs>
  <!-- Background Shield/Badge -->
  <g transform="translate(15, 15) scale(0.95)">
    <!-- Graduation Cap -->
    <path d="M50 14L85 28L50 42L15 28L50 14Z" fill="url(#ulGrad)" />
    <path d="M26 33V46C26 53 37 58 50 58C63 58 74 53 74 46V33" stroke="#075E54" stroke-width="3.5" stroke-linecap="round" />
    <path d="M78 28V43" stroke="#25D366" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="78" cy="46" r="3" fill="#25D366" />
    <!-- U & L Letters -->
    <path d="M22 46V64C22 72 29 78 38 78C47 78 54 72 54 64V46H45V64C45 68 42 70 38 70C34 70 31 68 31 64V46H22Z" fill="url(#ulGrad)" />
    <path d="M58 46V78H78V70H67V46H58Z" fill="url(#ulGrad)" />
    <!-- Dynamic Waves -->
    <path d="M20 78C30 74 45 74 62 78C67 79 70 80 73 80" stroke="url(#waveGrad)" stroke-width="4" stroke-linecap="round" />
    <path d="M22 84C32 80 47 80 64 84C69 85 72 86 75 86" stroke="url(#waveGrad)" stroke-width="3.5" stroke-linecap="round" />
    <path d="M26 90C36 86 50 86 66 90C71 91 74 92 77 92" stroke="#25D366" stroke-width="3" stroke-linecap="round" />
    <circle cx="82" cy="78" r="3.5" fill="#075E54" />
    <circle cx="84" cy="85" r="3.5" fill="#128C7E" />
    <circle cx="86" cy="92" r="3.5" fill="#25D366" />
  </g>
  <!-- Text Branding -->
  <g transform="translate(130, 25)">
    <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="#075E54">UL</text>
    <text x="75" y="45" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="#25D366">STUDYFLOW</text>
    <text x="2" y="75" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#128C7E" letter-spacing="3">APPRENDRE • COMPRENDRE • PROGRESSER</text>
    <text x="2" y="95" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12" fill="#667781">Université de Lomé • Plateforme Numérique</text>
  </g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'ul_studyflow_logo_vector.svg', 'svg_logo');
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleDownloadAll = () => {
    triggerDownload('/ul_studyflow_logo.png', 'ul_studyflow_logo_complet.png', 'all_logo');
    setTimeout(() => {
      triggerDownload('/ul_studyflow_icon.png', 'ul_studyflow_icone_hd.png', 'all_icon');
    }, 400);
    setTimeout(() => {
      downloadSvgLogo();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111B21] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#075E54] dark:bg-[#1F2C34] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Download className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#25D366]/20 text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-0.5">
                <Shield className="w-2.5 h-2.5" /> Espace Super-Administrateur
              </div>
              <h2 className="text-lg font-black leading-tight">
                Téléchargement du Logo & Kit de Marque Officiel
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#111B21] dark:text-white">
          
          {/* Live Preview Box with background switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#667781] dark:text-[#8696A0] uppercase tracking-wider">
                Aperçu du Logo Officiel
              </span>
              <div className="flex items-center gap-1.5 text-xs bg-[#F0F2F5] dark:bg-[#1F2C34] p-1 rounded-xl">
                <button
                  onClick={() => setPreviewBg('green')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    previewBg === 'green' ? 'bg-[#075E54] text-white shadow-xs' : 'text-[#667781] dark:text-[#8696A0]'
                  }`}
                >
                  Fond Vert UL
                </button>
                <button
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    previewBg === 'dark' ? 'bg-[#0B141A] text-white shadow-xs' : 'text-[#667781] dark:text-[#8696A0]'
                  }`}
                >
                  Fond Sombre
                </button>
                <button
                  onClick={() => setPreviewBg('white')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    previewBg === 'white' ? 'bg-white text-[#111B21] shadow-xs' : 'text-[#667781] dark:text-[#8696A0]'
                  }`}
                >
                  Fond Clair
                </button>
              </div>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-center transition-colors duration-200 min-h-[140px] ${
                previewBg === 'green'
                  ? 'bg-[#075E54]'
                  : previewBg === 'dark'
                  ? 'bg-[#0B141A]'
                  : 'bg-[#F8FAFC]'
              }`}
            >
              <UlStudyFlowLogo
                size="lg"
                lightText={previewBg !== 'white'}
                showTagline={true}
              />
            </div>
          </div>

          {/* Download Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Logo Complet PNG */}
            <div className="p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34]/40 hover:border-[#25D366] transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#075E54] dark:text-[#25D366] shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">Logo Complet (PNG HD)</h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">
                    Logo horizontal haute résolution avec typographie et devise académique.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Format: PNG · 278 Ko · Fond transparent
                  </span>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/ul_studyflow_logo.png', 'ul_studyflow_logo.png', 'logo_png')}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  downloadedMap['logo_png']
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#075E54] hover:bg-[#064e46] dark:bg-[#25D366] dark:hover:bg-[#1faa54] text-white dark:text-[#075E54]'
                }`}
              >
                {downloadedMap['logo_png'] ? (
                  <>
                    <Check className="w-4 h-4" /> Téléchargé !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Télécharger PNG
                  </>
                )}
              </button>
            </div>

            {/* 2. Icône Isolée PNG */}
            <div className="p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34]/40 hover:border-[#25D366] transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#075E54] dark:text-[#25D366] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">Icône / Symbole (PNG 512x512)</h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">
                    Emblème officiel (chapeau académique, monogramme UL et ondes de succès).
                  </p>
                  <span className="inline-block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    Format: PNG · 512x512 px · Profils & App
                  </span>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/ul_studyflow_icon.png', 'ul_studyflow_icon.png', 'icon_png')}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  downloadedMap['icon_png']
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#075E54] hover:bg-[#064e46] dark:bg-[#25D366] dark:hover:bg-[#1faa54] text-white dark:text-[#075E54]'
                }`}
              >
                {downloadedMap['icon_png'] ? (
                  <>
                    <Check className="w-4 h-4" /> Téléchargé !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Télécharger Icône
                  </>
                )}
              </button>
            </div>

            {/* 3. Logo Vectoriel SVG */}
            <div className="p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34]/40 hover:border-[#25D366] transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">Logo Vectoriel (SVG pur)</h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">
                    Fichier vectoriel agrandissable à l'infini pour impressions, t-shirts, affiches.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1">
                    Format: SVG · Qualité d'impression HD
                  </span>
                </div>
              </div>
              <button
                onClick={downloadSvgLogo}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  downloadedMap['svg_logo']
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#128C7E] hover:bg-[#075E54] text-white'
                }`}
              >
                {downloadedMap['svg_logo'] ? (
                  <>
                    <Check className="w-4 h-4" /> SVG Exporté !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Télécharger SVG
                  </>
                )}
              </button>
            </div>

            {/* 4. Favicon Web ICO */}
            <div className="p-4 rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#1F2C34]/40 hover:border-[#25D366] transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111B21] dark:text-white">Favicon & Raccourcis (ICO)</h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5">
                    Icône pour barre de navigateur, signets et applications PWA.
                  </p>
                  <span className="inline-block text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                    Format: favicon.ico · 32x32 / 64x64
                  </span>
                </div>
              </div>
              <button
                onClick={() => triggerDownload('/favicon.ico', 'favicon.ico', 'favicon_ico')}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  downloadedMap['favicon_ico']
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#128C7E] hover:bg-[#075E54] text-white'
                }`}
              >
                {downloadedMap['favicon_ico'] ? (
                  <>
                    <Check className="w-4 h-4" /> Téléchargé !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Télécharger Favicon
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Color Palette Spec */}
          <div className="p-4 rounded-2xl bg-[#F0F2F5] dark:bg-[#1F2C34] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E54] dark:text-[#25D366]">
              <Palette className="w-4 h-4" /> Charte Graphique & Codes Couleurs Officiels
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-white dark:bg-[#111B21] p-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
                <div className="w-6 h-6 rounded-lg bg-[#075E54] shrink-0"></div>
                <div>
                  <p className="font-bold text-[11px]">Vert UL</p>
                  <p className="text-[10px] font-mono text-[#667781] dark:text-[#8696A0]">#075E54</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#111B21] p-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
                <div className="w-6 h-6 rounded-lg bg-[#25D366] shrink-0"></div>
                <div>
                  <p className="font-bold text-[11px]">Vert Vif Flow</p>
                  <p className="text-[10px] font-mono text-[#667781] dark:text-[#8696A0]">#25D366</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#111B21] p-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
                <div className="w-6 h-6 rounded-lg bg-[#128C7E] shrink-0"></div>
                <div>
                  <p className="font-bold text-[11px]">Sarcelle</p>
                  <p className="text-[10px] font-mono text-[#667781] dark:text-[#8696A0]">#128C7E</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-[#111B21] p-2 rounded-xl border border-[#E9EDEF] dark:border-[#222E35]">
                <div className="w-6 h-6 rounded-lg bg-[#0B141A] shrink-0"></div>
                <div>
                  <p className="font-bold text-[11px]">Dark Mode</p>
                  <p className="text-[10px] font-mono text-[#667781] dark:text-[#8696A0]">#0B141A</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F0F2F5] dark:bg-[#1F2C34] border-t border-[#E9EDEF] dark:border-[#222E35]">
          <span className="text-xs text-[#667781] dark:text-[#8696A0]">
            © {new Date().getFullYear()} UL Study Flow · Tous droits réservés
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#1faa54] text-[#075E54] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger tous les formats
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] text-[#111B21] dark:text-white hover:bg-gray-100 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
