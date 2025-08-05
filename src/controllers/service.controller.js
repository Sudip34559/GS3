import Service from '../models/service.model.js';
import { ApiResponse } from '../utils/apiResponce.js';
import fs from 'fs';
import path from 'path';

/**
 * Helper to add the full server URL to a service's image path.
 */
const addImageUrl = (service, req) => {
    if (!service) return null;
    const serverUrl = process.env.BACKEND_URL;
    const obj = typeof service.toObject === 'function' ? service.toObject() : service;

    if (obj.image && typeof obj.image === 'string') {
        const cleanedPath = obj.image.replace(/\\/g, '/');
        obj.image = `${serverUrl}/${cleanedPath}`;
    }
    return obj;
};

// GET all services
export async function getServices(req, res) {
    try {
        const services = await Service.find();
        const servicesWithUrls = services.map(s => addImageUrl(s, req));
        res.status(200).json(new ApiResponse(200, servicesWithUrls, "Services fetched successfully"));
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch services", error: err.message });
    }
}

// POST: Add a new service
export async function addService(req, res) {
    try {
        const { title, description } = req.body;
        const imageFile = req.file;

        if (!title || !description || !imageFile) {
            return res.status(400).json({ message: "Title, description, and image are required" });
        }

        // FIX: Use the full path from Multer (req.file.path).
        const imagePath = imageFile.path.replace(/\\/g, '/');

        const service = await Service.create({
            title,
            description,
            image: imagePath
        });

        const serviceWithUrl = addImageUrl(service, req);
        res.status(201).json(new ApiResponse(201, serviceWithUrl, "Service created successfully"));
    } catch (err) {
        res.status(500).json({ message: "Failed to create service", error: err.message });
    }
}

// PUT: Update an existing service
export async function updateService(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        
        const serviceToUpdate = await Service.findById(id);
        if (!serviceToUpdate) {
            return res.status(404).json({ message: "Service not found" });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        
        if (req.file) {
            // Delete the old image file if it exists
            if (serviceToUpdate.image && fs.existsSync(serviceToUpdate.image)) {
                fs.unlinkSync(serviceToUpdate.image);
            }
            // FIX: Save the new full path.
            updateData.image = req.file.path.replace(/\\/g, '/');
        }

        const updated = await Service.findByIdAndUpdate(id, updateData, { new: true });
        const updatedWithUrl = addImageUrl(updated, req);
        res.status(200).json(new ApiResponse(200, updatedWithUrl, "Service updated successfully"));
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
}

// DELETE: Remove a service
export async function deleteService(req, res) {
    try {
        const { id } = req.params;
        
        // FIX: First, find the document to get the image path.
        const serviceToDelete = await Service.findById(id); 
        if (!serviceToDelete) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Delete the image file from the server if it exists.
        if (serviceToDelete.image && fs.existsSync(serviceToDelete.image)) {
            fs.unlinkSync(serviceToDelete.image);
        }

        // Finally, delete the document from the database.
        await Service.findByIdAndDelete(id);

        res.status(200).json(new ApiResponse(200, {}, "Service deleted successfully"));
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message }); 
    }
}
