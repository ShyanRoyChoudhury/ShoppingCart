import { Response } from 'express';
import { removeFromCart } from '../../src/controllers/cart/removeFromCart';
import { products } from '../../src/dataStore/products';
import { carts } from '../../src/dataStore/carts';
import { Status } from '../../src/utils/ResponseClass';
import { users, UserType, Role } from '../../src/dataStore/user';
import { AuthenticatedRequest } from '../../src/middleware/auth';

// Mock response object
const mockResponse = () => {
    const res: Partial<Response> = {};
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

// Mock authenticated request object
const mockAuthRequest = (body = {}, user: UserType | null = null) => {
    return {
        body,
        user
    } as AuthenticatedRequest;
};

describe('removeFromCart API with Authentication', () => {
    beforeEach(() => {
        // Reset all data stores to initial state before each test
        products.length = 0;
        products.push(
            { id: 1, name: "Wireless Mouse", price: 2000, quantity: 7 },
            { id: 2, name: "Mechanical Keyboard", price: 3000, quantity: 3 }
        );

        carts.length = 0;

        users.length = 0;
        users.push(
            { userid: 1, name: "Amit Sharma", location: "Delhi, India", role: Role.Admin },
            { userid: 2, name: "Sophia Williams", location: "New York, USA", role: Role.User },
            { userid: 3, name: "Raj Patel", location: "Mumbai, India", role: Role.User },
            { userid: 4, name: "Emily Johnson", location: "London, UK", role: Role.Admin }
        );
    });

    test('should validate authenticated user exists', async () => {
        const req = mockAuthRequest(
            { 
                productId: 1,
                userId: 999 // Non-existent user
            }
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({"code": "ERR6", "data": {}, "status": "Fail"})
        );
    });

    test('should work for both Admin and User roles', async () => {
        // Test with Admin user
        const adminUser = users[0]; // Amit Sharma
        carts.push({
            cartId: 1,
            userId: adminUser.userid,
            products: [{
                product: products[0],
                quantity: 1
            }],
            cartOrdered: false
        });

        const adminReq = mockAuthRequest(
            { 
                productId: 1,
                userId: adminUser.userid
            },
            adminUser
        );
        const adminRes = mockResponse();

        await removeFromCart(adminReq, adminRes);

        expect(adminRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG2"
            })
        );

        // Reset carts and test with regular User
        carts.length = 0;
        const regularUser = users[1]; // Sophia Williams
        carts.push({
            cartId: 2,
            userId: regularUser.userid,
            products: [{
                product: products[0],
                quantity: 1
            }],
            cartOrdered: false
        });

        const userReq = mockAuthRequest(
            { 
                productId: 1,
                userId: regularUser.userid
            },
            regularUser
        );
        const userRes = mockResponse();

        await removeFromCart(userReq, userRes);

        expect(userRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG2"
            })
        );
    });

    test('should return ERR2 when product ID is invalid', async () => {
        const req = mockAuthRequest(
            { 
                productId: "invalid",
                userId: users[0].userid
            },
            users[0]
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR2"
            })
        );
    });

    test('should return ERR4 when product does not exist', async () => {
        const req = mockAuthRequest(
            { 
                productId: 999,
                userId: users[0].userid
            },
            users[0]
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR4"
            })
        );
    });

    test('should return ERR6 when user has no active cart', async () => {
        const req = mockAuthRequest(
            { 
                productId: 1,
                userId: users[0].userid
            },
            users[0]
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR6"
            })
        );
    });

    test('should remove product from cart when quantity = 1', async () => {
        const user = users[0];
        // Create an active cart with product quantity = 1
        carts.push({
            cartId: 1,
            userId: user.userid,
            products: [{
                product: products[0],
                quantity: 1
            }],
            cartOrdered: false
        });

        const initialProductQuantity = products[0].quantity;
        const req = mockAuthRequest(
            { 
                productId: 1,
                userId: user.userid
            },
            user
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG2",
                data: expect.objectContaining({
                    cart: null
                })
            })
        );

        // Check if product quantity was increased in stock
        expect(products[0].quantity).toBe(initialProductQuantity + 1);
        // Check if cart was removed since it became empty
        expect(carts.length).toBe(0);
    });

    test('should correctly calculate cart total after removing item', async () => {
        const user = users[0];
        // Create an active cart with multiple products
        carts.push({
            cartId: 1,
            userId: user.userid,
            products: [
                {
                    product: products[0], // Wireless Mouse: 2000
                    quantity: 2
                },
                {
                    product: products[1], // Mechanical Keyboard: 3000
                    quantity: 1
                }
            ],
            cartOrdered: false
        });

        const req = mockAuthRequest(
            { 
                productId: 1,
                userId: user.userid
            },
            user
        );
        const res = mockResponse();

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG2",
                data: expect.objectContaining({
                    cart: expect.objectContaining({
                        cartTotal: 5000 // (1 * 2000) + (1 * 3000)
                    })
                })
            })
        );
    });

    test('should handle internal server error', async () => {
        const req = mockAuthRequest(
            { 
                productId: 1,
                userId: users[0].userid
            },
            users[0]
        );
        const res = mockResponse();
        
        // Mock products.find to throw error
        jest.spyOn(products, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        await removeFromCart(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR1"
            })
        );
    });
});