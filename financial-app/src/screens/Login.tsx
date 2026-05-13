import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../@types/navigation";
import { loginSchema, LoginFormData } from "../schemas/loginSchema";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Buttons";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { ScreenSubtitle } from "../components/ui/ScreenSubtitle";
import { COLORS } from "../theme";
import { loginWithEmail } from "../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function Login({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await loginWithEmail(data.email, data.password);
    } catch (error: any) {
      let message = "Não foi possível entrar.";

      if (error.code === "auth/invalid-credential") {
        message = "E-mail ou senha incorretos.";
      } else if (error.code === "auth/invalid-email") {
        message = "E-mail inválido.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Muitas tentativas. Tente novamente mais tarde.";
      }

      Alert.alert("Erro", message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <ScreenTitle>Bem-vinda de volta</ScreenTitle>
        <ScreenSubtitle>
          Entre na sua conta para continuar sua jornada financeira
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Senha"
              placeholder="Digite sua senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

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
    paddingTop: 24,
  },
  image: {
    width: "100%",
    height: 180,
    marginBottom: 12,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "flex-end",
    marginBottom: 16,
  },
});
