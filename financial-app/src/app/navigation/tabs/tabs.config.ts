import { Ionicons } from "@expo/vector-icons";

import { MainTabParamList }
  from "../../../app/navigation/types";
import {
  getGoalsScreen,
  getHomeScreen,
  getProfileScreen,
  getTransactionsScreen,
} from "../lazyScreens";

type TabConfig = {
  label: string;

  getComponent: () => React.ComponentType<any>;

  activeIcon:
    React.ComponentProps<
      typeof Ionicons
    >["name"];

  inactiveIcon:
    React.ComponentProps<
      typeof Ionicons
    >["name"];
};

export const tabsConfig: Record<
  keyof MainTabParamList,
  TabConfig
> = {
  HomeTab: {
    label: "Início",

    getComponent: getHomeScreen,

    activeIcon: "home",

    inactiveIcon: "home-outline",
  },

  TransactionsTab: {
    label: "Transações",

    getComponent: getTransactionsScreen,

    activeIcon: "list",

    inactiveIcon: "list-outline",
  },

  GoalsTab: {
    label: "Metas",

    getComponent: getGoalsScreen,

    activeIcon: "flag",

    inactiveIcon: "flag-outline",
  },

  ProfileTab: {
    label: "Perfil",

    getComponent: getProfileScreen,

    activeIcon: "person",

    inactiveIcon: "person-outline",
  },
};
