// Tipos relacionados con la autenticación

import { Float } from "react-native/Libraries/Types/CodegenTypes";

declare module '@env' {
  export const API_URL: string;
  export const API_KEY: string;
}


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
  isVerified: boolean;
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

export type Channel = {
  id: string;
  name: string;
  slug: string;
  isPrivate: boolean; // <-- Nuevo campo
};

export type UserInfo = {
  id: any;
  isVerified: any;
  firstName: string;
  lastName: string;

  profile: {
    avatarUrl?: string;
  };
};

export type Post = {
  likedByCurrentUser: any;
  lastComment: any;
  id: string;
  author: UserInfo;
  content: string;
  imageUrls?: string[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string; // Recibimos la fecha como un string ISO
};

export type Event = {
  place: string;
  longitude: number;
  latitude: number;
  organizer: any;
  address: string;
  description: string;
  tickets: any;
  name: string;
  date: string | number | Date;
  id: string;
  title: string;
  company: {
    logoUrl: any;
    name: string;
  }
  city: string;
  imageUrls: string[];
  price: Float;
}