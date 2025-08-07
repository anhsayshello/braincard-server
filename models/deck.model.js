import mongoose from "mongoose";
import { configureJSON } from "../utils/utils.js";

mongoose.set("strictQuery", false);
const deckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [3, "Name must be at least 3 character"],
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

configureJSON(deckSchema);

export default mongoose.model("Deck", deckSchema);
