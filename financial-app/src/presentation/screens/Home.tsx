import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { exportToPDF } from "../services/exportService";
import { useTransactions } from "../contexts/TransactionContext";
import { RootStackParamList } from "../@types/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions } = useTransactions();
  const { user } = useAuth();

  const firstName = useMemo(() => {
    const displayName = user?.displayName?.trim();

    if (displayName) {
      return displayName.split(/\s+/)[0];
    }

    const emailName = user?.email?.split("@")[0]?.trim();

    if (emailName) {
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return "Usuário";
  }, [user]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.value, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.value, 0);

    return { total: income - expense, income, expense };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleExport = () => {
    exportToPDF(transactions, "Março");
  };

  const savings =
    totals.income > 0 ? ((totals.total / totals.income) * 100).toFixed(0) : "0";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Olá, {firstName}</Text>
                <View style={styles.balanceRow}>
                  <Ionicons
                    name="eye-outline"
                    size={13}
                    color="#64748B"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.balanceSubtitle}>Saldo disponível</Text>
                </View>
                <Text style={styles.balanceValue}>
                  {formatCurrency(totals.total)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddTransaction", { type: "expense" })
                }
                style={styles.actionBtn}
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
                <Text style={styles.actionLabel}>Adicionar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("Insights")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.actionLabel}>Relatórios</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visão do mês</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Gastos</Text>
                  <Text style={[styles.statCardValue, { color: "#F87171" }]}>
                    {formatCurrency(totals.expense)}
                  </Text>
                  <View style={styles.statTrend}>
                    <Ionicons name="arrow-up" size={11} color="#F87171" />
                    <Text style={[styles.statTrendText, { color: "#F87171" }]}>
                      12% vs mês anterior
                    </Text>
                  </View>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Receitas</Text>
                  <Text style={[styles.statCardValue, { color: "#4ADE80" }]}>
                    {formatCurrency(totals.income)}
                  </Text>
                  <View style={styles.statTrend}>
                    <Ionicons name="arrow-up" size={11} color="#4ADE80" />
                    <Text style={[styles.statTrendText, { color: "#4ADE80" }]}>
                      0% vs mês anterior
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.savingsCard}>
                <Text style={styles.statCardLabel}>Economia</Text>
                <Text
                  style={[
                    styles.statCardValue,
                    { color: "#4ADE80", fontSize: 22 },
                  ]}
                >
                  {formatCurrency(totals.total)}
                </Text>
                <View style={styles.statTrend}>
                  <Ionicons name="arrow-up" size={11} color="#4ADE80" />
                  <Text style={[styles.statTrendText, { color: "#4ADE80" }]}>
                    {savings}% vs mês anterior
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Transações recentes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Transactions")}
              >
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name={
                  item.type === "income"
                    ? "briefcase-outline"
                    : getCategoryIcon(item.title)
                }
                size={20}
                color={item.type === "income" ? "#4ADE80" : "#94A3B8"}
              />
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionTime}>
                {formatTransactionDate(item.date)}
              </Text>
            </View>

            <Text
              style={[
                styles.transactionValue,
                item.type === "income"
                  ? styles.valueIncome
                  : styles.valueExpense,
              ]}
            >
              {item.type === "income" ? "+ " : "- "}
              {formatCurrency(item.value)}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
}

function getCategoryIcon(title: string): any {
  const t = title.toLowerCase();
  if (t.includes("mercado") || t.includes("supermercado"))
    return "cart-outline";
  if (t.includes("uber") || t.includes("taxi")) return "car-outline";
  if (t.includes("netflix") || t.includes("spotify"))
    return "play-circle-outline";
  if (t.includes("ifood") || t.includes("restaurante"))
    return "fast-food-outline";
  if (t.includes("farmácia") || t.includes("farmacia")) return "medkit-outline";
  if (t.includes("ginásio") || t.includes("academia")) return "barbell-outline";
  return "receipt-outline";
}

function formatTransactionDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F1F5F9",
    letterSpacing: -0.5,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionLabel: {
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 14,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  savingsCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statCardLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statTrendText: {
    fontSize: 11,
    fontWeight: "500",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
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
  separator: {
    height: 8,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
