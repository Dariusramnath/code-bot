require("dotenv").config();
const express = require("express");
const router = express.Router();
const { Pins } = require("../models/pinModel"); 
const { WAIT_TIME } = process.env;

router.post("/verify-pin", async (req, res) => {
  try {
    const { pin, playerId } = req.body;
    console.log("Received pin verification request:", { pin, playerId });
    if (!pin || !playerId) {
      return res.status(400).json({ error: "Missing pin or playerId" });
    }

   const entry = await Pins.findOne({ pin, discordUserId: `${playerId}` });

    if (!entry) return res.status(404).json({ error: "Pin not found" });

    const expired = Date.now() - entry.createdAt.getTime() > WAIT_TIME;
    if (expired) return res.status(400).json({ error: "Pin expired" });

    if (entry.isUsed) return res.status(400).json({ error: "Pin already used" });

    entry.isUsed = true;
    entry.usedBy = playerId;
    await entry.save();

    return res.status(200).json({ success: true, reward: "You unlocked 100 XP!" });
  } catch (error) {
    console.error("Error in /api/verify-pin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
