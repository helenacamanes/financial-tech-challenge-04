import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { COLORS } from "../../theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...rest }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        {...rest}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1D2A44",
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.danger,
  },
});
