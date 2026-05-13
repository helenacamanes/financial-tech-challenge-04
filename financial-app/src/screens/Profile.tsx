import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTransactions } from "../contexts/TransactionContext";
import { useGoals } from "../contexts/GoalsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { signOutUser } from "../services/authService";
import { RootStackParamList } from "../@types/navigation";

const TERMS_TEXT = `Termos de Uso — Lighthouse Finance

Última atualização: março de 2025

1. Aceitação dos Termos
Ao usar o Lighthouse Finance, você concorda com estes Termos de Uso. Se não concordar, não deve utilizar o aplicativo.

2. Descrição do Serviço
O Lighthouse Finance é um aplicativo de gestão financeira pessoal que permite registrar transações, definir metas de economia e acompanhar seu progresso financeiro.

3. Dados Pessoais
Seus dados financeiros são armazenados de forma segura. Não compartilhamos seus dados com terceiros sem o seu consentimento.

4. Responsabilidade
O Lighthouse Finance é uma ferramenta de apoio à organização financeira. Não nos responsabilizamos por decisões financeiras tomadas com base nas informações exibidas no aplicativo.

5. Alterações nos Termos
Podemos atualizar estes Termos a qualquer momento. As alterações serão comunicadas pelo aplicativo.

6. Contato
Para dúvidas relacionadas a estes Termos, entre em contato pelo suporte do aplicativo.`;

const PRIVACY_TEXT = `Política de Privacidade — Lighthouse Finance

Última atualização: março de 2025

1. Dados que coletamos
Coletamos apenas os dados necessários para o funcionamento do aplicativo:
• Nome e e-mail para autenticação
• Transações financeiras cadastradas por você
• Metas financeiras criadas por você

2. Como usamos os dados
Seus dados são usados exclusivamente para:
• Exibir seu histórico financeiro
• Calcular estatísticas e relatórios pessoais
• Enviar notificações que você autorizou

3. Armazenamento
Os dados são armazenados de forma segura no Firebase (Google Cloud), com criptografia em trânsito e em repouso.

4. Compartilhamento de dados
Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.

5. Seus direitos
Você tem o direito de:
• Acessar seus dados
• Corrigir dados incorretos
• Excluir sua conta e os dados associados

6. Cookies e rastreamento
Não utilizamos cookies de rastreamento de terceiros.

7. Contato
Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelo suporte do aplicativo.`;

function LegalModal({
  visible,
  title,
  content,
  onClose,
}: {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <TouchableOpacity
          style={modalStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={modalStyles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollContent}
          >
            <Text style={modalStyles.content}>{content}</Text>
          </ScrollView>

          <TouchableOpacity style={modalStyles.confirmBtn} onPress={onClose}>
            <Text style={modalStyles.confirmBtnText}>Entendi</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function Profile() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { dailyReminderEnabled, toggleDailyReminder } = useNotifications();
  const { user } = useAuth();

  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const totalTransactions = transactions.length;
  const activeGoals = goals.filter((g) => g.current < g.target).length;

  const displayName = useMemo(() => {
    const name = user?.displayName?.trim();

    if (name) return name;

    const emailPrefix = user?.email?.split("@")[0]?.trim();

    if (emailPrefix) {
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }

    return "Usuário";
  }, [user]);

  const avatarLetter = useMemo(() => {
    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  const userEmail = user?.email ?? "E-mail não disponível";

  const daysOfUse = useMemo(() => {
    const creationTime = user?.metadata?.creationTime;

    if (!creationTime) return 0;

    const createdAt = new Date(creationTime);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(diff + 1, 1);
  }, [user]);

  async function handleLogout() {
    try {
      console.log("Tentando sair da conta...");
      await signOutUser();
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro ao sair:", error);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.screenTitle}>Perfil</Text>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Perfil</Text>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTransactions}</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#3B82F6" }]}>
                {activeGoals}
              </Text>
              <Text style={styles.statLabel}>Metas ativas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {daysOfUse}
              </Text>
              <Text style={styles.statLabel}>Dias de uso</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Configurações</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconWrapper}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color="#94A3B8"
                />
              </View>
              <View>
                <Text style={styles.menuLabel}>Notificações</Text>
                <Text style={styles.menuSubLabel}>
                  {dailyReminderEnabled
                    ? "Lembrete das 21h ativo"
                    : "Desativado"}
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={toggleDailyReminder}
              trackColor={{ false: "#334155", true: "#2563EB" }}
              thumbColor={dailyReminderEnabled ? "#FFFFFF" : "#64748B"}
            />
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              const parentNavigation = navigation.getParent();

              if (parentNavigation) {
                parentNavigation.navigate("ChangePassword" as never);
              } else {
                navigation.navigate("ChangePassword");
              }
            }}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.menuLabel}>Alterar senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#475569" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Sobre o Lighthouse</Text>
          <Text style={styles.aboutText}>
            Ilumine sua vida financeira com clareza e controle. Assim como um
            farol guia navios no oceano, o Lighthouse ajuda a orientar suas
            decisões financeiras.
          </Text>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={() => setTermsVisible(true)}>
              <Text style={styles.linkText}>Termos de uso</Text>
            </TouchableOpacity>
            <Text style={styles.linkDot}>·</Text>
            <TouchableOpacity onPress={() => setPrivacyVisible(true)}>
              <Text style={styles.linkText}>Política de privacidade</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#F87171" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <LegalModal
        visible={termsVisible}
        title="Termos de uso"
        content={TERMS_TEXT}
        onClose={() => setTermsVisible(false)}
      />
      <LegalModal
        visible={privacyVisible}
        title="Política de privacidade"
        content={PRIVACY_TEXT}
        onClose={() => setPrivacyVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#334155",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  menuSubLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 10,
    marginLeft: 48,
  },
  aboutText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 14,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  linkDot: {
    color: "#475569",
    fontSize: 12,
  },
  versionText: {
    fontSize: 12,
    color: "#475569",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 4,
  },
  logoutText: {
    color: "#F87171",
    fontWeight: "700",
    fontSize: 15,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: "#334155",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#F1F5F9",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 22,
  },
  confirmBtn: {
    margin: 16,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
