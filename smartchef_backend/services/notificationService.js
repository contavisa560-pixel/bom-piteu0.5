// smartchef_backend/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  
  // Create a notification for a user
  static async createNotification(userId, type, title, message, data = {}) {
    try {
      // Check if the user has notifications enabled for this type
      const user = await User.findById(userId);
      
      if (!user) {
        console.error('User not found:', userId);
        return null;
      }
      
      // Map type to the corresponding setting
      const settingMap = {
        'login_alert': 'alertLogin',
        'security_alert': 'alertSecurity',
        'new_recipe': 'notifyRecipes',
        'newsletter': 'newsletter'
      };
      
      const settingKey = settingMap[type];
      
      // If the user disabled this notification type, do not create it
      if (settingKey && user.settings?.[settingKey] === false) {
        console.log(`Notification ${type} blocked - user disabled ${settingKey}`);
        return null;
      }
      
      // Create the notification
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        read: false
      });
      
      console.log(`✅ Notification created: ${type} for user ${userId}`);
      return notification;
      
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }
  
  // Create login alert notification
  static async createLoginAlert(userId, device, ip, location) {
    return this.createNotification(
      userId,
      'login_alert',
      ' New Login Detected',
      `A new login was performed ${device ? `on ${device}` : ''}${ip ? ` (IP: ${ip})` : ''}`,
      { device, ip, location, timestamp: new Date() }
    );
  }
  
  // Create security alert notification
  static async createSecurityAlert(userId, action, details) {
    return this.createNotification(
      userId,
      'security_alert',
      ' Security Alert',
      `${action}: ${details}`,
      { action, details, timestamp: new Date() }
    );
  }
  
  // Create new recipe notification
  static async createNewRecipeAlert(userId, recipeId, recipeTitle) {
    return this.createNotification(
      userId,
      'new_recipe',
      'New Recipe Available',
      `Check out the new recipe: ${recipeTitle}`,
      { recipeId, recipeTitle }
    );
  }
  
  // Create newsletter notification
  static async createNewsletter(userId, subject, content) {
    return this.createNotification(
      userId,
      'newsletter',
      `📬 ${subject}`,
      content,
      { subject }
    );
  }
  
  // Create bulk notifications for multiple users
  static async createBulkNotifications(userIds, type, title, message, data = {}) {
    const results = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification(userId, type, title, message, data);
      if (notification) {
        results.push(notification);
      }
    }
    
    console.log(`📊 Bulk notifications: ${results.length} created out of ${userIds.length} attempts`);
    return results;
  }
  
  // Create notification for all users with a given setting enabled
  static async createForUsersWithSetting(settingKey, type, title, message, data = {}) {
    try {
      // Find users with the setting enabled (or not defined, which defaults to true)
      const users = await User.find({
        $or: [
          { [`settings.${settingKey}`]: true },
          { [`settings.${settingKey}`]: { $exists: false } }
        ]
      });
      
      console.log(`📊 Found ${users.length} users with ${settingKey} enabled`);
      
      return this.createBulkNotifications(
        users.map(u => u._id),
        type,
        title,
        message,
        data
      );
      
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return [];
    }
  }
}

module.exports = NotificationService;