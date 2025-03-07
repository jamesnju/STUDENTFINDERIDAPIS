
import { Request, Response } from 'express';
import { prisma } from '../conn/connection';
export const getAllReportedFoundIDs = async (req: Request, res: Response) => {
  try {
    // Fetch all FoundID records from the database
    const foundIDs = await prisma.foundID.findMany();
    if (foundIDs.length === 0) {
      res.status(404).json({ error: 'No FoundIDs found' });
      return;
    }

    // Map over each FoundID and add the full image path
    const foundIDsWithImagePaths = foundIDs.map((foundID) => ({
      ...foundID,
      image: foundID.image ? `uploads/${foundID.image}` : null, // Include image path (full URL)
    }));

    // Return all FoundID records with the full image path
    res.status(200).json({ foundIDs: foundIDsWithImagePaths });
  } catch (error) {
    console.error('Error fetching FoundIDs:', error);
    res.status(500).json({ error: 'Failed to fetch FoundIDs' });
  }
};

  // Delete FoundID by ID
  export const deleteReportedFoundIDs = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      // Find the FoundID by ID
      const foundID = await prisma.foundID.findUnique({ where: { id: parseInt(id) } });
      if (!foundID) {
         res.status(404).json({ error: 'FoundID not found' });
         return;
      }
  
      // Delete the FoundID
      await prisma.foundID.delete({ where: { id: parseInt(id) } });
  
      // Return a success message
      res.status(200).json({ message: 'FoundID deleted successfully' });
    } catch (error) {
      console.error('Error deleting FoundID:', error);
      res.status(500).json({ error: 'Failed to delete FoundID' });
    }
  };