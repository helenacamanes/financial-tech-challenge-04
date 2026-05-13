import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { useNavigation } from "@react-navigation/native";
import { changeUserPassword } from "../services/authService";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Buttons";
import { COLORS } from "../theme";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual"),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePassword() {
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const result = schema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    try {
      setErrors({});
      setLoading(true);

      await changeUserPassword(currentPassword, newPassword);

      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso.");
      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);

      if (
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
      ) {
        Alert.alert("Erro", "A senha atual está incorreta.");
      } else {
        Alert.alert(
          "Erro",
          error instanceof Error
            ? error.message
            : "Não foi possível alterar a senha.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <ScreenTitle style={styles.title}>Alterar senha</ScreenTitle>

          <View style={{ width: 36 }} />
        </View>

        <FormField
          label="Senha atual"
          placeholder="Digite sua senha atual"
          secureTextEntry
          value={currentPassword}
          onChangeText={(text: string) => {
            setCurrentPassword(text);
            if (errors.currentPassword) {
              setErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }
          }}
          error={errors.currentPassword}
        />

        <FormField
          label="Nova senha"
          placeholder="Digite a nova senha"
          secureTextEntry
          value={newPassword}
          onChangeText={(text: string) => {
            setNewPassword(text);
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
          }}
          error={errors.newPassword}
        />

        <FormField
          label="Confirmar nova senha"
          placeholder="Digite novamente a nova senha"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text: string) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          error={errors.confirmPassword}
        />

        <Button
          title="Salvar nova senha"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#16233B",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 0,
    fontSize: 22,
  },
  saveButton: {
    marginTop: 12,
  },
});
