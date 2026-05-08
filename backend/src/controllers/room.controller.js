import Room from "../models/Room.js";

export const createRoom = async (req, res) => {
  try {
    const { title } = req.body;

    const room = await Room.create({
      title,
      host: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json(room);
  } catch (error) {
    console.log("Error creating room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("host", "fullName");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error joining room" });
  }
};