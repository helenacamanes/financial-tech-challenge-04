import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useInsightsDashboard }
  from "../../state/useInsightsDashboard";
import { DonutChart }
  from "../components/DonutChart";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function BarChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]));
  const BAR_HEIGHT = 120;

  const getHeight = (value: number) =>
    maxValue > 0 ? (value / maxValue) * BAR_HEIGHT : 0;

  const [animValues] = useState(() =>
    data.map(() => ({
      income: new Animated.Value(0),
      expense: new Animated.Value(0),
    })),
  );

  useEffect(() => {
    const animations = animValues.flatMap((v, i) => {
      const targetIncome = getHeight(data[i]?.income ?? 0);
      const targetExpense = getHeight(data[i]?.expense ?? 0);

      return [
        Animated.spring(v.income, {
          toValue: targetIncome,
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.spring(v.expense, {
          toValue: targetExpense,
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }),
      ];
    });

    Animated.stagger(70, animations).start();
  }, [data]);

  return (
    <View style={barStyles.container}>
      <View style={barStyles.chart}>
        {data.map((item, i) => (
          <View key={i} style={barStyles.group}>
            <View style={barStyles.bars}>
              <View style={barStyles.barWrapper}>
                <Animated.View
                  style={[
                    barStyles.bar,
                    {
                      height: animValues[i]?.income ?? 0,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
              <View style={barStyles.barWrapper}>
                <Animated.View
                  style={[
                    barStyles.bar,
                    {
                      height: animValues[i]?.expense ?? 0,
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
  bar: { width: 8, borderRadius: 4 },
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
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);
  const {
    biggestExpense,
    categoryTotals,
    monthlyData,
    monthBalance,
    averageMonthlyBalance,
    expandedAnalysisText,
    collapsedAnalysisText,
  } = useInsightsDashboard();

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
                averageMonthlyBalance,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Análise detalhada</Text>
          <Text style={styles.analysisText}>
            {expandedAnalysis
              ? expandedAnalysisText
              : collapsedAnalysisText}
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
