import { User } from '../types/auth';

export const dummyUsers: User[] = [
  {
    id: 1,
    name: 'Alice Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Sam Seller',
    email: 'seller@example.com',
    password: 'seller123',
    role: 'seller',
  },
  {
    id: 3,
    name: 'Cathy Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer',
  },
];
