import { Request, Response } from 'express';
import { Service } from '../models/Service';

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({}).sort({ featured: -1, name: 1 });
    res.status(200).json(services);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get services by category
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category }).sort({ featured: -1, name: 1 });
    res.status(200).json(services);
  } catch (error) {
    console.error('Failed to fetch services by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get featured services
export const getFeaturedServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ featured: true }).sort({ name: 1 });
    res.status(200).json(services);
  } catch (error) {
    console.error('Failed to fetch featured services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add new service (admin only)
export const addService = async (req: Request, res: Response) => {
  try {
    const serviceData = req.body;
    const service = new Service(serviceData);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Failed to add service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update service (admin only)
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    const service = await Service.findByIdAndUpdate(id, serviceData, { new: true });
    res.status(200).json(service);
  } catch (error) {
    console.error('Failed to update service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete service (admin only)
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Failed to delete service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search services
export const searchServices = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query as string, 'i');
    
    const services = await Service.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    }).sort({ featured: -1, name: 1 });
    
    res.status(200).json(services);
  } catch (error) {
    console.error('Failed to search services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
