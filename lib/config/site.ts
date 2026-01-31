import siteConfig from '@/config/site.json';

export interface SchoolConfig {
  name: string;
  shortName: string;
  nameEn: string;
  shortNameEn: string;
  principal: string;
  assistantPrincipal: string;
  lrcTeacher: string;
  phone: string;
  address: string;
  addressEn: string;
}

export interface SiteConfig {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface DeveloperConfig {
  name: string;
  nameEn: string;
  grade: string;
  school: string;
}

export interface ContactConfig {
  method: string;
  methodEn: string;
  lrcTeacher: string;
}

export interface SocialConfig {
  instagram: string;
  twitter: string;
  threads: string;
}

export interface FeaturesConfig {
  enableWheel: boolean;
  enableCompetitions: boolean;
  enableTraining: boolean;
  enableCertificates: boolean;
}

export interface AppConfig {
  school: SchoolConfig;
  site: SiteConfig;
  developer: DeveloperConfig;
  contact: ContactConfig;
  social: SocialConfig;
  features: FeaturesConfig;
}

export const config: AppConfig = siteConfig as AppConfig;

// Helper functions for easy access
export const getSchoolName = (lang: 'ar' | 'en' = 'ar', short: boolean = false): string => {
  if (lang === 'en') {
    return short ? config.school.shortNameEn : config.school.nameEn;
  }
  return short ? config.school.shortName : config.school.name;
};

export const getSiteTitle = (lang: 'ar' | 'en' = 'ar'): string => {
  return lang === 'en' ? config.site.titleEn : config.site.title;
};

export const getSiteDescription = (lang: 'ar' | 'en' = 'ar'): string => {
  return lang === 'en' ? config.site.descriptionEn : config.site.description;
};

export const getDeveloperCredit = (lang: 'ar' | 'en' = 'ar'): string => {
  if (lang === 'en') {
    return `Developed by ${config.developer.nameEn} - Grade ${config.developer.grade}`;
  }
  return `تطوير الطالب ${config.developer.name} - الصف ${config.developer.grade}`;
};

export default config;
