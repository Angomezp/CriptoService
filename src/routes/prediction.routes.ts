import { Router } from "express";

import { predict as predictController, predictHour as  predictHourController } from "../controllers/prediction.controller.js";

import { asyncHandler } from "../handlers/async.handler.js";
import { authenticate } from "../handlers/auth.handler.js";

const router = Router();


router.post( "/", authenticate,
    predictController
);

router.post("/hour", authenticate,
    asyncHandler( predictHourController )
);

export default router;