import { Router } from "express"
import { verifyAuthMiddleware } from "../middleware/auth";
import { checkout } from "../controllers/checkout/checkout";
const router = Router();

// @ts-expect-error
router.post('', verifyAuthMiddleware, checkout)


export default router;