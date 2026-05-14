import React, {
} from "react";

import {
  View,
  Text,
} from "react-native";

import { useGoals }
  from "@/app/providers/GoalsProviders";

export default function Goals() {
  const { goals } = useGoals();

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
