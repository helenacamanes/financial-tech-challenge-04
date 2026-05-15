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

type OnboardingActionsContextData = Omit<
  OnboardingContextData,
  keyof OnboardingState
>;

const OnboardingStateContext =
  createContext<OnboardingState | null>(null);

const OnboardingActionsContext =
  createContext<OnboardingActionsContextData | null>(null);

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

  const actionsValue = useMemo(
    () => ({
      completeOnboarding,
      resetOnboarding,
      reload,
    }),
    [
      completeOnboarding,
      resetOnboarding,
      reload,
    ],
  );

  return (
    <OnboardingStateContext.Provider value={state}>
      <OnboardingActionsContext.Provider value={actionsValue}>
        {children}
      </OnboardingActionsContext.Provider>
    </OnboardingStateContext.Provider>
  );
}

export function useOnboardingState() {
  const context = useContext(OnboardingStateContext);

  if (!context) {
    throw new Error(
      "useOnboardingState deve ser usado dentro de OnboardingStoreProvider.",
    );
  }

  return context;
}

export function useOnboardingActions() {
  const context = useContext(OnboardingActionsContext);

  if (!context) {
    throw new Error(
      "useOnboardingActions deve ser usado dentro de OnboardingStoreProvider.",
    );
  }

  return context;
}

export function useOnboardingStore() {
  return {
    ...useOnboardingState(),
    ...useOnboardingActions(),
  };
}
