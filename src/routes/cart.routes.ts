import { Router } from "express"
import { addToCart } from "../controllers/cart/addToCart";
import { verifyAuthMiddleware } from "../middleware/auth";
import { removeFromCart } from "../controllers/cart/removeFromCart";
const router = Router();

// @ts-expect-error
router.post('/AddToCart', verifyAuthMiddleware, addToCart)
// @ts-expect-error
router.post('/RemoveFromCart', verifyAuthMiddleware, removeFromCart)


export default router;