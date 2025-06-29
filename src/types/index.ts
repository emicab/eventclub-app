// Tipos relacionados con la autenticación

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

// Podremos añadir más tipos aquí, como User, Profile, Event, etc.
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  role: 'USER' | 'ADMIN' | 'PRODUCER';
  profile?: {
    bio?: string;
    avatarUrl?: string;
    city?: string;
    showInfo: boolean;
    hometown?: string;
    dateOfBirth?: string;
    nickname?: string;
    skills?: string[] | undefined;
    jobSeeking?: string;
  };
}

export type BenefitUsagePeriod = 'LIFETIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Benefit {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  isUsed: boolean;
  usageLimit: number;
  limitPeriod: BenefitUsagePeriod;
  timesUsed: number;
  benefitType?: string;
  isNew: boolean;
  isExclusive: boolean;
  pointCost?: number;
  
}