import { Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { z } from "zod";
import { products } from "../dataStore/products";
import { carts } from "../dataStore/carts";
import { AuthenticatedRequest } from "../middleware/auth";

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const schema = z.object({
            productId: z.number(), // usually a UUID but number here for easier context understanding
        });

        const parsedInput = schema.safeParse(req.body);
        if (!parsedInput.success) {
            return res.json(new ResponseClass({}, "ERR2", Status.Fail));
        }

        const { productId } = parsedInput.data;
        const user = req.user;

        console.log("userId in API", user);

        const product = products.find((p) => p.id === productId);
        if (!product) 
            return res.json(new ResponseClass({}, "ERR4", Status.Fail)); // Returns product not found
        if (product?.quantity <= 0) 
            return res.json(new ResponseClass({}, "ERR5", Status.Fail)); // Returns product out of stock

        let userSpecificCart = carts.find((c) => c.userId === user.userid && c.cartOrdered === false);

        if (!userSpecificCart) {
            userSpecificCart = {
                userId: user.userid,
                cartId: carts.length + 1,
                products: [
                    {
                        product,
                        quantity: 1,
                    },
                ],
                cartOrdered: false,
            };
            carts.push(userSpecificCart);
        } else {
            const existingProduct = userSpecificCart.products.find((p) => p.product.id === productId);
            if (existingProduct) {
                existingProduct.quantity += 1; // Increment quantity if product exists
            } else {
                userSpecificCart.products.push({
                    product,
                    quantity: 1,
                });
            }
        }

        product.quantity -= 1; // Decrement product stock quantity by 1

        // Calculate cart total
        const cartTotal = userSpecificCart.products.reduce((total, p) => {
            return total + p.product.price * p.quantity;
        }, 0);

        console.log("Updated Products:", products);
        console.log("Updated Carts:", carts);

        // Prepare cart details excluding product remaining quantity
        const cartDetails = {
            cartId: userSpecificCart.cartId,
            userId: userSpecificCart.userId,
            products: userSpecificCart.products.map((p) => ({
                id: p.product.id,
                name: p.product.name,
                price: p.product.price,
                quantity: p.quantity,
            })),
            cartTotal,
        };

        return res.json(
            new ResponseClass(
                {
                    cart: cartDetails,
                },
                "MSG1",
                Status.Success
            )
        );
    } catch (err) {
        return res.json(new ResponseClass({}, "ERR1", Status.Fail));
    }
};
