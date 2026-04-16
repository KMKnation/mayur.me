export type AdminRole = "super_admin" | "admin";
export type BlogStatus = "draft" | "published";

export interface SiteNavigationItem {
  label: string;
  href: string;
  type: "section" | "route";
  isVisible: boolean;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  heroInitials: string;
  linkedinHandle: string;
  profileUrl: string;
  resumeLabel: string;
  resumeUrl: string;
  navigation: SiteNavigationItem[];
  sectionVisibility: Record<string, boolean>;
  animationSettings: AnimationSettings;
  updatedAt?: string;
}

export interface HeroSectionContent {
  greeting: string;
  firstName: string;
  lastName: string;
  rolePrefix: string;
  rolePrimary: string;
  roleSecondary: string;
  taglinePrimary: string;
  taglineSecondary: string;
}

export interface AboutSectionContent {
  title: string;
  body: string;
}

export interface WhatIDoCard {
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
}

export interface WhatIDoContent {
  titlePrimary: string;
  titleSecondary: string;
  cards: WhatIDoCard[];
}

export interface CareerItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface CareerContent {
  title: string;
  highlight: string;
  items: CareerItem[];
}

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  tools: string;
  link: string;
  isVisible: boolean;
  displayOrder: number;
  isViewMoreTile: boolean;
  animationPreset: string;
}

export interface PatentItem {
  id: string;
  title: string;
  type: string;
  summary: string;
  meta: string;
  link: string;
  isVisible: boolean;
  displayOrder: number;
  isViewMoreTile: boolean;
  animationPreset: string;
}

export interface TechItem {
  id: string;
  label: string;
  isVisible: boolean;
  displayOrder: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  platform: "github" | "linkedin" | "email" | "doc";
  isVisible: boolean;
}

export interface ContactInfo {
  title: string;
  connectTitle: string;
  educationTitle: string;
  socialTitle: string;
  footerTitle: string;
  footerHighlight: string;
  copyrightText: string;
  educationLines: string[];
  connectLinks: {
    label: string;
    href: string;
  }[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
  tagIds: string[];
}

export interface AnimationSettings {
  heroEnabled: boolean;
  heroSpeed: number;
  heroGlowIntensity: number;
  cursorRepulsionRadius: number;
  cursorRepulsionStrength: number;
  workCardFloatSpeed: number;
  workCardDepth: number;
  techBallFloatSpeed: number;
  techBallIntensity: number;
}

export interface SectionContentMap {
  hero: HeroSectionContent;
  about: AboutSectionContent;
  whatIDo: WhatIDoContent;
  career: CareerContent;
  contact: ContactInfo;
}

export interface PublicCmsData {
  settings: SiteSettings;
  sections: SectionContentMap;
  workItems: WorkItem[];
  patentItems: PatentItem[];
  techItems: TechItem[];
  socialLinks: SocialLink[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
}

export interface AdminInvite {
  id: string;
  email: string;
  invitedBy: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  publicUrl: string;
  label: string;
  createdAt: string;
}

export interface ContentRevision {
  id: string;
  entityType: string;
  entityId: string;
  snapshot: unknown;
  editedBy: string;
  createdAt: string;
}

