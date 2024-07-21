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

export default getBusiness;
