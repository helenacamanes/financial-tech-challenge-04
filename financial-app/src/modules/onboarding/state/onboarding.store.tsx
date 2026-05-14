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
  completeOnboardingUseCase,
  getOnboardingStatusUseCase,
  resetOnboardingUseCase,
} from "@/infra/di/container";

type OnboardingState = {
  loading: boolean;
  hasSeenOnboarding: boolean;
  error: string | null;
};

type OnboardingAction =
  | { type: "LOADED"; payload: boolean }
  | { type: "ERROR"; payload: string }
  | { type: "COMPLETED" }
  | { type: "RESET" };

type OnboardingContextData = OnboardingState & {
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  reload: () => Promise<void>;
};

const OnboardingContext =
  createContext<OnboardingContextData | null>(null);

const initialState: OnboardingState = {
  loading: true,
  hasSeenOnboarding: false,
  error: null,
};

function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "LOADED":
      return {
        loading: false,
        hasSeenOnboarding: action.payload,
        error: null,
      };

    case "ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "COMPLETED":
      return {
        loading: false,
        hasSeenOnboarding: true,
        error: null,
      };

    case "RESET":
      return {
        loading: false,
        hasSeenOnboarding: false,
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
    : "Não foi possível carregar o onboarding.";
}

export function OnboardingStoreProvider({
  children,
}: PropsWithChildren) {
  const [state, dispatch] =
    useReducer(
      onboardingReducer,
      initialState,
    );

  const reload = useCallback(
    async () => {
      try {
        const hasSeen =
          await getOnboardingStatusUseCase.execute();

        dispatch({
          type: "LOADED",
          payload: hasSeen,
        });
      } catch (error) {
        dispatch({
          type: "ERROR",
          payload: getErrorMessage(error),
        });
      }
    },
    [],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const completeOnboarding = useCallback(
    async () => {
      await completeOnboardingUseCase.execute();
      dispatch({ type: "COMPLETED" });
    },
    [],
  );

  const resetOnboarding = useCallback(
    async () => {
      await resetOnboardingUseCase.execute();
      dispatch({ type: "RESET" });
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      completeOnboarding,
      resetOnboarding,
      reload,
    }),
    [
      state,
      completeOnboarding,
      resetOnboarding,
      reload,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingStore() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboardingStore deve ser usado dentro de OnboardingStoreProvider.",
    );
  }

  return context;
}
