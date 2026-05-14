import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

const isNative = Platform.OS !== "web" && Device.isDevice;

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!isNative) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permissão para notificações negada.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  return token;
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  if (!isNative) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleDailyReminder(hour = 21, minute = 0) {
  if (!isNative) return;

  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💡 Lighthouse Finance",
      body: "Não te esqueças de registar as despesas de hoje!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  if (!isNative) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminders = scheduled.filter(
    (n) => n.content.title === "💡 Lighthouse Finance"
  );
  for (const reminder of reminders) {
    await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
  }
}

export async function notifyGoalReached(goalTitle: string) {
  if (!isNative) return;

  await sendLocalNotification(
    "Meta atingida!",
    `Parabéns! Atingiste a tua meta "${goalTitle}". Continua assim!`
  );
}

export async function cancelAllNotifications() {
  if (!isNative) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
}