export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  interests: string[];
  avatar: string;
  bio: string;
  joinedAt: Date;
  lastUpdated: Date;
  withGoogle: boolean;
}
