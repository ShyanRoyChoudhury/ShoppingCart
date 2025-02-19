import express from 'express';
import './config';
const port = process.env.PORT || 8000;
const app = express();
import cartRouter from './routes/cart.routes'
import { verifyAuthMiddleware } from './middleware/auth';
app.use(express.json());


app.use('/api/cart', verifyAuthMiddleware, cartRouter)


app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})