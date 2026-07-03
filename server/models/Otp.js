import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      // The email address or mobile number the OTP was sent to.
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["email", "mobile"],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// TTL index — Mongo automatically deletes expired OTP documents.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
