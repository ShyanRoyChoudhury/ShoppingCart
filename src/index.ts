import express from 'express';
import './config';
const port = process.env.PORT || 8000;
const app = express();
import cartRouter from './routes/cart.routes'
import checkoutRouter from './routes/checkout.routes';
import adminRouter from './routes/admin.routes';
app.use(express.json());

app.use('/api/cart', cartRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/admin', adminRouter)


app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})