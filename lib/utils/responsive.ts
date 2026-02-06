/**
 * Responsive Utility Functions
 * Helper functions for responsive design patterns
 */

/**
 * Get responsive class names based on screen size
 */
export const responsiveClasses = {
  // Container padding
  containerPadding: 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
  
  // Section spacing
  sectionSpacing: 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24',
  
  // Text sizes
  textXs: 'text-[10px] sm:text-xs',
  textSm: 'text-xs sm:text-sm',
  textBase: 'text-sm sm:text-base',
  textLg: 'text-base sm:text-lg md:text-xl',
  textXl: 'text-lg sm:text-xl md:text-2xl',
  text2xl: 'text-xl sm:text-2xl md:text-3xl',
  text3xl: 'text-2xl sm:text-3xl md:text-4xl',
  text4xl: 'text-3xl sm:text-4xl md:text-5xl',
  
  // Heading sizes
  h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
  h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
  h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
  h4: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
  
  // Button sizes
  btnSm: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
  btnMd: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
  btnLg: 'px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg',
  
  // Card padding
  cardSm: 'p-3 sm:p-4',
  cardMd: 'p-4 sm:p-6',
  cardLg: 'p-6 sm:p-8',
  
  // Grid layouts
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  
  // Flex layouts
  flexCol: 'flex flex-col gap-3 sm:gap-4',
  flexRow: 'flex flex-col sm:flex-row gap-3 sm:gap-4',
  
  // Spacing
  gap2: 'gap-2 sm:gap-3',
  gap3: 'gap-3 sm:gap-4',
  gap4: 'gap-4 sm:gap-6',
  gap6: 'gap-6 sm:gap-8',
  
  // Margins
  mt4: 'mt-4 sm:mt-6',
  mt6: 'mt-6 sm:mt-8',
  mt8: 'mt-8 sm:mt-12',
  mb4: 'mb-4 sm:mb-6',
  mb6: 'mb-6 sm:mb-8',
  mb8: 'mb-8 sm:mb-12',
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 640 && window.innerWidth < 1024;
};

/**
 * Check if device is desktop
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

/**
 * Get current breakpoint
 */
export const getCurrentBreakpoint = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
};

/**
 * Truncate text for mobile
 */
export const truncateForMobile = (text: string, maxLength: number = 30): string => {
  if (!isMobile()) return text;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get responsive column count
 */
export const getResponsiveColumns = (): number => {
  if (typeof window === 'undefined') return 3;
  
  const width = window.innerWidth;
  
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return 3;
  return 4;
};
