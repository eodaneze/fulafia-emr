import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { demoAccounts } from '@/src/constants/roles';
import type {
  AuthUser,
  LoginPayload,
  UserRole,
} from '@/src/types/auth';

const SESSION_STORAGE_KEY = 'fulafia-hospital-auth-session';

type LoginResult = {
  success: boolean;
  message: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoggingIn: boolean;

  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  loginAsDemoRole: (role: UserRole) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

async function persistUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(
    SESSION_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoggingIn: false,

  hydrate: async () => {
    try {
      const storedSession = await SecureStore.getItemAsync(
        SESSION_STORAGE_KEY,
      );

      if (!storedSession) {
        set({
          user: null,
          isAuthenticated: false,
          isHydrated: true,
        });

        return;
      }

      const user = JSON.parse(storedSession) as AuthUser;

      set({
        user,
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch {
      await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);

      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },

  login: async ({ employeeId, password, role }) => {
    set({ isLoggingIn: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 850));

      const normalizedEmployeeId = employeeId.trim().toLowerCase();

      const account = demoAccounts.find(
        (item) =>
          item.role === role &&
          (item.employeeId.toLowerCase() === normalizedEmployeeId ||
            item.email.toLowerCase() === normalizedEmployeeId),
      );

      if (!account || account.password !== password) {
        return {
          success: false,
          message:
            'The employee ID, role or password you entered is incorrect.',
        };
      }

      const { password: _password, ...user } = account;

      await persistUser(user);

      set({
        user,
        isAuthenticated: true,
      });

      return {
        success: true,
        message: 'Login successful.',
      };
    } catch {
      return {
        success: false,
        message:
          'The application could not complete your login. Please try again.',
      };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  loginAsDemoRole: async (role) => {
    set({ isLoggingIn: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const account = demoAccounts.find(
        (item) => item.role === role,
      );

      if (!account) {
        return {
          success: false,
          message:
            'A demonstration account has not been configured for this role.',
        };
      }

      const { password: _password, ...user } = account;

      await persistUser(user);

      set({
        user,
        isAuthenticated: true,
      });

      return {
        success: true,
        message: 'Demo account selected.',
      };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));