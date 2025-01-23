export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  birthdate: Date | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFormData {
  fullName: string;
  birthdate: string;
  country: string;
}