import express from 'express';
import './config';
const port = process.env.PORT || 8000;
const app = express();
import cartRouter from './routes/cart.routes'
import checkoutRouter from './routes/checkout.routes';
import adminRouter from './routes/admin.routes';
import { rateLimit } from 'express-rate-limit'
app.use(express.json());

// adding rate limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})


app.use(limiter)


app.use('/api/cart', cartRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/admin', adminRouter)

export default app;