import { Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { z } from 'zod';
import { products } from "../dataStore/products";
import { carts } from "../dataStore/carts";
import { AuthenticatedRequest } from "../middleware/auth";

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const schema = z.object({
            productId: z.number(),  // usually a uuid but number here for easier context understanding
            cartId: z.number().optional(), // usually a uuid but number here for easier context understanding
        })

        const parsedInput = schema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.json(new ResponseClass({}, "ERR2", Status.Fail));
        }

        const { productId, cartId } = parsedInput.data;


        const user = req.user;


        console.log('userId in api', user)

        const product = products.find(p => p.id === productId)
        if(!product) 
            return res.json(new ResponseClass({}, "ERR4", Status.Fail));    // returns product not found
        if(product?.quantity>0 === false)
            return res.json(new ResponseClass({}, "ERR5", Status.Fail)) // returns product out of stock

        const userSpecificCart = carts.find(c=> c.userId === user.userid)

        if(!userSpecificCart){
            carts.push({
                userId: user.userid, 
                cartId: carts.length + 1,
                products: [{
                    product,
                    quantity: 1
                }],
                cartOrdered: false
             })
        }else{
            const existingProduct = userSpecificCart.products.find(p => p.product.id === productId);
            if (existingProduct) {                      // Increment quantity if product exists
                existingProduct.quantity += 1;
            } else {                                    // Add new product to existing cart
                userSpecificCart.products.push({
                    product,
                    quantity: 1
                });
            }
        }
        console.log("products", products)
        product.quantity -= 1;  // decrement product quantity by 1
        console.log("products", products)
        console.log("carts", carts)
    return res.json(new ResponseClass({}, "MSG1", Status.Success))
    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}