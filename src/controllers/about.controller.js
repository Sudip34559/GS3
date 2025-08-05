import About from '../models/about.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/**
 * Helper to add full server URLs to all images within the timeline array.
 */
const addImageUrlsToTimeline = (aboutDoc, req) => {
  if (!aboutDoc) return null;
  // Use the correct environment variable for the backend's public URL.
  const serverUrl = process.env.BACKEND_URL;
  const obj = aboutDoc.toObject();

  if (obj.timeline && Array.isArray(obj.timeline)) {
    obj.timeline = obj.timeline.map(entry => {
      if (entry.images && Array.isArray(entry.images)) {
        entry.images = entry.images.map(imagePath => {
          if (imagePath && typeof imagePath === 'string') {
            // The path from the DB will now be correct, so we just clean the slashes.
            const cleanedPath = imagePath.replace(/\\/g, '/');
            return `${serverUrl}/${cleanedPath}`;
          }
          return imagePath;
        });
      }
      return entry;
    });
  }
  return obj;
};

// GET: Fetch About Info
export async function getAbout(req, res) {
  try {
    const aboutDoc = await About.findOne();
    if (!aboutDoc) return res.status(404).json({ message: "About info not found" });

    const aboutWithImageUrls = addImageUrlsToTimeline(aboutDoc, req);
    res.status(200).json(new ApiResponse(200, aboutWithImageUrls, "About data fetched"));
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
    const about = await About.findOneAndUpdate({}, { stats }, { new: true, upsert: true });
    res.status(200).json(new ApiResponse(200, about, "Stats updated"));
  } catch (err) {
    res.status(500).json({ message: "Error updating stats", error: err.message });
  }
}

// POST: Add Timeline Entry
export async function addTimeline(req, res) {
  try {
    const { year, title, description } = req.body;
    
    // FIX: Use the full path from Multer (req.files)
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    if (!year || !title || !description || images.length === 0) {
      return res.status(400).json({ message: "Year, title, description and images are required" });
    }

    const timelineEntry = { year, title, description, images };
    const about = await About.findOneAndUpdate({}, { $push: { timeline: timelineEntry } }, { new: true, upsert: true });
    res.status(200).json(new ApiResponse(200, about, "Timeline entry added"));
  } catch (err) {
    res.status(500).json({ message: "Error adding timeline", error: err.message });
  }
}

// PUT: Update a single timeline entry
export async function updateTimeline(req, res) {
  try {
    const { id } = req.params;
    const { year, title, description } = req.body;

    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About document not found" });

    const timelineEntry = about.timeline.id(id);
    if (!timelineEntry) return res.status(404).json({ message: "Timeline entry not found" });

    timelineEntry.year = year || timelineEntry.year;
    timelineEntry.title = title || timelineEntry.title;
    timelineEntry.description = description || timelineEntry.description;

    // Handle new image uploads if they exist
    if (req.files && req.files.length > 0) {
      // Delete old images from the server
      if (timelineEntry.images && Array.isArray(timelineEntry.images)) {
        timelineEntry.images.forEach(imagePath => {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
      // FIX: Save the new full paths from Multer
      timelineEntry.images = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    await about.save();
    res.status(200).json(new ApiResponse(200, timelineEntry, "Timeline entry updated"));
  } catch (error) {
    res.status(500).json({ message: "Error updating timeline", error: error.message });
  }
}

// DELETE: Remove a timeline entry
export const deleteTimeline = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const about = await About.findOne();
    if (!about) {
      return res.status(404).json({ message: "About document not found" });
    }

    const entryToDelete = about.timeline.id(id);
    if (!entryToDelete) {
      return res.status(404).json({ message: "Timeline entry not found" });
    }

    // FIX: Use the full path from the DB to delete files
    if (entryToDelete.images && Array.isArray(entryToDelete.images)) {
      entryToDelete.images.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    about.timeline.pull({ _id: id });
    await about.save();

    return res.status(200).json({ message: "Timeline entry deleted" });
  } catch (error) {
    console.error("Delete timeline error:", error);
    return res.status(500).json({ message: "Server error while deleting timeline" });
  }
};