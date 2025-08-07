import Card from "../models/card.model.js";
import Deck from "../models/deck.model.js";
import AppError from "../utils/apperror.js";
import { formatCardResponse } from "../utils/utils.js";

export default async function searchService(
  userId,
  deckId,
  q,
  filter,
  sortBy = "created-at",
  sortOrder = "desc",
  page = "1"
) {
  let deckIds;
  if (deckId) {
    const deck = await Deck.findOne({ _id: deckId, userId: userId });
    if (!deck) {
      throw new AppError("Deck not found", 404);
    }
    deckIds = [deckId];
  } else {
    const userDecks = await Deck.find({ userId: userId }).select("_id");
    deckIds = userDecks.map((deck) => deck._id);
  }

  if (deckIds.length === 0) {
    return {
      cards: [],
      pagination: {
        limit: 15,
        currentPage: Number(page),
        totalPages: 0,
        totalCards: 0,
      },
    };
  }

  const searchQuery = {
    deckId: { $in: deckIds },
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

  if (filter) {
    switch (filter) {
      case "in-review":
        searchQuery.nextReview = { $lte: new Date() };
        break;
      case "new-cards":
        searchQuery.reviewCount = 0;
        break;
      case "mastered":
        searchQuery.interval = { $gte: 14 };
        break;
    }
  }

  const totalCards = await Card.countDocuments(searchQuery);

  const limitNum = 15;
  const pageNum = Number(page);
  const skip = (pageNum - 1) * limitNum;
  const totalPages = Math.ceil(totalCards / limitNum);

  const sortFieldMap = {
    "front-card": "frontCard",
    "created-at": "createdAt",
    "review-count": "reviewCount",
    "forget-count": "forgetCount",
    interval: "interval",
  };

  const validSortFields = Object.keys(sortFieldMap);
  const dbSortField = validSortFields.includes(sortBy)
    ? sortFieldMap[sortBy]
    : "createdAt";

  const finalSortOrder = ["asc", "desc"].includes(sortOrder)
    ? sortOrder
    : "desc";

  const sortObj = {};
  sortObj[dbSortField] = finalSortOrder === "desc" ? -1 : 1;

  const cards = await Card.find(searchQuery)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

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
}
