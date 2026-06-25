import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // напр. "Южна Америка"
  },
  topics: [
    {
      type: String,
      required: true, // напр. ["Климат и води", "Релеф и полезни изкопаеми"]
    },
  ],
});

const testTemplateSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true, // напр. "География и икономика"
    },
    grade: {
      type: Number,
      required: true, // напр. 6
    },
    chapters: [chapterSchema],
  },
  {
    timestamps: true,
  },
);

// Индекс за бързо търсене по предмет и клас едновременно
testTemplateSchema.index({ subject: 1, grade: 1 }, { unique: true });

const TestTemplate = mongoose.model("TestTemplate", testTemplateSchema);
export default TestTemplate;
