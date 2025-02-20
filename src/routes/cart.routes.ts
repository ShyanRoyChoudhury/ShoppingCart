import { Router } from "express"
import { addToCart } from "../controllers/addToCart";
import { verifyAuthMiddleware } from "../middleware/auth";
import { removeFromCart } from "../controllers/removeFromCart";
const router = Router();

// @ts-expect-error
router.post('/AddToCart', verifyAuthMiddleware, addToCart)
// @ts-expect-error
router.post('/RemoveFromCart', verifyAuthMiddleware, removeFromCart)


export default router;