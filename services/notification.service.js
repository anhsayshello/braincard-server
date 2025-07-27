import Notification from "../models/notification.js";
import User from "../models/user.js";
import AppError from "../utils/apperror.js";

const notificationService = {
  async getAllNotifications(userId) {
    const allNotifications = await Notification.find({
      userId: userId,
    }).sort({
      createdAt: -1,
    });
    return allNotifications;
  },

  async getUnreadNotification(userId) {
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });
    return unreadCount;
  },

  async createNotification(userId, title, content) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!title || title.trim() === "" || !content || content.trim() === "") {
      throw new AppError("title or content is missing", 400);
    }
    const newNotification = await Notification.create({
      title,
      content,
      isRead: false,
      userId: userId,
    });

    return newNotification;
  },

  async readOneNotification(id) {
    const updateNotification = await Notification.findByIdAndUpdate(
      id,
      {
        isRead: true,
      },
      { new: true, runValidators: true }
    );
    if (!updateNotification) {
      throw new AppError("Notification not found", 404);
    }
    return updateNotification;
  },

  async readAllNotification() {
    const updateAllNotifications = await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    return {
      message: `Successfully marked ${updateAllNotifications.modifiedCount} notification(s) as read`,
      matchedCount: updateAllNotifications.matchedCount,
      modifiedCount: updateAllNotifications.modifiedCount,
    };
  },

  async deleteNotificationById(id) {
    return await Notification.findByIdAndDelete(id);
  },

  async deleteAllNotifications() {
    const deleteResult = await Notification.deleteMany({});
    return {
      message: `Successfully deleted all ${deleteResult.deletedCount} notification(s)`,
    };
  },
};

export default notificationService;
