import { Request, Response } from "express";
import { ResponseClass, Status } from "../../utils/ResponseClass";
import { z } from "zod";
import { products } from "../../dataStore/products";
import { carts } from "../../dataStore/carts";
import { AuthenticatedRequest } from "../../middleware/auth";

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
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

        const product = products.find((p) => p.id === productId);
        if (!product) 
            return res.json(new ResponseClass({}, "ERR4", Status.Fail)); // Returns product not found

        const userSpecificCart = carts.find((c) => c.userId === user.userid && c.cartOrdered === false);

        if (!userSpecificCart) {
            return res.json(new ResponseClass({}, "ERR6", Status.Fail)); // No active cart for user
        }

        const existingProductIndex = userSpecificCart.products.findIndex((p) => p.product.id === productId);
        if (existingProductIndex === -1) {
            return res.json(new ResponseClass({}, "ERR7", Status.Fail)); // Product not found in cart
        }

        const existingProduct = userSpecificCart.products[existingProductIndex];

        if (existingProduct.quantity > 1) {
            existingProduct.quantity -= 1; // Decrease quantity by 1
        } else {
            userSpecificCart.products.splice(existingProductIndex, 1); // Remove product if quantity is 0
        }

        // If the cart becomes empty, remove it completely
        if (userSpecificCart.products.length === 0) {
            const cartIndex = carts.findIndex((c) => c.cartId === userSpecificCart.cartId);
            carts.splice(cartIndex, 1);
        }

        product.quantity += 1; // Increment product stock quantity by 1

        console.log("Updated Products:", products);
        console.log("Updated Carts:", carts);

        // Calculate updated cart total
        const cartTotal = userSpecificCart.products.reduce((total, p) => {
            return total + p.product.price * p.quantity;
        }, 0);

        // Prepare updated cart details excluding product remaining quantity
        const cartDetails = userSpecificCart.products.length > 0 ? {
            cartId: userSpecificCart.cartId,
            userId: userSpecificCart.userId,
            products: userSpecificCart.products.map((p) => ({
                id: p.product.id,
                name: p.product.name,
                price: p.product.price,
                quantity: p.quantity,
            })),
            cartTotal,
        } : null; // If cart is empty, return null

        return res.json(
            new ResponseClass(
                {
                    cart: cartDetails,
                },
                "MSG2",
                Status.Success
            )
        );
    } catch (err) {
        return res.json(new ResponseClass({}, "ERR1", Status.Fail));
    }
};
