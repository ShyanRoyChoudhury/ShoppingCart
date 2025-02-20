import { couponCodes } from "../dataStore/coupons";

export const generateCouponCode = (): string => {
    /**
     * function for generating coupon code and inserts to coupon codes data store
     */
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let coupon = "";
    for (let i = 0; i < 6; i++) {
        coupon += chars[Math.floor(Math.random() * chars.length)];
    }
    couponCodes.push({
        couponCode: coupon,
        expired: false
    })
    return coupon;
};
