import { Response } from "express";
import { ResponseClass, Status } from "../../utils/ResponseClass";
import { z } from 'zod';
import { products } from "../../dataStore/products";
import { carts } from "../../dataStore/carts";
import { AuthenticatedRequest } from "../../middleware/auth";
import { couponCodes } from "../../dataStore/coupons";
import { orders } from "../../dataStore/orders";
import { generateCouponCode } from "../../utils/generateCouponCode";

const getTotal = (userId: number) => {
    const cart = carts.find(c => c.userId === userId && c.cartOrdered === false)
    if(!cart) 
        return null
    else{
        return {
            total: cart.products.reduce((total, p) => total + (p.product.price * p.product.quantity), 0),
            cart
        };
    }
}


export const checkout = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const schema = z.object({
            couponCode: z.string().max(6),
        })

        const parsedInput = schema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.json(new ResponseClass({}, "ERR2", Status.Fail));
        }

        const { couponCode } = parsedInput.data;
        const user = req.user;
        let returnedData;
        const currentOrderCount = orders.length;
        const generatorCount = Number(process.env.NTH_ORDER_DISCOUNT) || 5;
        
        let generatedCouponCode = null;


        if(!couponCode){    
            returnedData = getTotal(user.userid)
            if(returnedData === null) return res.json(new ResponseClass({}, "ERR8", Status.Fail));    // returns no cart found for that user
            const {total, cart} = returnedData;
            
            orders.push({               // update orders data store
                total,
                user,
                cart
            })
            if(currentOrderCount%generatorCount !== 0) generatedCouponCode = generateCouponCode();  // checks if it is nth order then generates a new coupon code for use

            return res.json(new ResponseClass({
                total,
                couponCode: generatedCouponCode? generatedCouponCode: ''
            }, "MSG3", Status.Success));                // order placed
        }else{
            const code = couponCode && couponCodes.find(c => c.couponCode === couponCode) // check if coupon is valid
            if(!code){
                return res.json(new ResponseClass({}, "ERR9", Status.Fail));
            }
            else if(code.expired === true){  // check if coupon is expired
                return res.json(new ResponseClass({}, "ERR10", Status.Fail));
            }else{            
                returnedData = getTotal(user.userid)
                if(returnedData === null) return res.json(new ResponseClass({}, "ERR8", Status.Fail));    // returns no cart found for that user
                const {total, cart} = returnedData;
                const discountedAmount = (10/100 * total);
                const discountedTotal = total - discountedAmount

                orders.push({           // update orders data store
                    total,
                    user,
                    cart,
                    discountedAmount,
                    couponCode
                })
                
                if(currentOrderCount%generatorCount !== 0) generatedCouponCode = generateCouponCode();  // checks if it is nth order then generates a new coupon code for use
                return res.json(new ResponseClass({
                    total: discountedTotal,
                    couponCode: generatedCouponCode? generatedCouponCode: ''
                }, "MSG3", Status.Success));       // order placed
            }
        }
    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}