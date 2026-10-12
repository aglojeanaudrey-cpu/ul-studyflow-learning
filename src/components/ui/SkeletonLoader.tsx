import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string;
  height?: string;
}

/**
 * Bloc skeleton individuel (pulse gris).
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect",
  width,
  height,
}) => {
  const baseClass = "animate-pulse bg-[#E9EDEF] dark:bg-[#222E35]";
  const variantClass =
    variant === "circle"
      ? "rounded-full"
      : variant === "text"
        ? "rounded h-4"
        : "rounded-xl";

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton pour une carte UE (utilisé dans MyCoursesView).
 */
export const SkeletonCourseCard: React.FC = () => (
  <div className="bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35] p-4 sm:p-5 shadow-xs">
    <div className="flex items-start gap-3.5">
      <Skeleton
        variant="rect"
        width="44px"
        height="44px"
        className="shrink-0"
      />
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton variant="rect" width="70px" height="20px" />
          <Skeleton variant="rect" width="100px" height="16px" />
        </div>
        <Skeleton variant="rect" width="70%" height="20px" />
        <Skeleton variant="rect" width="95%" height="14px" />
        <Skeleton variant="rect" width="60%" height="14px" />
      </div>
      <Skeleton
        variant="rect"
        width="80px"
        height="20px"
        className="shrink-0"
      />
    </div>
  </div>
);

/**
 * Skeleton pour un item de liste simple (notifications, etc).
 */
export const SkeletonListItem: React.FC = () => (
  <div className="p-4 flex items-start gap-3 border-b border-[#E9EDEF] dark:border-[#222E35] last:border-0">
    <Skeleton
      variant="circle"
      width="40px"
      height="40px"
      className="shrink-0"
    />
    <div className="flex-1 space-y-2">
      <Skeleton variant="rect" width="60%" height="16px" />
      <Skeleton variant="rect" width="90%" height="12px" />
    </div>
  </div>
);

/**
 * Skeleton pour une ligne de tableau admin.
 */
export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-[#E9EDEF] dark:border-[#222E35]">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton
          variant="rect"
          width={i === 0 ? "80%" : "60%"}
          height="16px"
        />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton pour une carte de KPI (dashboard admin).
 */
export const SkeletonKpiCard: React.FC = () => (
  <div className="p-5 bg-white dark:bg-[#111B21] rounded-2xl border border-[#E9EDEF] dark:border-[#222E35]">
    <div className="flex items-center justify-between mb-2">
      <Skeleton variant="rect" width="70px" height="14px" />
      <Skeleton variant="circle" width="16px" height="16px" />
    </div>
    <Skeleton variant="rect" width="50px" height="28px" className="mb-2" />
    <Skeleton variant="rect" width="90px" height="12px" />
  </div>
);
