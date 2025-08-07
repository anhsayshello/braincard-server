import mongoose from "mongoose";
import User from "../models/user.model.js";
import AppError from "../utils/apperror.js";

const userService = {
  async getMe(userId) {
    const user = await User.findById(userId);
    return user;
  },

  async getStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const totalDecks = await mongoose.model("Deck").countDocuments({
      userId: mongoose.Types.ObjectId.createFromHexString(userId),
    });

    const cardStats = await mongoose.model("Card").aggregate([
      {
        $lookup: {
          from: "decks",
          localField: "deckId",
          foreignField: "_id",
          as: "deck",
        },
      },
      {
        $match: {
          "deck.userId": mongoose.Types.ObjectId.createFromHexString(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          cardsStudied: {
            $sum: {
              $cond: [{ $gt: ["$reviewCount", 0] }, 1, 0],
            },
          },
          cardsNotLearning: {
            $sum: {
              $cond: [{ $eq: ["$reviewCount", 0] }, 1, 0],
            },
          },
          cardsStudying: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$reviewCount", 0] },
                    { $lt: ["$interval", 14] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          difficultCards: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$forgetCount", 5] },
                    { $lt: ["$interval", 14] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          masteredCards: {
            $sum: {
              $cond: [{ $gte: ["$interval", 14] }, 1, 0],
            },
          },
        },
      },
    ]);

    const cardStatsResult = cardStats[0] || {
      totalCards: 0,
      cardsStudied: 0,
      cardsStudying: 0,
      cardsNotLearning: 0,
      difficultCards: 0,
      masteredCards: 0,
    };

    return {
      totalDecks,
      ...cardStatsResult,
    };
  },

  async updateUser(userId, name) {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { name: name }
    );
    return updatedUser;
  },
};

export default userService;
