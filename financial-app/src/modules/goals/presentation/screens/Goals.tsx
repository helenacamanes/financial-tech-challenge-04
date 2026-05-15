import React, {
} from "react";

import {
  View,
  Text,
} from "react-native";

import { useGoalsState }
  from "@/app/providers/GoalsProviders";

export default function Goals() {
  const { goals } = useGoalsState();

  return (
    <View>
      {goals.map((goal) => (
        <Text key={goal.id}>
          {goal.title}
        </Text>
      ))}
    </View>
  );
}
