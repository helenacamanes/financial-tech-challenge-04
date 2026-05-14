import React, {
  PropsWithChildren,
} from "react";

import { AuthProvider }
  from "./AuthProviders";

import { TransactionProvider }
  from "./TransactionProviders";

import { GoalsProvider }
  from "./GoalsProviders";

import { NotificationProvider }
  from "./NotificationProviders";

import { OnboardingStoreProvider }
  from "../../modules/onboarding/state/onboarding.store";

export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <OnboardingStoreProvider>
      <AuthProvider>
        <TransactionProvider>
          <GoalsProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </GoalsProvider>
        </TransactionProvider>
      </AuthProvider>
    </OnboardingStoreProvider>
  );
}
