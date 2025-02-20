import { Router } from "express"
import { verifyAuthMiddleware } from "../middleware/auth";
import { generateCoupon } from "../controllers/admin/generateCoupon";
import { getAnalytics } from "../controllers/admin/getAnalytics";
const router = Router();

// @ts-expect-error
router.post('/generateCoupon', verifyAuthMiddleware, generateCoupon)
// @ts-expect-error
router.post('/analytics', verifyAuthMiddleware, getAnalytics)


export default router;