import mongoose from "mongoose";

const paragraphSchema = new mongoose.Schema({
  content: {
    type: [String],
    required: true,
  },
  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
    required: true,
  },
  isSpecialCharIncluded: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    enum: ["en", "es", "fr", "de", "it", "pt"],
    default: "en",
  },
});

paragraphSchema.pre("save", function (next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).length;
  }
  next();
});

const Paragraph = mongoose.model("Paragraph", paragraphSchema);

export { Paragraph };
