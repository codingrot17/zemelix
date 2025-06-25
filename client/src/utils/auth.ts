import { dummyUsers } from '../api/dummyUsers';
import { User } from '../types/auth';

export function login(email: string, password: string): User | null {
  const user = dummyUsers.find(
    (u) => u.email === email && u.password === password
  );
  return user ?? null;
}
