import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    totpSecretEncrypted: {
      type: String,
      select: false,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);