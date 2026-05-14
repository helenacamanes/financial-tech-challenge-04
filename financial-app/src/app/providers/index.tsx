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

export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <AuthProvider>
      <TransactionProvider>
        <GoalsProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </GoalsProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}