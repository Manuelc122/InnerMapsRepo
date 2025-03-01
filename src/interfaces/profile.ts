export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  birthdate: Date | null;
  country: string | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  fullName: string;
  birthdate: string;
  country: string;
  gender: string;
}

export type Gender = 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';