import { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
};
