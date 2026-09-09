import React, { useEffect, useState } from 'react';

/**
 * Top thin loading progress bar that fires during page / tab transitions (Flipkart UX)
 */
export const PageLoaderBar: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 550);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active]);

  if (!visible) return null;

  return <div className="page-progress-loader pointer-events-none" />;
};

/**
 * Flipkart-style Product Card Shimmer Skeleton (Uses ROVIA's current theme colors)
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#988686]/20 bg-white/70 dark:bg-[#161313]/70 p-3 sm:p-4 space-y-3 shadow-xs">
      {/* Thumbnail */}
      <div className="aspect-square w-full rounded-xl skeleton-shimmer" />

      {/* Brand / Category */}
      <div className="w-1/3 h-3 skeleton-shimmer" />

      {/* Title */}
      <div className="w-4/5 h-4 skeleton-shimmer" />

      {/* Rating & Assured Badge Row */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-5 rounded-md skeleton-shimmer" />
        <div className="w-16 h-5 rounded-md skeleton-shimmer" />
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-2 pt-1">
        <div className="w-24 h-6 rounded skeleton-shimmer" />
        <div className="w-14 h-4 rounded skeleton-shimmer" />
      </div>

      {/* Free Delivery / Tag */}
      <div className="w-1/2 h-3 rounded skeleton-shimmer" />
    </div>
  );
};

/**
 * Flipkart-style Product Detail Page Shimmer Skeleton
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl skeleton-shimmer" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 rounded-xl skeleton-shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-12 rounded-xl skeleton-shimmer" />
            <div className="h-12 rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="w-1/4 h-4 rounded skeleton-shimmer" />
          <div className="w-3/4 h-8 rounded-lg skeleton-shimmer" />
          <div className="flex gap-3">
            <div className="w-16 h-6 rounded skeleton-shimmer" />
            <div className="w-28 h-6 rounded skeleton-shimmer" />
          </div>
          <div className="w-1/3 h-10 rounded skeleton-shimmer" />
          <div className="w-full h-24 rounded-2xl skeleton-shimmer" />
          <div className="w-full h-32 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

/**
 * Flipkart-style Category Icon Strip Skeleton
 */
export const CategoryStripSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-14 h-14 rounded-full skeleton-shimmer" />
          <div className="w-12 h-2.5 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};
