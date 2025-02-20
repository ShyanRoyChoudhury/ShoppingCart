import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { Role } from "../../dataStore/user";
import { ResponseClass, Status } from "../../utils/ResponseClass";
import { orders } from "../../dataStore/orders";
import { generateCouponCode } from "../../utils/generateCouponCode";

export const generateCoupon = (req: AuthenticatedRequest, res: Response) => {
    /**
     * function for generating code on every nth order
     * api only accessible to users with admin role
     */
    try{
        const user = req.user;
        // if(user.role !== Role.Admin){
        //     return res.json(new ResponseClass({},"ERR11",Status.Fail)) //returns the user doesnot have the role to do this operation
        // }

        
        const currentOrderCount = orders?.length;     
        const generatorCount = Number(process.env.NTH_ORDER_DISCOUNT) || 5;

        if(currentOrderCount%generatorCount !== 0) return res.json(new ResponseClass({}, "ERR12", Status.Fail)); // Not an nth order

        const coupon = generateCouponCode();
        return res.json(new ResponseClass({
            couponCode: coupon,
        }, "MSG4", Status.Success))

    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}