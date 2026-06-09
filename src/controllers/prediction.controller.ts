import type { Request, Response } from "express";
import {predict as predictService, predictHour as predictHourService } from "../services/prediction.service.js" ;

export const predict = async ( req: Request, res: Response ) => {

    const { symbol } = req.body;

    const result = await predictService(symbol);

    return res.status(200).json(result);
};

export const predictHour = async ( req: Request, res: Response ) => {

    const { symbol, hour } = req.body;
    const result = await predictHourService(symbol, hour);

    return res.status(200).json(result);
}