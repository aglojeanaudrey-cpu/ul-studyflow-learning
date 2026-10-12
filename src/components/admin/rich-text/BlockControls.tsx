import React from "react";
import { Move, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { BlockStyle } from "../../../types";

interface BlockControlsProps {
  activeStyle: BlockStyle;
  onUpdate: (patch: Partial<BlockStyle>) => void;
  onReset: () => void;
  blockType: "image" | "table" | "quote";
}

export const BlockControls: React.FC<BlockControlsProps> = ({
  activeStyle,
  onUpdate,
  onReset,
  blockType,
}) => {
  const isImage = blockType === "image";

  return (
    <div className="bg-[#0B141A] dark:bg-[#1F2C34] rounded-2xl shadow-2xl border border-[#25D366]/40 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <span className="text-[11px] font-bold text-[#25D366] flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5" />
          Personnaliser le bloc ({blockType})
        </span>
        <button
          onClick={onReset}
          className="text-[10px] text-rose-300 hover:text-rose-200 font-semibold underline"
        >
          Réinitialiser
        </button>
      </div>

      {/* Width + Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-gray-400 font-semibold flex items-center justify-between mb-1">
            <span>Largeur</span>
            <span className="text-[#25D366] font-mono">
              {activeStyle.width || 100}%
            </span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={activeStyle.width || 100}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            className="w-full accent-[#25D366]"
          />
        </div>

        {isImage && (
          <div>
            <label className="text-[10px] text-gray-400 font-semibold flex items-center justify-between mb-1">
              <span>Hauteur</span>
              <span className="text-[#25D366] font-mono">
                {activeStyle.height ? `${activeStyle.height}vh` : "auto"}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={activeStyle.height || 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                onUpdate({ height: v === 0 ? undefined : v });
              }}
              className="w-full accent-[#25D366]"
            />
          </div>
        )}
      </div>

      {/* Object-fit + Radius */}
      <div className="grid grid-cols-2 gap-3">
        {isImage && (
          <div>
            <label className="text-[10px] text-gray-400 font-semibold mb-1 block">
              Remplissage
            </label>
            <div className="flex items-center gap-1 bg-[#075E54]/40 rounded-lg p-1">
              {(["cover", "contain", "fill"] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => onUpdate({ objectFit: fit })}
                  className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-colors ${
                    activeStyle.objectFit === fit
                      ? "bg-[#25D366] text-[#075E54]"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {fit === "cover"
                    ? "Cover"
                    : fit === "contain"
                      ? "Contain"
                      : "Fill"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={isImage ? "" : "col-span-2"}>
          <label className="text-[10px] text-gray-400 font-semibold flex items-center justify-between mb-1">
            <span>Arrondi</span>
            <span className="text-[#25D366] font-mono">
              {activeStyle.radius || 0}px
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={40}
            value={activeStyle.radius || 0}
            onChange={(e) => onUpdate({ radius: Number(e.target.value) })}
            className="w-full accent-[#25D366]"
          />
        </div>
      </div>

      {/* Alignement */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold mb-1 block">
          Alignement
        </label>
        <div className="flex items-center gap-1 bg-[#075E54]/40 rounded-lg p-1">
          {(
            [
              { key: "left", icon: AlignLeft },
              { key: "center", icon: AlignCenter },
              { key: "right", icon: AlignRight },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onUpdate({ align: key })}
              className={`flex-1 flex items-center justify-center py-1 rounded-md transition-colors ${
                (activeStyle.align || "center") === key
                  ? "bg-[#25D366] text-[#075E54]"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Ombre */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold mb-1 block">
          Ombre
        </label>
        <div className="flex items-center gap-1 bg-[#075E54]/40 rounded-lg p-1">
          {(["none", "sm", "md", "lg", "xl"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate({ shadow: s })}
              className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-colors ${
                (activeStyle.shadow || "none") === s
                  ? "bg-[#25D366] text-[#075E54]"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {s === "none" ? "—" : s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Background + Border */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-gray-400 font-semibold mb-1 block">
            Fond
          </label>
          <input
            type="color"
            value={activeStyle.bg || "#ffffff"}
            onChange={(e) => onUpdate({ bg: e.target.value })}
            className="w-full h-8 rounded-md border border-white/10 cursor-pointer bg-transparent"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 font-semibold mb-1 block">
            Bordure
          </label>
          <button
            onClick={() => onUpdate({ border: !activeStyle.border })}
            className={`w-full h-8 text-[10px] font-bold rounded-md transition-colors ${
              activeStyle.border
                ? "bg-[#25D366] text-[#075E54]"
                : "bg-[#075E54]/40 text-gray-300 hover:bg-white/10"
            }`}
          >
            {activeStyle.border ? "Activée" : "Désactivée"}
          </button>
        </div>
      </div>
    </div>
  );
};
