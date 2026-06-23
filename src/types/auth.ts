export type LoginCredentials = {
  identifier: string;
  password?: string; // Optional for simple mock, but good to have
};

export type AuthSession = {
  isAuthenticated: boolean;
  userId: string; // Map session to a specific employee ID
  email: string;
  role: string; // We'll store role in session for easy RBAC
  loginAt: string; // ISO String
  expiresAt: string; // ISO String
};
