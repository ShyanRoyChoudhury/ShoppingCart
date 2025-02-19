import { Router } from "express"
import { addToCart } from "../controllers/addToCart";
const router = Router();

router.post('/AddToCart', addToCart)

export default router;