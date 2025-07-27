import mongoose from "mongoose";
import { configureJSON } from "../utils/utils.js";

mongoose.set("strictQuery", false);

const cardSchema = new mongoose.Schema(
  {
    frontCard: {
      type: String,
      required: true,
    },
    backCard: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    nextReview: {
      type: Date,
      default: function () {
        return new Date(Date.now());
      },
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    forgetCount: {
      type: Number,
      default: 0,
    },
    interval: {
      type: Number,
      default: 1,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
  },
  { timestamps: true }
);

configureJSON(cardSchema);

export default mongoose.model("Card", cardSchema);
