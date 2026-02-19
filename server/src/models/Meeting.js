import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Meeting" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Meeting", MeetingSchema);

