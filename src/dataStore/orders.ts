import { CartType } from "./carts";
import { UserType } from "./user";

type OrdersType = {
    total: number;
    user: UserType;
    cart: CartType;
    discountedAmount?: number;
    couponCode?: string;
}

export const orders: OrdersType[] = []