import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  changePasswordUseCase,
  loginUseCase,
  logoutUseCase,
  observeAuthStateUseCase,
  registerUseCase,
  resetPasswordUseCase,
} from "@/infra/di/container";

import { User }
  from "../domain/entities/User";

type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  initializing: boolean;
  error: string | null;
};

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_CHANGED"; payload: User | null }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_CLEAR_ERROR" };

type AuthStateContextData = AuthState & {
  isAuthenticated: boolean;
};

type AuthActionsContextData = {
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  clearError: () => void;
};

type AuthContextData =
  AuthStateContextData &
  AuthActionsContextData;

const initialState: AuthState = {
  user: null,
  status: "idle",
  initializing: true,
  error: null,
};

const AuthStateContext =
  createContext<AuthStateContextData | null>(null);

const AuthActionsContext =
  createContext<AuthActionsContextData | null>(null);

function authReducer(
  state: AuthState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "AUTH_CHANGED":
      return {
        ...state,
        user: action.payload,
        initializing: false,
        status: action.payload
          ? "authenticated"
          : "unauthenticated",
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        initializing: false,
        status: "error",
        error: action.payload,
      };

    case "AUTH_CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

function getErrorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export function AuthStoreProvider({
  children,
}: PropsWithChildren) {
  const [state, dispatch] =
    useReducer(
      authReducer,
      initialState,
    );

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    const timeout = setTimeout(
      () => {
        dispatch({
          type: "AUTH_CHANGED",
          payload: null,
        });
      },
      4000,
    );

    try {
      unsubscribe = observeAuthStateUseCase.execute(
        (user) => {
          clearTimeout(timeout);
          dispatch({
            type: "AUTH_CHANGED",
            payload: user,
          });
        },
      );
    } catch (error) {
      clearTimeout(timeout);
      dispatch({
        type: "AUTH_ERROR",
        payload: getErrorMessage(error),
      });
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      dispatch({ type: "AUTH_LOADING" });

      try {
        const user =
          await loginUseCase.execute(
            email,
            password,
          );

        dispatch({
          type: "AUTH_CHANGED",
          payload: user,
        });
      } catch (error) {
        dispatch({
          type: "AUTH_ERROR",
          payload: getErrorMessage(error),
        });

        throw error;
      }
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ) => {
      dispatch({ type: "AUTH_LOADING" });

      try {
        const user =
          await registerUseCase.execute(
            name,
            email,
            password,
          );

        dispatch({
          type: "AUTH_CHANGED",
          payload: user,
        });
      } catch (error) {
        dispatch({
          type: "AUTH_ERROR",
          payload: getErrorMessage(error),
        });

        throw error;
      }
    },
    [],
  );

  const logout = useCallback(
    async () => {
      dispatch({ type: "AUTH_LOADING" });

      try {
        await logoutUseCase.execute();

        dispatch({
          type: "AUTH_CHANGED",
          payload: null,
        });
      } catch (error) {
        dispatch({
          type: "AUTH_ERROR",
          payload: getErrorMessage(error),
        });

        throw error;
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (
      email: string,
    ) => {
      await resetPasswordUseCase.execute(
        email,
      );
    },
    [],
  );

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ) => {
      await changePasswordUseCase.execute(
        currentPassword,
        newPassword,
      );
    },
    [],
  );

  const clearError = useCallback(
    () => {
      dispatch({ type: "AUTH_CLEAR_ERROR" });
    },
    [],
  );

  const stateValue = useMemo(
    () => ({
      ...state,
      isAuthenticated: !!state.user,
    }),
    [state],
  );

  const actionsValue = useMemo(
    () => ({
      login,
      register,
      logout,
      resetPassword,
      changePassword,
      clearError,
    }),
    [
      login,
      register,
      logout,
      resetPassword,
      changePassword,
      clearError,
    ],
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error(
      "useAuthState deve ser usado dentro de AuthStoreProvider.",
    );
  }

  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);

  if (!context) {
    throw new Error(
      "useAuthActions deve ser usado dentro de AuthStoreProvider.",
    );
  }

  return context;
}

export function useAuth() {
  return {
    ...useAuthState(),
    ...useAuthActions(),
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  await registerUseCase.execute(
    name,
    email,
    password,
  );
}
