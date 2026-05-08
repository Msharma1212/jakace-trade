import express from "express";
import { createRoom, getRooms, joinRoom } from "../controllers/room.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createRoom);
router.get("/", protectRoute, getRooms);
router.post("/:id/join", protectRoute, joinRoom);

export default router;