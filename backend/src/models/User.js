import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Имейлът е задължителен"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Паролата е задължителна"],
    },
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
    credits: {
      type: Number,
      default: 3, // Всеки нов учител започва с 3 безплатни кредита за тест
    },
    subscription: {
      status: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Автоматично създава полета createdAt и updatedAt
  },
);

const User = mongoose.model("User", userSchema);
export default User;
