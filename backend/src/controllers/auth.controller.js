import cloudinary from "../lib/cloudinary.js";
import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ================= SIGNUP =================
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const randomAvatar = `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.profilePic,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });

  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ================= LOGIN =================
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ================= LOGOUT =================
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true });
}

// ================= ONBOARDING (FINAL FIX 🔥) =================
export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const {
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic,
    } = req.body;

console.log("PROFILE PIC START:", profilePic?.substring(0, 30));
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ GET USER FIRST
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let imageUrl = user.profilePic;

    // ✅ CLOUDINARY UPLOAD
    if (profilePic && profilePic.startsWith("data:image")) {
  const uploadRes = await cloudinary.uploader.upload(profilePic, {
    folder: "profiles",
  });
  imageUrl = uploadRes.secure_url;
}

    // ✅ UPDATE FIELDS
    user.fullName = fullName;
    user.bio = bio;
    user.nativeLanguage = nativeLanguage;
    user.learningLanguage = learningLanguage;
    user.location = location;
    user.profilePic = imageUrl;
    user.isOnboarded = true;

    await user.save();

    // ✅ STREAM UPDATE
    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePic || "",
    });

    console.log(`User onboarded: ${user.fullName}`);

    res.status(200).json({ success: true, user });

  } catch (error) {
  console.error("❌ FULL ERROR:", error);
  res.status(500).json({ message: error.message });
}
}