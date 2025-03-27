// src/controllers/lostIDController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../conn/connection';

export const postLostID = async (req: Request, res: Response) => {
  const { name, admissionNo, status } = req.body;
  const userId = parseInt(req.body.userId, 10);

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Use the file path stored in the uploads folder

  if (isNaN(userId) || !name || !admissionNo) {
    res.status(400).json({ error: 'User ID, name, and admission number are required' });
    return;
  }

  try {
    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create LostID entry
    const lostID = await prisma.lostID.create({
      data: {
        userId,
        name,
        admissionNo,
        image: req.file ? req.file.filename : "/img/idc.png", // Store the filename or null if no file uploaded
        status,
      },
    });

    res.status(201).json({ message: 'LostID created successfully', lostID, imagePath });
  } catch (error) {
    console.error('Error creating LostID:', error);
    res.status(500).json({ error: 'Failed to create LostID' });
  }
};


// Update LostID by ID
export const updateLostID = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, admissionNo, status } = req.body;
    console.log(name, admissionNo, status, "the submitted");
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Image path to store in DB
  
    try {
      // Find the LostID by ID
      const lostID = await prisma.lostID.findUnique({ where: { id: parseInt(id) } });
      if (!lostID) {
        res.status(404).json({ error: 'LostID not found' });
        return;
      }
  
      // Determine new image file name if provided, otherwise use the existing one
      const updatedImage = req.file?.filename || lostID.image;
  
      // Update the LostID fields
      const updatedLostID = await prisma.lostID.update({
        where: { id: parseInt(id) },
        data: {
          name: name || lostID.name, // Only update if the field is provided
          admissionNo: admissionNo || lostID.admissionNo, // Only update if the field is provided
          status: status || lostID.status, // Only update if the field is provided
          image: updatedImage, // Update image with the new filename or keep the old one
        },
      });
  
      res.status(200).json({
        message: 'LostID updated successfully',
        updatedLostID,
        imagePath: `uploads/${updatedImage}`, // Include the new image path in the response
      });
    } catch (error) {
      console.error('Error updating LostID:', error);
      res.status(500).json({ error: 'Failed to update LostID' });
    }
  };

  // Get LostID by ID
  export const getLostID = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      // Find the LostID by ID
      const lostID = await prisma.lostID.findUnique({ where: { id: parseInt(id) } });
      if (!lostID) {
        res.status(404).json({ error: 'LostID not found' });
        return;
      }
  
      // Add the full image path
      const lostIDWithImagePath = {
        ...lostID,
        image: lostID.image ? `uploads/${lostID.image}` : null, // Ensure full path is returned
      };
  
      res.status(200).json({ lostID: lostIDWithImagePath });
    } catch (error) {
      console.error('Error fetching LostID:', error);
      res.status(500).json({ error: 'Failed to fetch LostID' });
    }
  };
  


// Get all LostIDs
export const getAllLostIDs = async (req: Request, res: Response) => {
  try {
    // Fetch all LostID records from the database
    const lostIDs = await prisma.lostID.findMany();
    if (lostIDs.length === 0) {
      res.status(404).json({ error: 'No LostIDs found' });
      return;
    }

    // Map over each LostID and add the full image path
    const lostIDsWithImagePaths = lostIDs.map((lostID) => ({
      ...lostID,
      image: lostID.image ? `uploads/${lostID.image}` : null, // Include image path (full URL)
    }));

    // Return all LostID records with the full image path
    res.status(200).json({ lostIDs: lostIDsWithImagePaths });
  } catch (error) {
    console.error('Error fetching LostIDs:', error);
    res.status(500).json({ error: 'Failed to fetch LostIDs' });
  }
};

  // Delete LostID by ID
export const deleteLostID = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the LostID by ID
    const lostID = await prisma.lostID.findUnique({ where: { id: parseInt(id) } });
    if (!lostID) {
       res.status(404).json({ error: 'LostID not found' });
       return;
    }

    // Delete the LostID
    await prisma.lostID.delete({ where: { id: parseInt(id) } });

    // Return a success message
    res.status(200).json({ message: 'LostID deleted successfully' });
  } catch (error) {
    console.error('Error deleting LostID:', error);
    res.status(500).json({ error: 'Failed to delete LostID' });
  }
};