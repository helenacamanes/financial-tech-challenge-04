import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import { COLORS } from "../../theme";

interface ScreenTitleProps extends TextProps {
  children: React.ReactNode;
}

export function ScreenTitle({ children, style, ...rest }: ScreenTitleProps) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
});
