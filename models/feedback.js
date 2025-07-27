import mongoose from "mongoose";
import { configureJSON } from "../utils/utils.js";

mongoose.set("strictQuery", false);

const feedbackSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: [10, "content must be at least 10 characters"],
      required: true,
    },
    type: {
      type: Number,
      enum: [0, 1, 2, 3],
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

configureJSON(feedbackSchema);

export default mongoose.model("Feedback", feedbackSchema);
