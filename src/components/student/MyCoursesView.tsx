import React, { useState, useEffect, useMemo, useRef } from "react";
import { UE, Department, Program } from "../../types";
import { api } from "../../lib/api";
import {
  BookOpen,
  Search,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles,
  Calendar,
  GraduationCap,
  Building2,
  X,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { UnlockUeModal } from "./UnlockUeModal";
import { SkeletonCourseCard } from "../ui/SkeletonLoader";
import { usePageLoading } from "../../hooks/usePageLoading";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

interface MyCoursesViewProps {
  onOpenUe: (ueId: string) => void;
}

type SortOption = "alpha" | "progress_desc" | "progress_asc" | "recent";
type StatusFilter = "ALL" | "not_started" | "in_progress" | "completed";

export const MyCoursesView: React.FC<MyCoursesViewProps> = ({ onOpenUe }) => {
  const [courses, setCourses] = useState<UE[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "catalog">("my");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // État du dropdown
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Filtres
  const [search, setSearch] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [filterProgram, setFilterProgram] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("alpha");

  usePageLoading(loading);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getCourses(),
        api.getAcademicMeta(),
      ]);

      if (results[0].status === "fulfilled") {
        setCourses(results[0].value.courses || []);
      } else {
        console.warn("Courses indisponibles (offline ?)");
      }

      if (results[1].status === "fulfilled") {
        setDepartments(results[1].value.departments || []);
        setPrograms(results[1].value.programs || []);
      } else {
        console.warn("Meta académique indisponible (offline ?)");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersOpen]);

  // Fermer avec ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Niveaux présents dans les UE
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.level && set.add(c.level));
    return Array.from(set).sort();
  }, [courses]);

  // Départements présents
  const availableDepartments = useMemo(() => {
    const deptIds = new Set(courses.map((c) => c.departmentId).filter(Boolean));
    return departments.filter((d) => deptIds.has(d.id));
  }, [courses, departments]);

  // Filières présentes (filtrées par département)
  const availablePrograms = useMemo(() => {
    const coursesForDept =
      filterDept === "ALL"
        ? courses
        : courses.filter((c) => c.departmentId === filterDept);
    const progIds = new Set(
      coursesForDept.map((c) => c.programId).filter(Boolean),
    );
    return programs.filter((p) => progIds.has(p.id));
  }, [courses, programs, filterDept]);

  useEffect(() => {
    if (filterProgram !== "ALL") {
      const stillValid = availablePrograms.some((p) => p.id === filterProgram);
      if (!stillValid) setFilterProgram("ALL");
    }
  }, [filterDept, availablePrograms, filterProgram]);

  // Compteur de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterLevel !== "ALL") count++;
    if (filterDept !== "ALL") count++;
    if (filterProgram !== "ALL") count++;
    if (filterStatus !== "ALL") count++;
    if (sortBy !== "alpha") count++;
    return count;
  }, [filterLevel, filterDept, filterProgram, filterStatus, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setFilterLevel("ALL");
    setFilterDept("ALL");
    setFilterProgram("ALL");
    setFilterStatus("ALL");
    setSortBy("alpha");
  };

  // Filtrage + Tri
  const filteredCourses = useMemo(() => {
    let result = courses.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchesLevel = filterLevel === "ALL" || c.level === filterLevel;
      const matchesDept = filterDept === "ALL" || c.departmentId === filterDept;
      const matchesProgram =
        filterProgram === "ALL" || c.programId === filterProgram;

      const progress = c.progressPercent || 0;
      let matchesStatus = true;
      if (filterStatus === "not_started") matchesStatus = progress === 0;
      else if (filterStatus === "in_progress")
        matchesStatus = progress > 0 && progress < 100;
      else if (filterStatus === "completed") matchesStatus = progress >= 100;

      const matchesTab = activeTab === "my" ? c.isUnlocked : true;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesDept &&
        matchesProgram &&
        matchesStatus &&
        matchesTab
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "progress_desc":
          return (b.progressPercent || 0) - (a.progressPercent || 0);
        case "progress_asc":
          return (a.progressPercent || 0) - (b.progressPercent || 0);
        case "recent":
          return (b.order || 0) - (a.order || 0);
        case "alpha":
        default:
          return a.code.localeCompare(b.code);
      }
    });

    return result;
  }, [
    courses,
    search,
    filterLevel,
    filterDept,
    filterProgram,
    filterStatus,
    sortBy,
    activeTab,
  ]);

  const getDeptName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.code || dept?.name || deptId;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {!isOnline && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <span>📡</span>
          <span>
            Mode hors ligne : les données affichées sont celles de ta dernière
            visite. Certains filtres peuvent être indisponibles.
          </span>
        </div>
      )}
      {/* Header avec bouton déblocage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111B21] dark:text-white">
            Unités d'Enseignement & Matières
          </h1>
          <p className="text-xs sm:text-sm text-[#667781] dark:text-[#8696A0]">
            Retrouve tes cours officiels LMD. Séance 1 toujours offerte pour
            toutes les UE.
          </p>
        </div>

        <button
          onClick={() => setUnlockModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <Unlock className="w-4 h-4" />
          Demande de déblocage UE
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#E9EDEF] dark:bg-[#1F2C34] rounded-xl self-start max-w-xs transition-colors">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "my"
              ? "bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs"
              : "text-[#667781] dark:text-[#8696A0]"
          }`}
        >
          Mes UE
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "catalog"
              ? "bg-white dark:bg-[#111B21] text-[#075E54] dark:text-[#25D366] shadow-xs"
              : "text-[#667781] dark:text-[#8696A0]"
          }`}
        >
          Catalogue
        </button>
      </div>

      {/* ⭐ Barre unique : Recherche + Bouton Filtres dropdown */}
      <div className="relative" ref={filtersRef}>
        <div className="flex items-center gap-2">
          {/* Recherche */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une UE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:border-[#25D366] focus:outline-none shadow-xs"
            />
            <Search className="w-4 h-4 text-[#667781] dark:text-[#8696A0] absolute left-3 top-3" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 p-0.5 rounded text-[#667781] hover:text-[#111B21] dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ⭐ Bouton Filtres (style YouTube) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all shrink-0 shadow-xs ${
              filtersOpen || activeFiltersCount > 0
                ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] border-transparent"
                : "bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white border-[#E9EDEF] dark:border-[#222E35] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filtersOpen || activeFiltersCount > 0
                    ? "bg-white/20 dark:bg-black/20"
                    : "bg-[#25D366] text-[#075E54]"
                }`}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* ⭐ PANNEAU DROPDOWN — Même comportement partout */}
        {filtersOpen && (
          <div
            className="
              absolute top-full mt-2 z-40
              right-0
              w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)]
              bg-white dark:bg-[#111B21]
              rounded-2xl
              shadow-2xl
              border border-[#E9EDEF] dark:border-[#222E35]
              overflow-hidden
              animate-in fade-in slide-in-from-top-3 zoom-in-95 duration-200
            "
          >
            {/* Header compact */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E9EDEF] dark:border-[#222E35]">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#25D366]" />
                <h3 className="font-bold text-[11px] text-[#111B21] dark:text-white uppercase tracking-wider">
                  Filtres
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#25D366] text-[#075E54] text-[9px] font-extrabold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 rounded-lg text-[#667781] hover:bg-[#F0F2F5] dark:hover:bg-[#1F2C34] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contenu scrollable compact */}
            <div className="p-3.5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Niveau */}
              {availableLevels.length > 1 && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1.5 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Niveau
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <FilterChip
                      active={filterLevel === "ALL"}
                      onClick={() => setFilterLevel("ALL")}
                      label="Tous"
                    />
                    {availableLevels.map((lvl) => (
                      <FilterChip
                        key={lvl}
                        active={filterLevel === lvl}
                        onClick={() => setFilterLevel(lvl)}
                        label={lvl}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Département */}
              {availableDepartments.length > 1 && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Département
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <FilterChip
                      active={filterDept === "ALL"}
                      onClick={() => setFilterDept("ALL")}
                      label="Tous"
                    />
                    {availableDepartments.map((dept) => (
                      <FilterChip
                        key={dept.id}
                        active={filterDept === dept.id}
                        onClick={() => setFilterDept(dept.id)}
                        label={dept.code || dept.name}
                        title={dept.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Filière */}
              {availablePrograms.length > 1 && (
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Filière
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <FilterChip
                      active={filterProgram === "ALL"}
                      onClick={() => setFilterProgram("ALL")}
                      label="Toutes"
                    />
                    {availablePrograms.map((p) => (
                      <FilterChip
                        key={p.id}
                        active={filterProgram === p.id}
                        onClick={() => setFilterProgram(p.id)}
                        label={p.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Statut */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Statut
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: "ALL", label: "Tous" },
                    { key: "not_started", label: "Non commencé" },
                    { key: "in_progress", label: "En cours" },
                    { key: "completed", label: "Terminé" },
                  ].map((opt) => (
                    <FilterChip
                      key={opt.key}
                      active={filterStatus === opt.key}
                      onClick={() => setFilterStatus(opt.key as StatusFilter)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </div>

              {/* Tri */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#667781] dark:text-[#8696A0] mb-1.5 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  Trier par
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: "alpha", label: "A → Z" },
                    { key: "progress_desc", label: "Progression ↓" },
                    { key: "progress_asc", label: "Progression ↑" },
                    { key: "recent", label: "Récents" },
                  ].map((opt) => (
                    <FilterChip
                      key={opt.key}
                      active={sortBy === opt.key}
                      onClick={() => setSortBy(opt.key as SortOption)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer compact */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-t border-[#E9EDEF] dark:border-[#222E35] bg-[#FAFAFA] dark:bg-[#0B141A]">
              <button
                onClick={resetFilters}
                disabled={!search && activeFiltersCount === 0}
                className="text-[10px] font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Réinitialiser
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                  <strong className="text-[#111B21] dark:text-white">
                    {filteredCourses.length}
                  </strong>{" "}
                  résultat{filteredCourses.length > 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="px-3 py-1.5 text-[10px] font-bold text-[#075E54] bg-[#25D366] hover:bg-[#1faa54] rounded-lg transition-all active:scale-95"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ⭐ Chips des filtres actifs (sous la barre) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterLevel !== "ALL" && (
            <ActiveChip
              label={`Niveau : ${filterLevel}`}
              onRemove={() => setFilterLevel("ALL")}
            />
          )}
          {filterDept !== "ALL" && (
            <ActiveChip
              label={`Département : ${getDeptName(filterDept)}`}
              onRemove={() => setFilterDept("ALL")}
            />
          )}
          {filterProgram !== "ALL" && (
            <ActiveChip
              label={`Filière : ${
                availablePrograms.find((p) => p.id === filterProgram)?.name ||
                ""
              }`}
              onRemove={() => setFilterProgram("ALL")}
            />
          )}
          {filterStatus !== "ALL" && (
            <ActiveChip
              label={`Statut : ${
                filterStatus === "not_started"
                  ? "Non commencé"
                  : filterStatus === "in_progress"
                    ? "En cours"
                    : "Terminé"
              }`}
              onRemove={() => setFilterStatus("ALL")}
            />
          )}
          {sortBy !== "alpha" && (
            <ActiveChip
              label={`Tri : ${
                sortBy === "progress_desc"
                  ? "Progression ↓"
                  : sortBy === "progress_asc"
                    ? "Progression ↑"
                    : "Récents"
              }`}
              onRemove={() => setSortBy("alpha")}
            />
          )}
        </div>
      )}

      {/* Liste des cours */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCourseCard key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-3">
          <p className="text-xs text-[#667781] dark:text-[#8696A0]">
            Aucune matière trouvée avec ces critères.
          </p>
          {activeTab === "my" && (
            <button
              onClick={() => setActiveTab("catalog")}
              className="px-4 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
            >
              Voir le catalogue complet
            </button>
          )}
          {(search || activeFiltersCount > 0) && (
            <button
              onClick={resetFilters}
              className="block mx-auto px-4 py-2 text-xs font-semibold text-[#667781] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((ue) => (
            <div
              key={ue.id}
              onClick={() => onOpenUe(ue.id)}
              className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 sm:p-5 shadow-xs hover:border-[#25D366] dark:hover:border-[#25D366] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {ue.code}
                    </span>
                    <span className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                      {ue.level} · {ue.semester}
                    </span>
                    {ue.departmentId && (
                      <span className="text-[10px] text-[#667781] dark:text-[#8696A0] bg-[#F0F2F5] dark:bg-[#1F2C34] px-1.5 py-0.5 rounded">
                        {getDeptName(ue.departmentId)}
                      </span>
                    )}
                    {ue.isUnlocked ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#075E54] dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <Unlock className="w-3 h-3 text-[#25D366]" /> Débloqué
                        </span>
                        {ue.expiresAt && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${
                              ue.daysRemaining !== null &&
                              ue.daysRemaining !== undefined &&
                              ue.daysRemaining <= 15
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <Calendar className="w-3 h-3 text-[#667781] dark:text-[#8696A0]" />
                            Expire le{" "}
                            {new Date(ue.expiresAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                            {ue.daysRemaining !== null &&
                              ue.daysRemaining !== undefined && (
                                <span className="opacity-80">
                                  ({ue.daysRemaining}j)
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                    ) : ue.isExpired ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          <Lock className="w-3 h-3 text-rose-600" /> Expiré
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Sparkles className="w-3 h-3" /> Séance 1 Offerte · 500
                        F
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#111B21] dark:text-white mt-1 group-hover:text-[#075E54] dark:group-hover:text-[#25D366] transition-colors">
                    {ue.title}
                  </h3>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5 line-clamp-2">
                    {ue.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-semibold text-[#075E54] dark:text-[#25D366]">
                  {ue.sessionsCount || 0} séances
                </span>
                <div className="p-2 rounded-xl text-[#667781] dark:text-[#8696A0] group-hover:text-[#075E54] dark:group-hover:text-[#25D366] group-hover:bg-emerald-50 dark:group-hover:bg-[#1F2C34] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unlock Modal */}
      {unlockModalOpen && (
        <UnlockUeModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          onSuccess={() => {
            setUnlockModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// ⭐ Chip de filtre compact (style YouTube)
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  icon?: React.ReactNode;
}> = ({ active, onClick, label, title, icon }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
      active
        ? "bg-[#075E54] dark:bg-[#25D366] text-white dark:text-[#075E54] shadow-xs"
        : "bg-[#F0F2F5] dark:bg-[#1F2C34] text-[#111B21] dark:text-white hover:bg-[#E9EDEF] dark:hover:bg-[#2A3942]"
    }`}
  >
    {active && <Check className="w-2.5 h-2.5" />}
    {!active && icon}
    {label}
  </button>
);

// ⭐ Chip de filtre actif (avec X)
const ActiveChip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[#075E54]/10 dark:bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] text-[10px] font-semibold border border-[#075E54]/20 dark:border-[#25D366]/30">
    {label}
    <button
      onClick={onRemove}
      className="p-0.5 rounded-full hover:bg-[#075E54]/20 dark:hover:bg-[#25D366]/30 transition-colors"
      title="Retirer"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);
