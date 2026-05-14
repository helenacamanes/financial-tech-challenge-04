import React from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

export function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A1128",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#FFFFFF"
      />
    </View>
  );
}