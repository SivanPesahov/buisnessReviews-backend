import { Request, Response } from "express";
import Business from "../models/Business-model";

async function getBusiness(req: Request, res: Response) {
  try {
    const business = await Business.find({});
    res.status(200).json(business);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function getBusinessById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const business = await Business.findById(id);
    if (!business)
      return res.status(404).json({ message: "Business not found" });
    res.status(200).json(business);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { getBusiness, getBusinessById };
