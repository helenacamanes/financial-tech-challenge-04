import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  SafeAreaView,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../@types/navigation";
import OnboardingItem from "../components/OnboardingItem";
import { darkTheme as COLORS } from "../theme";

const slides = [
  {
    id: "1",
    image: require("../../assets/eye.png"),
    title: "Clareza sobre seus gastos",
    description:
      "Visualize para onde seu dinheiro está indo com clareza total, como um farol iluminando o oceano.",
  },
  {
    id: "2",
    image: require("../../assets/pig.png"),
    title: "Controle do seu orçamento",
    description:
      "Defina limites e acompanhe seus gastos em tempo real. Mantenha-se no rumo certo.",
  },
  {
    id: "3",
    image: require("../../assets/target.png"),
    title: "Metas que você consegue enxergar",
    description:
      "Estabeleça objetivos financeiros e acompanhe seu progresso. Cada passo iluminado conta.",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function Onboarding({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const { width } = useWindowDimensions();

  async function markOnboardingAsSeen() {
    await AsyncStorage.setItem("@lighthouse:alreadyLaunched", "true");
  }

  async function handleFinish() {
    await markOnboardingAsSeen();
    navigation.replace("Register");
  }

  async function handleGoToLogin() {
    await markOnboardingAsSeen();
    navigation.replace("Login");
  }

  async function handleNext() {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    } else {
      await handleFinish();
    }
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1, marginTop: 300 }}
        contentContainerStyle={{ flexGrow: 1 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1 }}>
            <OnboardingItem {...item} />
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? "Começar" : "Continuar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleGoToLogin}>
          <Text style={styles.linkText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 12,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 24,
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
