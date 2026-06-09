import type { Request, Response } from "express";

import {
    getModels,
    getModelById as getModelByIdService,
    getModelBySymbol as getModelsBySymbolService,
    getAllActiveModels as getAllActiveModelsService,
    getAllActiveModelsBySymbol as getAllActiveModelsBySymbolService
} from "../services/models.service.js";


export const getAllModels = async ( req: Request, res: Response ) => {

    const { symbol } = req.query as { symbol?: string };
    const result = await getModels( symbol || "" );
    return res.status(200).json(result);
};

export const getModelsBySymbol = async ( req: Request, res: Response ) => {
    const { symbol } = req.query as { symbol?: string };
    const result = await getModelsBySymbolService( symbol || "" );
    return res.status(200).json(result);
};

export const getAllActiveModelsBySymbol = async ( req: Request, res: Response ) => {
    const { symbol } = req.query as { symbol?: string };
    const result = await getAllActiveModelsBySymbolService( symbol || "" );
    return res.status(200).json(result);
}

export const getAllActiveModels = async ( req: Request, res: Response ) => {

    const result = await getAllActiveModelsService();
    return res.status(200).json(result);
}

export const getModelById = async ( req: Request, res: Response ) => {

    const { id } = req.query as { id?: string };
    const idNum = parseInt(id || "", 10);
    const result = await getModelByIdService( idNum );
    return res.status(200).json(result);
}

