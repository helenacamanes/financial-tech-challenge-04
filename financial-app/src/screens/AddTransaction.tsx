import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { RootStackParamList } from "../@types/navigation";
import { useTransactions } from "../contexts/TransactionContext";

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants/transactionCategories";
import { COLORS } from "../theme";
import { ScreenTitle } from "../components/ui/ScreenTitle";
import { FormField } from "../components/ui/FormField";
import { Button } from "../components/ui/Buttons";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { LocalAttachmentInput } from "../services/storageService";

type TransactionType = "expense" | "income";
type AddTransactionRouteProp = RouteProp<RootStackParamList, "AddTransaction">;

type FormData = {
  type: TransactionType;
  amount: string;
  category: string;
  date: string;
  description: string;
  account: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const schema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((value) => {
      const normalized = value.replace(/\./g, "").replace(",", ".");
      const amount = Number(normalized);
      return !isNaN(amount) && amount > 0;
    }, "Informe um valor válido"),
  category: z.string().min(1, "Selecione uma categoria"),
  date: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

      const [day, month, year] = value.split("/").map(Number);
      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "Data inválida. Use DD/MM/AAAA"),
  description: z.string().optional(),
  account: z.string().optional(),
});

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskCurrency(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const number = Number(digits) / 100;

  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseAmount(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

function parseDate(value?: string) {
  if (!value?.trim()) return new Date();

  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export default function AddTransaction() {
  const navigation = useNavigation();
  const route = useRoute<AddTransactionRouteProp>();
  const { addTransaction } = useTransactions();

  const [form, setForm] = useState<FormData>({
    type: route.params.type,
    amount: "",
    category: "",
    date: "",
    description: "",
    account: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<LocalAttachmentInput | null>(
    null,
  );

  const categories = useMemo(() => {
    return form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [form.type]);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleTypeChange(type: TransactionType) {
    setForm((prev) => ({
      ...prev,
      type,
      category: "",
    }));

    setErrors((prev) => ({
      ...prev,
      type: undefined,
      category: undefined,
    }));
  }

  function handleAmountChange(text: string) {
    const masked = maskCurrency(text);
    updateField("amount", masked);
  }

  function handleDateChange(text: string) {
    const masked = maskDate(text);
    updateField("date", masked);
  }

  function validateForm() {
    const result = schema.safeParse(form);

    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: FormErrors = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormData;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    setErrors(fieldErrors);
    return false;
  }

  async function handleSave() {
    const isFormValid = validateForm();

    if (!isFormValid) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: form.type,
        amount: parseAmount(form.amount),
        category: form.category,
        description: form.description.trim(),
        date: parseDate(form.date),
        account: form.account.trim(),
        attachment,
      };

      await addTransaction(payload);

      Alert.alert("Sucesso", "Transação salva com sucesso.");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);

      Alert.alert(
        "Erro ao salvar",
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ["application/pdf", "image/*"],
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      setAttachment({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      });
    } catch (error) {
      console.error("Erro ao selecionar arquivo:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  }

  async function handlePickImage() {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permissão necessária",
            "Permita acesso às fotos para anexar uma imagem.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      setAttachment({
        uri: asset.uri,
        name: asset.fileName ?? `foto-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <ScreenTitle style={styles.title}>Nova transação</ScreenTitle>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                form.type === "expense" && styles.typeButtonExpenseActive,
              ]}
              onPress={() => handleTypeChange("expense")}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  form.type === "expense" && styles.typeButtonTextActive,
                ]}
              >
                Despesa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                form.type === "income" && styles.typeButtonIncomeActive,
              ]}
              onPress={() => handleTypeChange("income")}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  form.type === "income" && styles.typeButtonTextActive,
                ]}
              >
                Receita
              </Text>
            </TouchableOpacity>
          </View>

          <FormField
            label="Valor *"
            placeholder="0,00"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={handleAmountChange}
            error={errors.amount}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria *</Text>

            <View style={styles.categoryGrid}>
              {categories.map((category) => {
                const active = form.category === category;

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                    onPress={() => updateField("category", category)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.category ? (
              <Text style={styles.errorText}>{errors.category}</Text>
            ) : null}
          </View>

          <FormField
            label="Data"
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            value={form.date}
            onChangeText={handleDateChange}
            error={errors.date}
          />

          <FormField
            label="Descrição"
            placeholder="Adicione uma nota (opcional)"
            value={form.description}
            onChangeText={(text: string) => updateField("description", text)}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <FormField
            label="Conta (opcional)"
            placeholder="Conta corrente"
            value={form.account}
            onChangeText={(text: string) => updateField("account", text)}
          />

          <Text style={styles.hint}>
            Deixe em branco para usar a conta padrão
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Anexo (opcional)</Text>

            <View style={styles.attachmentActions}>
              <TouchableOpacity
                style={styles.attachmentBtn}
                onPress={handlePickImage}
                activeOpacity={0.85}
              >
                <Ionicons name="image-outline" size={16} color="#E2E8F0" />
                <Text style={styles.attachmentBtnText}>Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentBtn}
                onPress={handlePickDocument}
                activeOpacity={0.85}
              >
                <Ionicons name="document-outline" size={16} color="#E2E8F0" />
                <Text style={styles.attachmentBtnText}>Arquivo</Text>
              </TouchableOpacity>
            </View>

            {attachment ? (
              <View style={styles.attachmentCard}>
                <Ionicons
                  name={
                    attachment.mimeType?.startsWith("image/")
                      ? "image-outline"
                      : "document-text-outline"
                  }
                  size={18}
                  color="#94A3B8"
                />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name}
                </Text>
                <TouchableOpacity onPress={() => setAttachment(null)}>
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.hint}>
                Adicione uma foto ou um PDF à transação
              </Text>
            )}
          </View>

          <Button
            title="Salvar transação"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />

          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#16233B",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    marginBottom: 0,
    fontSize: 28,
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "#16233B",
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  typeButtonExpenseActive: {
    backgroundColor: "#F24848",
  },
  typeButtonIncomeActive: {
    backgroundColor: "#15B981",
  },
  typeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
    fontSize: 15,
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#1D2A44",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.danger,
  },
  hint: {
    marginTop: -10,
    marginBottom: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  textArea: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 4,
  },
  attachmentActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  attachmentBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1D2A44",
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  attachmentBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  attachmentCard: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1D2A44",
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  attachmentName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },
});
