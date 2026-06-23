import { STORAGE_KEYS } from "@/constants";
import type { AuthSession, LoginCredentials } from "@/types/auth";
import { EmployeeStorageService } from "./employee-storage";

const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000;

export const AuthStorageService = {
  async login(credentials: LoginCredentials): Promise<boolean> {
    let employee;

    // Admin login → System Administrator
    if (credentials.identifier === "admin" && credentials.password === "admin123") {
      employee = await EmployeeStorageService.getEmployeeByEmail("admin@company.com");
    } else {
      employee = await EmployeeStorageService.getEmployeeByEmail(credentials.identifier);
    }

    if (
      employee &&
      (credentials.password === "password123" ||
        (credentials.identifier === "admin" && credentials.password === "admin123"))
    ) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS);

      const session: AuthSession = {
        isAuthenticated: true,
        userId: employee.id,
        email: employee.email,
        role: employee.role,
        loginAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const payload = JSON.stringify(session);
      let checksum = 0;
      for (let i = 0; i < payload.length; i++) {
        checksum = (Math.imul(31, checksum) + payload.charCodeAt(i)) | 0;
      }
      const securePayload =
        btoa(encodeURIComponent(payload)) + "." + checksum.toString(16);

      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, securePayload);
      return true;
    }
    return false;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!data) return null;

    try {
      const parts = data.split(".");
      if (parts.length !== 2) return null;

      const payload = decodeURIComponent(atob(parts[0]));
      const providedChecksum = parts[1];

      let expectedChecksum = 0;
      for (let i = 0; i < payload.length; i++) {
        expectedChecksum =
          (Math.imul(31, expectedChecksum) + payload.charCodeAt(i)) | 0;
      }

      if (expectedChecksum.toString(16) !== providedChecksum) {
        this.logout();
        return null;
      }

      const session = JSON.parse(payload) as AuthSession;

      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const session = this.getSession();
    return session?.isAuthenticated === true;
  },

  getCurrentUser(): AuthSession | null {
    return this.getSession();
  },
};
