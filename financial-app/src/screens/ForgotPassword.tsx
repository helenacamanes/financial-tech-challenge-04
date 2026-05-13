import React from "react";
import { SafeAreaView, View, StyleSheet, Text, Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../@types/navigation";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "../schemas/forgotPasswordSchema";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Buttons";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { ScreenSubtitle } from "../components/ui/ScreenSubtitle";
import { COLORS } from "../theme";
import { resetPassword } from "../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPassword({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await resetPassword(data.email);

      Alert.alert(
        "E-mail enviado",
        "Se existir uma conta com esse e-mail, você receberá instruções para redefinir sua senha.",
      );

      navigation.navigate("Login");
    } catch (error: any) {
      let message = "Não foi possível enviar o e-mail de recuperação.";

      if (error.code === "auth/invalid-email") {
        message = "E-mail inválido.";
      }

      Alert.alert("Erro", message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenTitle>Esqueceu a senha?</ScreenTitle>
        <ScreenSubtitle>
          Digite seu e-mail e enviaremos instruções para redefinir sua senha.
        </ScreenSubtitle>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Button
          title="Enviar instruções"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          title="Voltar para login"
          variant="secondary"
          onPress={() => navigation.navigate("Login")}
        />

        <Text style={styles.footerText}>
          Verifique também sua caixa de spam ou promoções.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  footerText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
