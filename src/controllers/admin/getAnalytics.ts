import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { Role } from "../../dataStore/user";
import { ResponseClass, Status } from "../../utils/ResponseClass";
import { orders } from "../../dataStore/orders";

export const getAnalytics = (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (user.role !== Role.Admin) {
            return res.json(new ResponseClass({}, "ERR11", Status.Fail)); // User doesn't have the required role
        }

        // Initialize analytics variables
        let totalItemsPurchased = 0;
        let totalPurchaseAmount = 0;
        let totalDiscountAmount = 0;
        let discountCodes: string[] = [];

        // Iterate over all orders
        orders.forEach(order => {
            totalItemsPurchased += order.cart.products.reduce((sum, p) => sum + p.quantity, 0); // Count total items purchased
            
            const discount = order.discountedAmount || 0; // Ensure discount is handled correctly
            totalDiscountAmount += discount;
            totalPurchaseAmount += order.total - discount; // Subtract discount from total purchase amount

            if (order.couponCode) { 
                discountCodes.push(order.couponCode);
            }
        });

        return res.json(new ResponseClass({
            totalItemsPurchased,
            totalPurchaseAmount,
            discountCodes,
            totalDiscountAmount
        }, "MSG5", Status.Success));

    } catch (err) {
        return res.json(new ResponseClass({}, "ERR1", Status.Fail));
    }
};
