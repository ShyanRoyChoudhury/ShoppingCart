import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { Role } from "../../dataStore/user";
import { ResponseClass, Status } from "../../utils/ResponseClass";
import { orders } from "../../dataStore/orders";

export const getAnalytics = (req: AuthenticatedRequest, res: Response) => {
    /**
     * function for generating code on every nth order
     * api only accessible to users with admin role
     */
    try{
        const user = req.user;
        if(user.role !== Role.Admin){
            return res.json(new ResponseClass({},"ERR11",Status.Fail)) //returns the user doesnot have the role to do this operation
        }

        // Initialize analytics variables
        let totalItemsPurchased = 0;
        let totalPurchaseAmount = 0;
        let totalDiscountAmount = 0;
        let discountCodes: string[] = [];

        // Iterate over all orders
        orders.forEach(order => {
            totalItemsPurchased += order.cart.products.reduce((sum, p) => sum + p.quantity, 0);     // Count total items purchased
            totalPurchaseAmount += order.total;             // sum of total puchase amount

            
            if (order.discountedAmount && order.couponCode) {                       // Sum total discount amount (if applied) & collect theor codes
                totalDiscountAmount += order.discountedAmount;
                discountCodes.push(order.couponCode);
            }
        });

        return res.json(new ResponseClass({
            totalItemsPurchased,
            totalPurchaseAmount,
            discountCodes,
            totalDiscountAmount
        }, "MSG5", Status.Success));

    }catch(err){
        return res.json(new ResponseClass({}, "ERR1", Status.Fail))
    }
}