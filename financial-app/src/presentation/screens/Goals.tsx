import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { useGoals, Goal } from "../contexts/GoalsContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const getPercent = (current: number, target: number) =>
  Math.min(Math.round((current / target) * 100), 100);

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

const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Informe o nome da meta"),
  target: z
    .string()
    .trim()
    .min(1, "Informe o valor alvo")
    .refine((value) => {
      const parsed = parseCurrencyInput(value);
      return !isNaN(parsed) && parsed > 0;
    }, "Informe um valor alvo válido"),
  initial: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const parsed = parseCurrencyInput(value);
      return !isNaN(parsed) && parsed >= 0;
    }, "Informe um valor inicial válido"),
});

const addValueSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((value) => {
      const parsed = parseCurrencyInput(value);
      return !isNaN(parsed) && parsed > 0;
    }, "Informe um valor válido"),
});

type CreateGoalErrors = {
  title?: string;
  target?: string;
  initial?: string;
};

type AddValueErrors = {
  value?: string;
};

function AddGoalSheet({ onClose }: { onClose: () => void }) {
  const { addGoal } = useGoals();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [initial, setInitial] = useState("");
  const [errors, setErrors] = useState<CreateGoalErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const result = createGoalSchema.safeParse({ title, target, initial });

    if (!result.success) {
      const fieldErrors: CreateGoalErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateGoalErrors;
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

      const targetValue = parseCurrencyInput(target);
      const initialValue = initial.trim() ? parseCurrencyInput(initial) : 0;

      await addGoal({
        title: title.trim(),
        target: targetValue,
        current: initialValue,
        icon: "star-outline",
        color: "#3B82F6",
      });

      onClose();
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      Alert.alert(
        "Erro ao criar meta",
        error instanceof Error
          ? error.message
          : "Não foi possível criar a meta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.modalSheet}>
      <View style={styles.modalHandle} />

      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Nova meta</Text>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <Ionicons name="close" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.fieldLabel}>Nome da meta</Text>
        <TextInput
          style={[
            styles.modalInput,
            errors.title ? styles.modalInputError : undefined,
          ]}
          placeholder="Ex: Viagem dos sonhos"
          placeholderTextColor="#475569"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          autoFocus
        />
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title}</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Valor alvo</Text>
        <TextInput
          style={[
            styles.modalInput,
            errors.target ? styles.modalInputError : undefined,
          ]}
          placeholder="Ex: 10.000,00"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          value={target}
          onChangeText={(text) => {
            setTarget(maskCurrencyInput(text));
            if (errors.target) {
              setErrors((prev) => ({ ...prev, target: undefined }));
            }
          }}
        />
        {errors.target ? (
          <Text style={styles.errorText}>{errors.target}</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Valor inicial (opcional)</Text>
        <TextInput
          style={[
            styles.modalInput,
            errors.initial ? styles.modalInputError : undefined,
          ]}
          placeholder="Quanto você já tem?"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          value={initial}
          onChangeText={(text) => {
            setInitial(maskCurrencyInput(text));
            if (errors.initial) {
              setErrors((prev) => ({ ...prev, initial: undefined }));
            }
          }}
        />
        {errors.initial ? (
          <Text style={styles.errorText}>{errors.initial}</Text>
        ) : null}

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modalConfirmBtn,
              loading && styles.modalConfirmBtnDisabled,
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.modalConfirmText}>
              {loading ? "Criando..." : "Criar meta"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function GoalCard({
  goal,
  onAdd,
}: {
  goal: Goal;
  onAdd: (goal: Goal) => void;
}) {
  const percent = getPercent(goal.current, goal.target);
  const remaining = goal.target - goal.current;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconWrapper, { backgroundColor: goal.color + "22" }]}
        >
          <Ionicons name={goal.icon as any} size={20} color={goal.color} />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{goal.title}</Text>
          <Text style={styles.cardValues}>
            {formatCurrency(goal.current)}{" "}
            <Text style={styles.cardTarget}>
              de {formatCurrency(goal.target)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percent}%` as any, backgroundColor: goal.color },
          ]}
        />
      </View>

      <View style={styles.progressLabels}>
        <Text style={[styles.percentText, { color: goal.color }]}>
          {percent}% completo
        </Text>
        {remaining > 0 ? (
          <Text style={styles.remainingText}>
            Faltam {formatCurrency(remaining)}
          </Text>
        ) : (
          <Text style={[styles.remainingText, { color: "#4ADE80" }]}>
            🎉 Meta atingida!
          </Text>
        )}
      </View>

      {remaining > 0 && (
        <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(goal)}>
          <Text style={styles.addBtnText}>Adicionar valor</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function Goals() {
  const { goals, addValueToGoal } = useGoals();

  const [addModal, setAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [addValue, setAddValue] = useState("");
  const [addErrors, setAddErrors] = useState<AddValueErrors>({});
  const [addLoading, setAddLoading] = useState(false);

  const [newGoalModal, setNewGoalModal] = useState(false);

  function handleOpenAdd(goal: Goal) {
    setSelectedGoal(goal);
    setAddValue("");
    setAddErrors({});
    setAddModal(true);
  }

  async function handleConfirmAdd() {
    if (!selectedGoal) return;

    const result = addValueSchema.safeParse({ value: addValue });

    if (!result.success) {
      const issue = result.error.issues[0];
      setAddErrors({ value: issue.message });
      return;
    }

    try {
      setAddErrors({});
      setAddLoading(true);

      const amount = parseCurrencyInput(addValue);
      await addValueToGoal(selectedGoal.id, amount);

      setAddModal(false);
    } catch (error) {
      console.error("Erro ao adicionar valor à meta:", error);
      Alert.alert(
        "Erro ao atualizar meta",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a meta.",
      );
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.screenTitle}>Metas</Text>
            <View style={styles.taglineRow}>
              <Ionicons name="sunny-outline" size={13} color="#F59E0B" />
              <Text style={styles.tagline}>Cada passo iluminado conta</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <GoalCard goal={item} onAdd={handleOpenAdd} />
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setNewGoalModal(true)}
          >
            <Ionicons name="add" size={18} color="#2563EB" />
            <Text style={styles.createBtnText}>Criar nova meta</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={addModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAddModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Adicionar valor</Text>
                {selectedGoal && (
                  <Text style={styles.modalSubtitle}>{selectedGoal.title}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setAddModal(false)}
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width:
                          `${getPercent(selectedGoal.current, selectedGoal.target)}%` as any,
                        backgroundColor: selectedGoal.color,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text
                    style={[styles.percentText, { color: selectedGoal.color }]}
                  >
                    {getPercent(selectedGoal.current, selectedGoal.target)}%
                    completo
                  </Text>
                  <Text style={styles.remainingText}>
                    Faltam{" "}
                    {formatCurrency(selectedGoal.target - selectedGoal.current)}
                  </Text>
                </View>
              </View>
            )}

            <TextInput
              style={[
                styles.modalInput,
                addErrors.value ? styles.modalInputError : undefined,
              ]}
              placeholder="R$ 0,00"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={addValue}
              onChangeText={(text) => {
                setAddValue(maskCurrencyInput(text));
                if (addErrors.value) setAddErrors({});
              }}
              autoFocus
            />
            {addErrors.value ? (
              <Text style={styles.errorText}>{addErrors.value}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  addLoading && styles.modalConfirmBtnDisabled,
                ]}
                onPress={handleConfirmAdd}
                disabled={addLoading}
              >
                <Text style={styles.modalConfirmText}>
                  {addLoading ? "Confirmando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={newGoalModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setNewGoalModal(false)}
          />
          <AddGoalSheet onClose={() => setNewGoalModal(false)} />
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 6,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 13,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 2,
  },
  cardValues: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F1F5F9",
  },
  cardTarget: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748B",
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  percentText: {
    fontSize: 12,
    fontWeight: "700",
  },
  remainingText: {
    fontSize: 12,
    color: "#64748B",
  },

  addBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  addBtnText: {
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 14,
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 4,
  },
  createBtnText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
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
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
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
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2563EB",
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
});
