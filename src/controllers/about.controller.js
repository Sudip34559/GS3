import About from '../models/about.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

// GET: Fetch About Info
export async function getAbout(req, res) {
  try {
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About info not found" });

    res.status(200).json(new ApiResponse(200, about, "About data fetched"));
  } catch (err) {
    res.status(500).json({ message: "Error fetching about info", error: err.message });
  }
}

// PUT: Update Stats
export async function updateStats(req, res) {
  try {
    const { stats } = req.body;
    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ message: "Invalid or missing 'stats' array" });
    }

    const about = await About.findOneAndUpdate(
      {},
      { stats },
      { new: true, upsert: true }
    );

    res.status(200).json(new ApiResponse(200, about, "Stats updated"));
  } catch (err) {
    res.status(500).json({ message: "Error updating stats", error: err.message });
  }
}

// POST: Add Timeline Entry
export async function addTimeline(req, res) {
  try {
    const { year, description } = req.body;
    const images = req.files?.map(file => `/timeline_images/${file.filename}`) || [];

    if (!year || !description || images.length === 0) {
      return res.status(400).json({ message: "All fields including images are required" });
    }

    const timelineEntry = { year, description, images };

    const about = await About.findOneAndUpdate(
      {},
      { $push: { timeline: timelineEntry } },
      { new: true, upsert: true }
    );

    res.status(200).json(new ApiResponse(200, about, "Timeline entry added"));
  } catch (err) {
    res.status(500).json({ message: "Error adding timeline", error: err.message });
  }
}
