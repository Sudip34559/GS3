import Service from '../models/service.model.js';
import { ApiResponse } from '../utils/apiResponce.js';

// GET all services
export async function getServices(req, res) {
    try {
        const services = await Service.find();
        res.status(200).json(new ApiResponse(200, services, "Services fetched"));
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch services", error: err.message });
    }
}

// POST: Add a new service
export async function addService(req, res) {
    try {
        const { title, description } = req.body;
        const image = req.file?.filename;

        if (!title || !description || !image) {
            return res.status(400).json({ message: "Title, description and image are required" });
        }

        const service = await Service.create({
            title,
            description,
            image: `/service_images/${image}`
        });

        res.status(201).json(new ApiResponse(201, service, "Service created successfully"));
    } catch (err) {
        res.status(500).json({ message: "Failed to create service", error: err.message });
    }
}

export async function updateService(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const image = req.file?.filename

        const updateService = {
            ...(title && { title }),
            ...(description && { description }),
            ...(image && { image: `/service_images/${image}` })
        }

        const updated = await Service.findByIdAndUpdate(id,updateService,{new:true})
        res.status(200).json(new ApiResponse(200, updated, "Service updated"));
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: err.message });

    }
}

export async function deleteService(req,res) {
    try {
       const {id} = req.params;
       const deleted = await Service.findOneAndDelete(id); 
        if (!deleted) return res.status(404).json({ message: "Service not found" });

        res.status(200).json(new ApiResponse(200, deleted, "Service deleted"));
    } catch (error) {
       res.status(500).json({ message: "Delete failed", error: err.message }); 
    }
}