import { Router } from "express";

import {
    getAllModels,
    getModelById,
    getModelsBySymbol,
    getAllActiveModels,
    getAllActiveModelsBySymbol
} from "../controllers/models.controller.js";

import { asyncHandler } from "../handlers/async.handler.js";
import { authenticate } from "../handlers/auth.handler.js";

const router = Router();

router.get( "/", authenticate,
    asyncHandler( getAllModels )
);

router.get( "/id/:id",  authenticate,
    asyncHandler( getModelById )
);

router.get( "/symbol/:symbol", authenticate,
    asyncHandler( getModelsBySymbol )
);

router.get( "/active", authenticate,
    asyncHandler( getAllActiveModels )
);

router.get("/active/:symbol",authenticate,
    asyncHandler( getAllActiveModelsBySymbol )
);

export default router;