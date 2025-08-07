import Card from "../models/card.model.js";
import Deck from "../models/deck.model.js";
import AppError from "../utils/apperror.js";
import {
  calculateNextReview,
  formatCardResponse,
  isValidStatus,
} from "../utils/utils.js";

const cardService = {
  async getAllCards(deckId, q = null, page = "1") {
    const searchQuery = {
      deckId: deckId,
    };
    if (q && typeof q === "string" && q.trim() !== "") {
      const searchRegex = new RegExp(
        q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      searchQuery.$or = [
        { frontCard: { $regex: searchRegex } },
        { backCard: { $regex: searchRegex } },
      ];
    }

    const totalCards = await Card.countDocuments(searchQuery);
    const limitNum = 15;
    const pageNum = Number(page);
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalCards / limitNum);

    const cards = await Card.find(searchQuery).skip(skip).limit(limitNum);
    const formattedCards = cards.map((card) => formatCardResponse(card));

    return {
      cards: formattedCards,
      pagination: {
        limit: limitNum,
        currentPage: pageNum,
        totalPages,
        totalCards,
      },
    };
  },

  async getCardByDeckId(deckId) {
    const deck = await Deck.findById(deckId);
    if (!deck) {
      throw new AppError("Deck not found", 404);
    }

    const now = new Date();
    const cardsToReview = await Card.find({
      deckId,
      nextReview: { $lte: now },
    });

    const formattedCards = cardsToReview.map((card) =>
      formatCardResponse(card)
    );
    return formattedCards;
  },

  async createNewCard(deckId, frontCard, backCard) {
    if (
      !frontCard ||
      frontCard.trim() === "" ||
      !backCard ||
      backCard.trim() === ""
    ) {
      throw new AppError("Missing front or back card", 400);
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      throw new AppError("Deck not found", 404);
    }

    const newCard = await Card.create({
      frontCard,
      backCard,
      deckId,
      status: 0,
      nextReview: new Date(),
      reviewCount: 0,
      forgetCount: 0,
      interval: 0,
    });
    return newCard;
  },

  async updateCardContent(deckId, cardId, frontCard, backCard) {
    if (
      (!frontCard || frontCard.trim() === "") &&
      (!backCard || backCard.trim() === "")
    ) {
      throw new AppError("Missing front or back card", 400);
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new AppError("Card not found", 404);
    }

    if (!card.deckId.equals(deckId)) {
      throw new AppError("Card doesn't belong to this deck", 403);
    }

    card.frontCard = frontCard;
    card.backCard = backCard;
    await card.save();

    return formatCardResponse(card);
  },

  async reviewCard(deckId, cardId, status) {
    if (status === undefined || !isValidStatus(status)) {
      throw new AppError("Invalid status", 400);
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new AppError("Card not found", 404);
    }

    if (!card.deckId.equals(deckId)) {
      throw new AppError("Card doesn't belong to this deck", 403);
    }

    const numericStatus = Number(status);

    const { nextReview, newInterval } = calculateNextReview(
      card.status,
      numericStatus,
      card.reviewCount,
      card.interval
    );

    card.status = numericStatus;
    card.nextReview = nextReview;
    card.interval = newInterval;
    card.reviewCount += 1;
    if (numericStatus === 0) {
      card.forgetCount += 1;
    }
    await card.save();

    return formatCardResponse(card);
  },

  async deleteCard(deckId, cardIds) {
    return await Card.deleteMany({
      _id: { $in: cardIds },
      deckId: deckId,
    });
  },
};
export default cardService;
