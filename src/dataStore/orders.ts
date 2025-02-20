import { CartType } from "./carts";
import { UserType } from "./user";

type OrdersType = {
    total: number;
    user: UserType;
    cart: CartType;
}

export const orders: OrdersType[] = []