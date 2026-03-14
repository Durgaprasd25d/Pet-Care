import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

export class NotificationService {
  /**
   * Request permission for iOS/Android 13+ and get FCM token
   */
  static async requestUserPermission(): Promise<string | null> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[NotificationService] Authorization status:', authStatus);
        const token = await this.getFCMToken();
        return token;
      } else {
        console.log('[NotificationService] Permission denied by user');
        return null;
      }
    } catch (error) {
      console.error('[NotificationService] Permission error:', error);
      return null;
    }
  }

  /**
   * Get the FCM token for this device
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      // For iOS, recommend ensuring APNs token is set before getting FCM token, but FCM handles it silently mostly
      const token = await messaging().getToken();
      console.log('[NotificationService] FCM Token:', token);
      return token;
    } catch (error) {
      console.error('[NotificationService] Error getting token:', error);
      return null;
    }
  }

  /**
   * Listen for incoming notifications when app is in Foreground
   */
  static setupForegroundListener() {
    return messaging().onMessage(async remoteMessage => {
      console.log('[NotificationService] Foreground Message:', remoteMessage);
      
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message from PetCare',
        [{ text: 'OK' }]
      );
    });
  }

  /**
   * Listens for when a user clicks on a notification in background
   */
  static handleBackgroundInteraction() {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        '[NotificationService] Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // Implement your navigation logic here based on notification payload
    });
  }

  /**
   * Listen for when a user clicks on a notification in quit state
   */
  static handleQuitInteraction() {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            '[NotificationService] Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          // Implement your navigation logic here
        }
      });
  }
}
