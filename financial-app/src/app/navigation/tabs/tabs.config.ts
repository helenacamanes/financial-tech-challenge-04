import { Ionicons } from "@expo/vector-icons";

import Home from "../../../modules/home/presentation/screens/Home";
import Transactions from "../../../modules/transactions/presentation/screens/Transactions";
import Goals from "../../../modules/goals/presentation/screens/Goals";
import Profile from "../../../modules/profile/presentation/screens/Profile";

import { MainTabParamList }
  from "../../../app/navigation/types";

type TabConfig = {
  label: string;

  component: React.ComponentType<any>;

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

    component: Home,

    activeIcon: "home",

    inactiveIcon: "home-outline",
  },

  TransactionsTab: {
    label: "Transações",

    component: Transactions,

    activeIcon: "list",

    inactiveIcon: "list-outline",
  },

  GoalsTab: {
    label: "Metas",

    component: Goals,

    activeIcon: "flag",

    inactiveIcon: "flag-outline",
  },

  ProfileTab: {
    label: "Perfil",

    component: Profile,

    activeIcon: "person",

    inactiveIcon: "person-outline",
  },
};