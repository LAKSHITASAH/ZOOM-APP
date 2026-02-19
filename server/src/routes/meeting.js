import { Router } from "express";
import { nanoid } from "nanoid";
import Meeting from "../models/Meeting.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Host creates meeting (protected)
router.post("/create", authRequired, async (req, res) => {
  const { title } = req.body || {};
  const code = nanoid(10).toUpperCase();

  const meeting = await Meeting.create({
    code,
    title: title || "Meeting",
    hostUserId: req.user.id,
  });

  res.json({ meeting: { code: meeting.code, title: meeting.title } });
});

// ✅ Public: anyone with code can fetch meeting info (Zoom-style)
router.get("/:code", async (req, res) => {
  const meeting = await Meeting.findOne({ code: req.params.code.toUpperCase() });
  if (!meeting) return res.status(404).json({ error: "Meeting not found" });

  res.json({ meeting: { code: meeting.code, title: meeting.title } });
});

export default router;
