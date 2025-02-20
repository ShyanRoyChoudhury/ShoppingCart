/***  
 * data store for carts. As items are added to cart. It will populate/depolulate
 * */

import { ProductType } from "./products";

type ProductQuantity = {
    product: ProductType;
    quantity: number
}

export type CartType = {
    cartId: number;
    userId: number;
    products: ProductQuantity[];
    cartOrdered: boolean;
}


export const carts: CartType[] = []