import "react-native-gesture-handler";
import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TransactionProvider } from "./src/contexts/TransactionContext";
import { AppRoutesContainer } from "./src/routes";
import { GoalsProvider } from "./src/contexts/GoalsContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <GoalsProvider>
          <NotificationProvider>
            <AppRoutesContainer />
          </NotificationProvider>
        </GoalsProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}