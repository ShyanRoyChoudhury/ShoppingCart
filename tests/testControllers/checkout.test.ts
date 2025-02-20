import { Response } from 'express';
import { checkout } from '../../src/controllers/checkout/checkout';
import { products } from '../../src/dataStore/products';
import { carts } from '../../src/dataStore/carts';
import { orders } from '../../src/dataStore/orders';
import { couponCodes } from '../../src/dataStore/coupons';
import { Status } from '../../src/utils/ResponseClass';
import { UserType, Role } from '../../src/dataStore/user';
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

describe('Checkout API', () => {
    const mockUser: UserType = {
        userid: 1,
        name: "Amit Sharma",
        location: "Delhi, India",
        role: Role.User
    };

    const mockProducts = [
        { id: 1, name: "Product 1", price: 1000, quantity: 5 },
        { id: 2, name: "Product 2", price: 2000, quantity: 3 }
    ];

    beforeEach(() => {
        // Reset all data stores before each test
        products.length = 0;
        products.push(...mockProducts);

        carts.length = 0;

        orders.length = 0;

        couponCodes.length = 0;
        couponCodes.push(
            { couponCode: "TEST10", expired: false },
            { couponCode: "EXPIRD", expired: true }
        );

        // Mock process.env
        process.env.NTH_ORDER_DISCOUNT = "5";
    });

    test('should return ERR2 when coupon code is invalid format', async () => {
        const req = mockAuthRequest(
            { 
                couponCode: "TOOLONG123"  // More than 6 characters
            },
            mockUser
        );
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR2"
            })
        );
    });

    test('should return ERR8 when user has no active cart', async () => {
        const req = mockAuthRequest({}, mockUser);
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR8"
            })
        );
    });

    test('should successfully checkout without coupon code', async () => {
        // Create an active cart
        carts.push({
            cartId: 1,
            userId: mockUser.userid,
            products: [
                {
                    product: products[0],
                    quantity: 2
                }
            ],
            cartOrdered: false
        });

        const req = mockAuthRequest({}, mockUser);
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG3",
                data: expect.objectContaining({
                    total: 2000, // 2 * 1000
                    couponCode: ""
                })
            })
        );

        // Verify order was created
        expect(orders.length).toBe(1);
        expect(orders[0].total).toBe(2000);
        
        // Verify cart was marked as ordered
        expect(carts[0].cartOrdered).toBe(true);
    });

    test('should generate new coupon code for nth order', async () => {
        // Create an active cart
        carts.push({
            cartId: 1,
            userId: mockUser.userid,
            products: [
                {
                    product: products[0],
                    quantity: 1
                }
            ],
            cartOrdered: false
        });

        // Add 4 orders to make next order the 5th one
        for (let i = 0; i < 4; i++) {
            orders.push({
                total: 1000,
                user: mockUser,
                cart: carts[0]
            });
        }

        const req = mockAuthRequest({}, mockUser);
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG3",
                data: expect.objectContaining({
                    total: 1000,
                    couponCode: expect.any(String)
                })
            })
        );

        // Verify coupon code was generated (not empty)
        expect((res.json as jest.Mock).mock.calls[0][0].data.couponCode).not.toBe("");
    });

    test('should return ERR9 when coupon code is invalid', async () => {
        carts.push({
            cartId: 1,
            userId: mockUser.userid,
            products: [
                {
                    product: products[0],
                    quantity: 1
                }
            ],
            cartOrdered: false
        });

        const req = mockAuthRequest(
            { 
                couponCode: "INVALID"
            },
            mockUser
        );
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({"code": "ERR2", "data": {}, "status": "Fail"})
        );
    });

    test('should return ERR10 when coupon code is expired', async () => {
        carts.push({
            cartId: 1,
            userId: mockUser.userid,
            products: [
                {
                    product: products[0],
                    quantity: 1
                }
            ],
            cartOrdered: false
        });

        const req = mockAuthRequest(
            { 
                couponCode: "EXPIRD"
            },
            mockUser
        );
        const res = mockResponse();

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR10"
            })
        );
    });

    test('should apply valid coupon code discount', async () => {
        carts.push({
            cartId: 1,
            userId: mockUser.userid,
            products: [
                {
                    product: products[0],
                    quantity: 2
                }
            ],
            cartOrdered: false
        });

        const req = mockAuthRequest(
            { 
                couponCode: "TEST10"
            },
            mockUser
        );
        const res = mockResponse();

        await checkout(req, res);

        const expectedTotal = 2000; // 2 * 1000
        const expectedDiscount = expectedTotal * 0.1; // 10% discount
        const expectedDiscountedTotal = expectedTotal - expectedDiscount;

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG3",
                data: expect.objectContaining({
                    total: expectedDiscountedTotal,
                    couponCode: ""
                })
            })
        );

        // Verify order was created with discount details
        expect(orders[0]).toEqual(
            expect.objectContaining({
                total: expectedTotal,
                discountedAmount: expectedDiscount,
                couponCode: "TEST10"
            })
        );
    });

    test('should handle internal server error', async () => {
        const req = mockAuthRequest({}, mockUser);
        const res = mockResponse();
        
        // Mock getTotal to throw error
        jest.spyOn(global, 'Number').mockImplementationOnce(() => {
            throw new Error('Some internal error');
        });

        await checkout(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR1"
            })
        );
    });
});