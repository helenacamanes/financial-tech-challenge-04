import React from "react";
import { SafeAreaView, View, StyleSheet, Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../@types/navigation";
import { registerSchema, RegisterFormData } from "../schemas/registerSchema";
import { FormField } from "../components/ui/FormField";
import { CheckboxField } from "../components/ui/CheckboxField";
import { Button } from "../components/ui/Buttons";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { ScreenSubtitle } from "../components/ui/ScreenSubtitle";
import { COLORS } from "../theme";
import { registerWithEmail } from "../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function Register({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerWithEmail(data.name, data.email, data.password);
    } catch (error: any) {
      let message = "Não foi possível criar a conta.";

      if (error.code === "auth/email-already-in-use") {
        message = "Esse e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        message = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        message = "A senha é muito fraca.";
      }

      Alert.alert("Erro", message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenTitle>Criar conta</ScreenTitle>
        <ScreenSubtitle>Comece sua jornada financeira</ScreenSubtitle>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Nome completo"
              placeholder="Seu nome"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Senha"
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Confirmar senha"
              placeholder="Digite novamente"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { onChange, value } }) => (
            <CheckboxField
              label="Aceito os termos de uso e política de privacidade"
              value={value}
              onChange={onChange}
              error={errors.acceptTerms?.message}
            />
          )}
        />

        <Button
          title="Criar conta"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          title="Voltar para login"
          variant="secondary"
          onPress={() => navigation.navigate("Login")}
        />
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
});
