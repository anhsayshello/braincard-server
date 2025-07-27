import mongoose from "mongoose";
import Deck from "../models/deck.js";
import User from "../models/user.js";
import AppError from "../utils/apperror.js";

const deckService = {
  async getAllDecks(userId) {
    const allDecks = await Deck.aggregate([
      // Match decks của user
      {
        $match: {
          userId: mongoose.Types.ObjectId.createFromHexString(userId),
        },
      },

      // Lookup cards và tính toán stats
      {
        $lookup: {
          from: "cards",
          localField: "_id",
          foreignField: "deckId",
          as: "cards",
        },
      },

      // Add computed fields
      {
        $addFields: {
          totalCards: { $size: "$cards" },
          newCards: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $eq: ["$$this.reviewCount", 0] },
              },
            },
          },
          cardsInReview: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $lte: ["$$this.nextReview", new Date()] },
              },
            },
          },
          masteredCards: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $gte: ["$$this.interval", 14] },
              },
            },
          },
        },
      },

      // Remove cards array (không cần thiết trong response)
      {
        $project: {
          cards: 0,
        },
      },

      // Sort by creation date
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return allDecks.map((deck) => {
      // eslint-disable-next-line no-unused-vars
      const { _id, __v, ...rest } = deck;
      return {
        id: _id,
        ...rest,
      };
    });
  },

  async createDeck(name, userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    if (!name || name.trim().length === 0) {
      throw new AppError("Name is required and must be a valid name", 400);
    }
    if (await Deck.findOne({ name })) {
      throw new AppError("Name already exist", 400);
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 255) {
      throw new AppError("Name must be less than 255 characters", 400);
    }

    console.log("Creating deck with name:", trimmedName);

    const newDeck = await Deck.create({
      name: trimmedName,
      userId: userId,
    });

    const response = {
      ...newDeck.toJSON(),
      totalCards: 0,
      newCards: 0,
      cardsInReview: 0,
      masteredCards: 0,
    };
    return response;
  },

  async updateDeck(deckId, userId, name) {
    const trimmedName = name.trim();
    if (!name || trimmedName.length === 0) {
      throw new AppError("Name is required and must be a valid name", 400);
    }

    const deck = await Deck.findOne({ _id: deckId, userId: userId });
    if (!deck) {
      throw new AppError("Deck not found", 404);
    }

    const existingDeck = await Deck.findOne({
      name: trimmedName,
      _id: { $ne: deckId },
      userId: userId,
    });
    if (existingDeck) {
      throw new AppError("Name already exist", 400);
    }

    const updatedDeck = await Deck.findByIdAndUpdate(
      deckId,
      { name: trimmedName },
      { new: true, runValidators: true }
    );

    if (!updatedDeck) {
      throw new AppError("Deck not found", 404);
    }

    const deckWithStats = await Deck.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(deckId),
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "_id",
          foreignField: "deckId",
          as: "cards",
        },
      },
      {
        $addFields: {
          totalCards: { $size: "$cards" },
          newCards: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $eq: ["$this.reviewCount", 0] },
              },
            },
          },
          cardsInReview: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $lte: ["$this.nextReview", new Date()] },
              },
            },
          },
          masteredCards: {
            $size: {
              $filter: {
                input: "$cards",
                cond: { $gte: ["$this.interval", 14] },
              },
            },
          },
        },
      },
      {
        $project: {
          cards: 0,
        },
      },
    ]);

    return deckWithStats[0];
  },

  async deleteDeck(deckId, userId) {
    return await Deck.findOneAndDelete({
      _id: deckId,
      userId: userId,
    });
  },
};

export default deckService;
