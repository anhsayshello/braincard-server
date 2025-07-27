import { Router } from "express";

import cardService from "../services/card.service.js";

const cardsRouter = Router();

cardsRouter.get("/:deckId/cards", async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { q, page } = req.query;
    const result = await cardService.getAllCards(deckId, q, page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

cardsRouter.get("/:deckId/cards/review", async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const result = await cardService.getCardByDeckId(deckId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

cardsRouter.post("/:deckId/cards", async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { frontCard, backCard } = req.body;
    const result = await cardService.createNewCard(deckId, frontCard, backCard);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

cardsRouter.put("/:deckId/cards/:cardId", async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    const { frontCard, backCard } = req.body;
    const result = await cardService.updateCardContent(
      deckId,
      cardId,
      frontCard,
      backCard
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

cardsRouter.patch("/:deckId/cards/:cardId/review", async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    const { status } = req.body;
    const result = await cardService.reviewCard(deckId, cardId, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

cardsRouter.delete("/:deckId/cards", async (req, res, next) => {
  try {
    const { deckId } = req.params;
    const { cardIds } = req.body;
    await cardService.deleteCard(deckId, cardIds);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default cardsRouter;
