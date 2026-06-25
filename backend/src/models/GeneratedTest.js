import mongoose from "mongoose";

const generatedTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Връзка към модела User
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    // Тук записваме структурата на въпросите, дошла от Gemini
    rawQuestions: {
      type: Array,
      required: true,
    },
    pdfUrl: {
      type: String,
      default: null, // Тук ще стои линк, ако решим да ги качваме в облак (S3/Supabase)
    },
  },
  {
    timestamps: true,
  },
);

const GeneratedTest = mongoose.model("GeneratedTest", generatedTestSchema);
export default GeneratedTest;
