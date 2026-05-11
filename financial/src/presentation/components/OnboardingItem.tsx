import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";
import { darkTheme as COLORS } from "../theme";

interface Props {
  image: ImageSourcePropType;
  gradient?: ImageSourcePropType;
  title: string;
  description: string;
}

export default function OnboardingItem({
  image,
  gradient,
  title,
  description,
}: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      {gradient ? (
        <Image source={gradient} style={StyleSheet.absoluteFillObject} />
      ) : null}

      <View style={styles.centerContent}>
        <View style={styles.iconWrapper}>
          <Image source={image} style={styles.icon} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    width: 128,
    height: 128,
    resizeMode: "contain",
    borderRadius: 100,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
