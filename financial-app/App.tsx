import "react-native-gesture-handler";

import React from "react";

import { AppProviders }
  from "./src/app/providers/index";

import { Navigation }
  from "./src/app/navigation";

export default function App() {
  return (
    <AppProviders>
      <Navigation />
    </AppProviders>
  );
}