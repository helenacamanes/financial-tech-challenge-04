import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  notifyGoalReached,
  sendLocalNotification,
} from "../services/notificationService";

type NotificationContextData = {
  pushToken: string | null;
  dailyReminderEnabled: boolean;
  toggleDailyReminder: (enabled: boolean) => Promise<void>;
  notifyGoal: (goalTitle: string) => Promise<void>;
  sendNotification: (title: string, body: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotifications().then(setPushToken);

    scheduleDailyReminder(21, 0);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notificação recebida:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notificação tocada:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function toggleDailyReminder(enabled: boolean) {
    setDailyReminderEnabled(enabled);
    if (enabled) {
      await scheduleDailyReminder(21, 0);
    } else {
      await cancelDailyReminder();
    }
  }

  async function notifyGoal(goalTitle: string) {
    await notifyGoalReached(goalTitle);
  }

  async function sendNotification(title: string, body: string) {
    await sendLocalNotification(title, body);
  }

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        dailyReminderEnabled,
        toggleDailyReminder,
        notifyGoal,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
