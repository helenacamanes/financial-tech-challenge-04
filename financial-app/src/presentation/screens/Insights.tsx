import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../contexts/TransactionContext";
import Svg, { Circle, G } from "react-native-svg";

type CategoryTotal = {
  label: string;
  value: number;
  color: string;
  icon: string;
};

const CATEGORY_COLORS: Record<string, { color: string; icon: string }> = {
  Mercado: { color: "#3B82F6", icon: "cart-outline" },
  Transporte: { color: "#8B5CF6", icon: "car-outline" },
  Moradia: { color: "#F97316", icon: "home-outline" },
  Alimentação: { color: "#F59E0B", icon: "fast-food-outline" },
  Lazer: { color: "#10B981", icon: "game-controller-outline" },
  Tecnologia: { color: "#06B6D4", icon: "laptop-outline" },
  Saúde: { color: "#EF4444", icon: "medkit-outline" },
  Educação: { color: "#6366F1", icon: "school-outline" },
  Salário: { color: "#22C55E", icon: "cash-outline" },
  Assinaturas: { color: "#EC4899", icon: "repeat-outline" },
  Pets: { color: "#F43F5E", icon: "paw-outline" },
  Viagem: { color: "#14B8A6", icon: "airplane-outline" },
  Outros: { color: "#A855F7", icon: "ellipsis-horizontal-outline" },
};

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function DonutChart({ categories }: { categories: CategoryTotal[] }) {
  const total = categories.reduce((acc, c) => acc + c.value, 0);

  const SIZE = 160;
  const STROKE = 22;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  if (total <= 0) {
    return (
      <View style={donutStyles.container}>
        <View
          style={[
            donutStyles.centerFallback,
            { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
          ]}
        >
          <Text style={donutStyles.centerLabel}>Total</Text>
          <Text style={donutStyles.centerValue}>{formatCurrency(0)}</Text>
        </View>
      </View>
    );
  }

  let accumulatedPercent = 0;

  return (
    <View style={donutStyles.container}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#334155"
              strokeWidth={STROKE}
              fill="none"
            />

            {categories.map((cat) => {
              const percent = cat.value / total;
              const dash = percent * CIRCUMFERENCE;
              const gapAdjustedDash = Math.max(dash - 3, 0);
              const offset = CIRCUMFERENCE * (1 - accumulatedPercent);

              accumulatedPercent += percent;

              return (
                <Circle
                  key={cat.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={cat.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="butt"
                  strokeDasharray={`${gapAdjustedDash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </G>
        </Svg>

        <View
          style={[
            donutStyles.center,
            {
              width: SIZE - STROKE * 2,
              height: SIZE - STROKE * 2,
              borderRadius: (SIZE - STROKE * 2) / 2,
              top: STROKE,
              left: STROKE,
            },
          ]}
        >
          <Text style={donutStyles.centerLabel}>Total</Text>
          <Text style={donutStyles.centerValue}>{formatCurrency(total)}</Text>
        </View>
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  centerFallback: {
    backgroundColor: "#1E293B",
    borderWidth: 22,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F1F5F9",
    textAlign: "center",
    paddingHorizontal: 12,
  },
});

function BarChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]));
  const BAR_HEIGHT = 120;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.chart}>
        {data.map((item, i) => (
          <View key={i} style={barStyles.group}>
            <View style={barStyles.bars}>
              <View style={barStyles.barWrapper}>
                <View
                  style={[
                    barStyles.bar,
                    {
                      height:
                        maxValue > 0
                          ? (item.income / maxValue) * BAR_HEIGHT
                          : 0,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
              <View style={barStyles.barWrapper}>
                <View
                  style={[
                    barStyles.bar,
                    {
                      height:
                        maxValue > 0
                          ? (item.expense / maxValue) * BAR_HEIGHT
                          : 0,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={barStyles.label}>{item.month}</Text>
          </View>
        ))}
      </View>

      <View style={barStyles.legend}>
        <View style={barStyles.legendItem}>
          <View style={[barStyles.legendDot, { backgroundColor: "#3B82F6" }]} />
          <Text style={barStyles.legendText}>Receitas</Text>
        </View>
        <View style={barStyles.legendItem}>
          <View style={[barStyles.legendDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={barStyles.legendText}>Despesas</Text>
        </View>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { width: "100%" },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    paddingBottom: 4,
  },
  group: { alignItems: "center", flex: 1 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  barWrapper: { alignItems: "center", justifyContent: "flex-end", height: 120 },
  bar: { width: 8, borderRadius: 4, minHeight: 4 },
  label: { fontSize: 9, color: "#475569", marginTop: 6 },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: "#64748B" },
});

export default function Insights() {
  const navigation = useNavigation();
  const { transactions } = useTransactions();
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const biggestExpense = useMemo(() => {
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "expense" &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    if (!expenses.length) return null;

    return expenses.reduce(
      (max, t) => (t.value > max.value ? t : max),
      expenses[0],
    );
  }, [transactions, currentMonth, currentYear]);

  const categoryTotals = useMemo((): CategoryTotal[] => {
    const map: Record<string, number> = {};

    transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .forEach((t) => {
        map[t.title] = (map[t.title] || 0) + t.value;
      });

    return Object.entries(map)
      .map(([label, value]) => ({
        label,
        value,
        color: CATEGORY_COLORS[label]?.color ?? "#64748B",
        icon: CATEGORY_COLORS[label]?.icon ?? "receipt-outline",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth, currentYear]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const income = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            t.type === "income" && td.getMonth() === m && td.getFullYear() === y
          );
        })
        .reduce((acc, t) => acc + t.value, 0);

      const expense = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            t.type === "expense" &&
            td.getMonth() === m &&
            td.getFullYear() === y
          );
        })
        .reduce((acc, t) => acc + t.value, 0);

      return { month: MONTHS[m], income, expense };
    });
  }, [transactions, currentMonth, currentYear]);

  const monthBalance = useMemo(() => {
    const income = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === "income" &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.value, 0);

    const expense = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === "expense" &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.value, 0);

    return { income, expense, balance: income - expense };
  }, [transactions, currentMonth, currentYear]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {biggestExpense && (
          <View style={styles.card}>
            <View style={styles.insightRow}>
              <View
                style={[styles.insightDot, { backgroundColor: "#F59E0B" }]}
              />
              <Text style={styles.insightText}>
                Maior gasto do mês:{" "}
                <Text style={{ color: "#F87171", fontWeight: "700" }}>
                  {formatCurrency(biggestExpense.value)}
                </Text>{" "}
                em{" "}
                <Text style={{ color: "#F1F5F9", fontWeight: "600" }}>
                  {biggestExpense.title}
                </Text>
              </Text>
            </View>

            {monthBalance.balance >= 0 ? (
              <View style={styles.insightRow}>
                <View
                  style={[styles.insightDot, { backgroundColor: "#4ADE80" }]}
                />
                <Text style={styles.insightText}>
                  Você está no{" "}
                  <Text style={{ color: "#4ADE80", fontWeight: "700" }}>
                    verde
                  </Text>{" "}
                  este mês — saldo positivo de{" "}
                  <Text style={{ color: "#4ADE80", fontWeight: "700" }}>
                    {formatCurrency(monthBalance.balance)}
                  </Text>
                </Text>
              </View>
            ) : (
              <View style={styles.insightRow}>
                <View
                  style={[styles.insightDot, { backgroundColor: "#F87171" }]}
                />
                <Text style={styles.insightText}>
                  Gastos superaram receitas em{" "}
                  <Text style={{ color: "#F87171", fontWeight: "700" }}>
                    {formatCurrency(Math.abs(monthBalance.balance))}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gastos por categoria</Text>

          {categoryTotals.length > 0 ? (
            <>
              <DonutChart categories={categoryTotals} />

              <View style={styles.categoryList}>
                {categoryTotals.map((cat) => (
                  <View key={cat.label} style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: cat.color },
                        ]}
                      />
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={cat.color}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </View>
                    <Text style={styles.categoryValue}>
                      {formatCurrency(cat.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma despesa registrada este mês.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução mensal</Text>
          <BarChart data={monthlyData} />
          <View style={styles.balanceSummary}>
            <Text style={styles.balanceSummaryLabel}>Média mensal</Text>
            <Text style={styles.balanceSummaryValue}>
              {formatCurrency(
                monthlyData.reduce((acc, d) => acc + d.income - d.expense, 0) /
                  Math.max(
                    monthlyData.filter((d) => d.income > 0 || d.expense > 0)
                      .length,
                    1,
                  ),
              )}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Análise detalhada</Text>
          <Text style={styles.analysisText}>
            {expandedAnalysis
              ? `Com base nas suas transações, os seus maiores gastos estão concentrados em ${
                  categoryTotals[0]?.label ?? "diversas categorias"
                }${categoryTotals[1] ? ` e ${categoryTotals[1].label}` : ""}. ${
                  monthBalance.balance >= 0
                    ? `Este mês você tem um saldo positivo de ${formatCurrency(monthBalance.balance)}, o que representa ${Math.round((monthBalance.balance / Math.max(monthBalance.income, 1)) * 100)}% das suas receitas poupadas.`
                    : `Este mês os gastos superaram as receitas em ${formatCurrency(Math.abs(monthBalance.balance))}. Considere reduzir gastos em ${categoryTotals[0]?.label ?? "categorias não essenciais"}.`
                }`
              : "Clique para ver a análise completa com base nas suas transações..."}
          </Text>
          <TouchableOpacity
            style={styles.analysisBtn}
            onPress={() => setExpandedAnalysis((v) => !v)}
          >
            <Text style={styles.analysisBtnText}>
              {expandedAnalysis ? "Ver menos" : "Ver relatório completo"}
            </Text>
            <Ionicons
              name={expandedAnalysis ? "chevron-up" : "chevron-forward"}
              size={14}
              color="#2563EB"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F1F5F9",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 16,
  },

  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  insightText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 20,
    flex: 1,
  },

  categoryList: {
    marginTop: 20,
    gap: 10,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 13,
    color: "#E2E8F0",
    fontWeight: "500",
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F1F5F9",
  },

  emptyText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    paddingVertical: 20,
  },

  balanceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  balanceSummaryLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  balanceSummaryValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F1F5F9",
  },

  analysisText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 21,
    marginBottom: 12,
  },
  analysisBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  analysisBtnText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
});
