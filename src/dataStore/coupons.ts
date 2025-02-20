/***  
 * data store for coupons. once the coupons are used they are marked as expired: true
 * */


type couponType = {
    couponCode: string;
    expired: boolean;
}


export const couponCodes: couponType[] = []