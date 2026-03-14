const admin = require("../config/firebase");
const User = require("../models/User");

class NotificationService {
  /**
   * Send a push notification to a specific user
   * @param {string} userId - ID of the user to notify
   * @param {object} payload - Notification payload { title, body, data }
   */
  static async sendToUser(userId, payload) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        console.log(`[Notification] User ${userId} has no FCM token registered.`);
        return false;
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };

      const response = await admin.messaging().send(message);
      console.log(`[Notification] Sent to user ${userId}:`, response);
      return true;
    } catch (error) {
      console.error(`[Notification] Error sending to user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Send a push notification to multiple users
   * @param {string[]} userIds - Array of user IDs
   * @param {object} payload - Notification payload { title, body, data }
   */
  static async sendToMultipleUsers(userIds, payload) {
    try {
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true, $ne: "" } });
      const tokens = users.map(user => user.fcmToken);

      if (tokens.length === 0) return false;

      const message = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log(`[Notification] Multicast sent. successes: ${response.successCount}, failures: ${response.failureCount}`);
      return response.successCount > 0;
    } catch (error) {
      console.error("[Notification] Error sending multicast:", error);
      return false;
    }
  }

  /**
   * Send a push notification to ALL users who have FCM tokens globally
   * @param {object} payload - Notification payload { title, body, data }
   */
  static async sendToAllUsers(payload) {
    try {
      const users = await User.find({ fcmToken: { $exists: true, $ne: "" } });
      const tokens = users.map(user => user.fcmToken);

      if (tokens.length === 0) return false;

      // Filter out duplicate tokens if any and chunk to 500 max per Firebase limit
      const uniqueTokens = [...new Set(tokens)];
      const maxTokensPerBatch = 500;
      let successCount = 0;

      for (let i = 0; i < uniqueTokens.length; i += maxTokensPerBatch) {
        const batchTokens = uniqueTokens.slice(i, i + maxTokensPerBatch);
        const message = {
          tokens: batchTokens,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data || {},
        };

        const response = await admin.messaging().sendMulticast(message);
        successCount += response.successCount;
      }

      console.log(`[Notification] Global Multicast sent. Total successes: ${successCount}`);
      return successCount > 0;
    } catch (error) {
      console.error("[Notification] Error sending global multicast:", error);
      return false;
    }
  }
}

module.exports = NotificationService;
