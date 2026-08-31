import React from 'react';
import { motion } from 'framer-motion';

// Skeleton component base
export const Skeleton = ({ className = '', ...props }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={`bg-slate-200 dark:bg-slate-700 rounded ${className}`}
    {...props}
  />
);

// Page title skeleton
export const SkeletonTitle = () => <Skeleton className="h-10 w-3/4 mb-4" />;

// Text skeleton (paragraph)
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 mb-2 ${i === lines - 1 ? 'w-5/6' : 'w-full'}`} />
    ))}
  </div>
);

// Card skeleton
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4 ${className}`}>
    <Skeleton className="h-6 w-1/2" />
    <SkeletonText lines={2} />
    <Skeleton className="h-10 w-24" />
  </div>
);

// Hero image skeleton
export const SkeletonHero = ({ className = '' }) => (
  <Skeleton className={`w-full h-96 rounded-lg ${className}`} />
);

// Button skeleton
export const SkeletonButton = ({ className = '' }) => (
  <Skeleton className={`h-10 w-32 rounded ${className}`} />
);

// Image skeleton
export const SkeletonImage = ({ className = '' }) => (
  <Skeleton className={`aspect-video w-full rounded-lg ${className}`} />
);

// Grid skeleton (for card lists)
export const SkeletonGrid = ({ count = 3, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Consultation pricing skeleton
export const SkeletonConsultationPricing = () => (
  <div className="space-y-6">
    <SkeletonTitle />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <SkeletonText lines={3} />
          <SkeletonButton />
        </div>
      ))}
    </div>
  </div>
);

// Blog post skeleton
export const SkeletonBlogPost = () => (
  <div className="space-y-6">
    <SkeletonHero />
    <div className="space-y-4">
      <SkeletonTitle />
      <SkeletonText lines={2} className="mb-6" />
      <SkeletonText lines={8} />
    </div>
  </div>
);

// Dashboard skeleton
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <SkeletonTitle />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Form skeleton
export const SkeletonForm = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-24 w-full" />
    </div>
    <SkeletonButton className="w-full" />
  </div>
);
