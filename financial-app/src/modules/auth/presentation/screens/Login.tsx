import React from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Controller, useForm }
  from "react-hook-form";
import { zodResolver }
  from "@hookform/resolvers/zod";
import { NativeStackScreenProps }
  from "@react-navigation/native-stack";

import { COLORS }
  from "@/app/theme";
import { useAuth }
  from "@/app/providers/AuthProviders";
import { RootStackParamList }
  from "@/core/@types/navigation";
import { Button }
  from "@/shared/components/ui/Buttons";
import { FormField }
  from "@/shared/components/ui/FormField";
import { ScreenSubtitle }
  from "@/shared/components/ui/ScreenSubtitle";
import { ScreenTitle }
  from "@/shared/components/ui/ScreenTitle";

import {
  loginSchema,
  LoginFormData,
} from "../../schemas/loginSchema";

type Props =
  NativeStackScreenProps<RootStackParamList, "Login">;

export default function Login({
  navigation,
}: Props) {
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(
    data: LoginFormData,
  ) {
    try {
      await login(
        data.email,
        data.password,
      );
    } catch (error: any) {
      let message =
        "Não foi possível entrar na conta.";

      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/user-not-found"
      ) {
        message =
          "E-mail ou senha inválidos.";
      }

      Alert.alert(
        "Erro",
        message,
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenTitle>Entrar</ScreenTitle>
        <ScreenSubtitle>
          Acesse sua conta financeira
        </ScreenSubtitle>

        <Controller
          control={control}
          name="email"
          render={({
            field: {
              onChange,
              value,
            },
          }) => (
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
          render={({
            field: {
              onChange,
              value,
            },
          }) => (
            <FormField
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Entrar"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <Button
          title="Criar conta"
          variant="secondary"
          onPress={() => navigation.navigate("Register")}
        />

        <Button
          title="Esqueci minha senha"
          variant="secondary"
          onPress={() => navigation.navigate("ForgotPassword")}
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
