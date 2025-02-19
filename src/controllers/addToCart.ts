import { Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { z } from 'zod';

export const addToCart = async (req: Request, res: Response) => {
    try{
        const schema = z.object({
            productId: z.string().max(80),
            cartId: z.string().max(80),
        })

        const parsedInput = schema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.json(new ResponseClass({}, "ERR2", Status.Fail));
        }

        const { productId, cartId } = parsedInput.data;


        const userId = req?.headers?.userId;

        






        return res.json(new ResponseClass({}, "ERR1", Status.Success))
    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}