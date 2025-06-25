export type UserRole = 'admin' | 'seller' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string; 
  role: UserRole;
}
