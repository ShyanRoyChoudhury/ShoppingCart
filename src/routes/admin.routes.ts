import { Router } from "express"
import { verifyAuthMiddleware } from "../middleware/auth";
import { generateCoupon } from "../controllers/admin/generateCoupon";
const router = Router();

// @ts-expect-error
router.post('/generateCoupon', verifyAuthMiddleware, generateCoupon)


export default router;