import { Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { z } from 'zod';
import { products } from "../dataStore/products";
import { carts } from "../dataStore/carts";
import { AuthenticatedRequest } from "../middleware/auth";

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const schema = z.object({
            productId: z.number(),  // usually a uuid but number here for easier context understanding
        })

        const parsedInput = schema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.json(new ResponseClass({}, "ERR2", Status.Fail));
        }

        const { productId } = parsedInput.data;


        const user = req.user;


        const product = products.find(p => p.id === productId)
        if(!product) 
            return res.json(new ResponseClass({}, "ERR4", Status.Fail));    // returns product not found

        const userSpecificCart = carts.find(c=> c.userId === user.userid)

        if(!userSpecificCart){
            return res.json(new ResponseClass({}, "ERR6", Status.Fail))
        }else{
            const existingProduct = userSpecificCart.products.find(p => p.product.id === productId);
            if (existingProduct) {                      // Decrement quantity if product exists in users cart
                existingProduct.quantity -= 1;
            } else {                                    // return if product is not found in users cart
                return res.json(new ResponseClass({}, "ERR7", Status.Fail))
            }
        }

        product.quantity += 1;  // increment product quantity by 1
        console.log("products", products)
        console.log("carts", carts)
    return res.json(new ResponseClass({}, "MSG2", Status.Success))
    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}