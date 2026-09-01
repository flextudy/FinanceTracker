export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export interface FeatureItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
}

export interface TrustLogo {
  name: string;
  logoUrl?: string;
}
