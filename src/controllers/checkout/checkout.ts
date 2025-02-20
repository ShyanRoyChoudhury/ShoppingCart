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
    console.log('carts', carts);
    
    const cart = carts.find(c => c.userId === userId && c.cartOrdered === false);
    if (!cart) return null;

    let total = 0;

    for (const cartItem of cart.products) {
        const product = products.find(p => p.id === cartItem.product.id); // product exists check
        if (!product) continue;

        total += product.price * cartItem.quantity; // Calculate total correctly
    }

    return { total, cart };
};


export const checkout = async (req: AuthenticatedRequest, res: Response) => {
    try{
        const schema = z.object({
            couponCode: z.string().max(6).optional(),
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
            console.log('returnedData', returnedData?.total)
            if(returnedData === null) return res.json(new ResponseClass({}, "ERR8", Status.Fail));    // returns no cart found for that user
            const {total, cart} = returnedData;
            
            orders.push({               // update orders data store
                total,
                user,
                cart
            })

            cart.cartOrdered = true;
            if ((currentOrderCount + 1) % generatorCount === 0)
                generatedCouponCode = generateCouponCode();  // checks if it is nth order then generates a new coupon code for use

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
                console.log('total', total);
                const discountedAmount = (10/100 * total);
                console.log('discountedAmount', discountedAmount)
                const discountedTotal = total - discountedAmount
                console.log('discountedTotal', discountedTotal)
                orders.push({           // update orders data store
                    total,
                    user,
                    cart,
                    discountedAmount,
                    couponCode
                })

                cart.cartOrdered = true;
                
                if ((currentOrderCount + 1) % generatorCount === 0)
                    generatedCouponCode = generateCouponCode();  // checks if it is nth order then generates a new coupon code for use
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