import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { useTransactions } from "../contexts/TransactionContext";
import type { Transaction } from "../@types/transaction";

type FilterPeriod = "Dia" | "Semana" | "Mês" | "Todos";

function parseCurrencyInput(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

function maskCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const number = Number(digits) / 100;

  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDate(value?: string) {
  if (!value?.trim()) return new Date();

  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatDateInput(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function isValidDateString(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

  const [day, month, year] = value.split("/").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;

  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    const label = formatDateLabel(transaction.date);

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(transaction);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

const editTransactionSchema = z.object({
  title: z.string().trim().min(1, "Informe a categoria"),
  value: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((value) => {
      const parsed = parseCurrencyInput(value);
      return !isNaN(parsed) && parsed > 0;
    }, "Informe um valor válido"),
  date: z
    .string()
    .trim()
    .min(1, "Informe a data")
    .refine(
      (value) => isValidDateString(value),
      "Data inválida. Use DD/MM/AAAA",
    ),
  description: z.string().optional(),
});

type EditFormErrors = {
  title?: string;
  value?: string;
  date?: string;
  description?: string;
};

export default function Transactions() {
  const { transactions, removeTransaction, updateTransaction } =
    useTransactions();
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<FilterPeriod>("Mês");

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editErrors, setEditErrors] = useState<EditFormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  const PERIODS: FilterPeriod[] = ["Dia", "Semana", "Mês", "Todos"];

  const periodFilteredTransactions = useMemo(() => {
    const today = getStartOfToday();
    const weekStart = getStartOfWeek();
    const now = new Date();

    if (period === "Todos") {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      if (period === "Dia") {
        const transactionDay = new Date(transactionDate);
        transactionDay.setHours(0, 0, 0, 0);
        return transactionDay.getTime() === today.getTime();
      }

      if (period === "Semana") {
        return transactionDate >= weekStart;
      }

      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions, period]);

  const totals = useMemo(() => {
    const income = periodFilteredTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.value, 0);

    const expense = periodFilteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.value, 0);

    return { balance: income - expense, income, expense };
  }, [periodFilteredTransactions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return periodFilteredTransactions;

    return periodFilteredTransactions.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [periodFilteredTransactions, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  function handleOpenDetails(transaction: Transaction) {
    setSelectedTransaction(transaction);
    setDetailsVisible(true);
  }

  function handleOpenEdit() {
    if (!selectedTransaction) return;

    setEditTitle(selectedTransaction.title);
    setEditValue(
      selectedTransaction.value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
    setEditDate(formatDateInput(selectedTransaction.date));
    setEditDescription(selectedTransaction.description ?? "");
    setEditErrors({});
    setDetailsVisible(false);
    setEditVisible(true);
  }

  async function handleDelete(transactionId: string) {
    const confirmDelete = async () => {
      try {
        await removeTransaction(transactionId);
        setDetailsVisible(false);
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
        Alert.alert("Erro", "Não foi possível excluir a transação.");
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir esta transação?",
      );
      if (confirmed) {
        await confirmDelete();
      }
      return;
    }

    Alert.alert(
      "Excluir transação",
      "Tem certeza que deseja excluir esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            void confirmDelete();
          },
        },
      ],
    );
  }

  async function handleSaveEdit() {
    if (!selectedTransaction) return;

    const result = editTransactionSchema.safeParse({
      title: editTitle,
      value: editValue,
      date: editDate,
      description: editDescription,
    });

    if (!result.success) {
      const fieldErrors: EditFormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof EditFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setEditErrors(fieldErrors);
      return;
    }

    try {
      setEditErrors({});
      setEditLoading(true);

      await updateTransaction(selectedTransaction.id, {
        title: editTitle.trim(),
        value: parseCurrencyInput(editValue),
        type: selectedTransaction.type,
        date: parseDate(editDate),
        description: editDescription.trim(),
        account: selectedTransaction.account ?? "",
      });

      setEditVisible(false);
    } catch (error) {
      console.error("Erro ao editar transação:", error);
      Alert.alert("Erro", "Não foi possível editar a transação.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleOpenAttachment() {
    if (!selectedTransaction?.attachment?.url) return;

    try {
      await Linking.openURL(selectedTransaction.attachment.url);
    } catch (error) {
      console.error("Erro ao abrir anexo:", error);
      Alert.alert("Erro", "Não foi possível abrir o anexo.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transações</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardTitle}>Transações</Text>

        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#64748B"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar transações..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && styles.periodBtnTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalsRow}>
          <View>
            <Text style={styles.totalLabel}>
              {period === "Todos" ? "Total geral" : "Total do período"}
            </Text>
            <Text style={styles.totalBalance}>
              {formatCurrency(totals.balance)}
            </Text>
          </View>
          <View style={styles.totalStat}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.totalStatLabel}>Receitas</Text>
              <Text style={[styles.totalStatValue, { color: "#4ADE80" }]}>
                + {formatCurrency(totals.income)}
              </Text>
            </View>
          </View>
          <View style={styles.totalStat}>
            <View style={[styles.dot, { backgroundColor: "#F87171" }]} />
            <View>
              <Text style={styles.totalStatLabel}>Despesas</Text>
              <Text style={[styles.totalStatValue, { color: "#F87171" }]}>
                - {formatCurrency(totals.expense)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.data.map((t, index) => (
                <View key={t.id}>
                  <View style={styles.transactionRow}>
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name={
                          t.type === "income"
                            ? "briefcase-outline"
                            : getCategoryIcon(t.title)
                        }
                        size={20}
                        color={t.type === "income" ? "#4ADE80" : "#94A3B8"}
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{t.title}</Text>
                      <Text style={styles.transactionTime}>
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>

                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionValue,
                          t.type === "income"
                            ? styles.valueIncome
                            : styles.valueExpense,
                        ]}
                      >
                        {t.type === "income" ? "+ " : "- "}
                        {formatCurrency(t.value)}
                      </Text>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => handleOpenDetails(t)}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={16}
                            color="#94A3B8"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => handleDelete(t.id)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#F87171"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {index < group.data.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      />

      <Modal visible={detailsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setDetailsVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da transação</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setDetailsVisible(false)}
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Categoria</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction.title}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction.type === "income"
                      ? "Receita"
                      : "Despesa"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valor</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(selectedTransaction.value)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedTransaction.date).toLocaleDateString(
                      "pt-BR",
                    )}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Descrição</Text>
                  <Text style={styles.detailValue}>
                    {selectedTransaction.description || "Sem descrição"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Anexo</Text>

                  {selectedTransaction.attachment ? (
                    <>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.attachment.name}
                      </Text>

                      {selectedTransaction.attachment.contentType?.startsWith(
                        "image/",
                      ) ? (
                        <Image
                          source={{ uri: selectedTransaction.attachment.url }}
                          style={styles.attachmentPreview}
                          resizeMode="cover"
                        />
                      ) : null}

                      <TouchableOpacity
                        style={styles.modalPrimaryBtnFull}
                        onPress={handleOpenAttachment}
                      >
                        <Text style={styles.modalConfirmText}>Abrir anexo</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.detailValue}>Sem anexo</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.modalPrimaryBtnFull}
                  onPress={handleOpenEdit}
                >
                  <Text style={styles.modalConfirmText}>Editar transação</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar transação</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setEditVisible(false)}
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Categoria</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  editErrors.title ? styles.modalInputError : undefined,
                ]}
                placeholder="Categoria"
                placeholderTextColor="#475569"
                value={editTitle}
                onChangeText={(text) => {
                  setEditTitle(text);
                  if (editErrors.title) {
                    setEditErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
              />
              {editErrors.title ? (
                <Text style={styles.errorText}>{editErrors.title}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Valor</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  editErrors.value ? styles.modalInputError : undefined,
                ]}
                placeholder="0,00"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={editValue}
                onChangeText={(text) => {
                  setEditValue(maskCurrencyInput(text));
                  if (editErrors.value) {
                    setEditErrors((prev) => ({ ...prev, value: undefined }));
                  }
                }}
              />
              {editErrors.value ? (
                <Text style={styles.errorText}>{editErrors.value}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Data</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  editErrors.date ? styles.modalInputError : undefined,
                ]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={editDate}
                onChangeText={(text) => {
                  setEditDate(maskDate(text));
                  if (editErrors.date) {
                    setEditErrors((prev) => ({ ...prev, date: undefined }));
                  }
                }}
              />
              {editErrors.date ? (
                <Text style={styles.errorText}>{editErrors.date}</Text>
              ) : null}

              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Descrição"
                placeholderTextColor="#475569"
                value={editDescription}
                onChangeText={(text) => setEditDescription(text)}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    editLoading && styles.modalConfirmBtnDisabled,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={editLoading}
                >
                  <Text style={styles.modalConfirmText}>
                    {editLoading ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function getCategoryIcon(title: string): any {
  const t = title.toLowerCase();
  if (t.includes("mercado") || t.includes("supermercado"))
    return "cart-outline";
  if (t.includes("uber") || t.includes("taxi") || t.includes("transport"))
    return "car-outline";
  if (t.includes("netflix") || t.includes("spotify") || t.includes("stream"))
    return "play-circle-outline";
  if (t.includes("ifood") || t.includes("restaurante") || t.includes("food"))
    return "fast-food-outline";
  if (t.includes("farmácia") || t.includes("farmacia") || t.includes("saúde"))
    return "medkit-outline";
  if (t.includes("ginásio") || t.includes("academia")) return "barbell-outline";
  return "receipt-outline";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F1F5F9",
    letterSpacing: 0.3,
  },

  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchInput: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    padding: 0,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
  },
  periodBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  periodBtnText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  periodBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  totalsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  totalLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  totalBalance: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F1F5F9",
  },
  totalStat: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginTop: 4,
  },
  totalStatLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  totalStatValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },

  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0",
    marginBottom: 3,
  },
  transactionTime: {
    fontSize: 12,
    color: "#64748B",
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  valueIncome: {
    color: "#4ADE80",
  },
  valueExpense: {
    color: "#F87171",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginLeft: 52,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "#334155",
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F1F5F9",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#F1F5F9",
    fontSize: 15,
    marginBottom: 4,
  },
  modalInputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: "#EF4444",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#0F172A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalCancelText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 14,
  },
  modalPrimaryBtnFull: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },

  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalConfirmBtnDisabled: {
    opacity: 0.45,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  attachmentPreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
});
