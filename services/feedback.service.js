import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/apperror.js";

const feedbackService = {
  async sendFeedback(userId, content, type) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!content || content.trim() === "") {
      throw new AppError("Content is required", 400);
    }

    if (type === undefined || type === null || type === "") {
      throw new AppError("Type is required", 400);
    }

    const newFeedback = await Feedback.create({
      content: content.trim(),
      type,
      userId: userId,
    });

    return newFeedback;
  },
};

export default feedbackService;
