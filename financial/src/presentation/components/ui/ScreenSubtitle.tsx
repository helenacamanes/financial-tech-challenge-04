import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import { COLORS } from "../../theme";

interface ScreenSubtitleProps extends TextProps {
  children: React.ReactNode;
}

export function ScreenSubtitle({
  children,
  style,
  ...rest
}: ScreenSubtitleProps) {
  return (
    <Text style={[styles.subtitle, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
});
