import { Response } from 'express';
import { getAnalytics } from '../../src/controllers/admin/getAnalytics';
import { orders } from '../../src/dataStore/orders';
import { Status } from '../../src/utils/ResponseClass';
import { UserType, Role } from '../../src/dataStore/user';
import { AuthenticatedRequest } from '../../src/middleware/auth';
import { CartType } from '../../src/dataStore/carts';

// Mock response object
const mockResponse = () => {
    const res: Partial<Response> = {};
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

// Mock authenticated request object
const mockAuthRequest = (user: UserType) => {
    return {
        user
    } as AuthenticatedRequest;
};

describe('Analytics API', () => {
    // Mock users with different roles
    const mockAdminUser: UserType = {
        userid: 1,
        name: "Amit Sharma",
        location: "Delhi, India",
        role: Role.Admin
    };

    const mockRegularUser: UserType = {
        userid: 2,
        name: "Raj Patel",
        location: "Mumbai, India",
        role: Role.User
    };

    // Mock cart for orders
    const mockCart: CartType = {
        cartId: 1,
        userId: 1,
        products: [
            {
                product: { id: 1, name: "Product 1", price: 1000, quantity: 5 },
                quantity: 2
            },
            {
                product: { id: 2, name: "Product 2", price: 2000, quantity: 3 },
                quantity: 1
            }
        ],
        cartOrdered: true
    };

    beforeEach(() => {
        // Reset orders before each test
        orders.length = 0;
    });

    test('should return ERR11 when user is not admin', async () => {
        const req = mockAuthRequest(mockRegularUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR11"
            })
        );
    });

    test('should return correct analytics for no orders', async () => {
        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG5",
                data: {
                    totalItemsPurchased: 0,
                    totalPurchaseAmount: 0,
                    discountCodes: [],
                    totalDiscountAmount: 0
                }
            })
        );
    });

    test('should calculate correct analytics for orders without discounts', async () => {
        // Add orders without discounts
        orders.push({
            total: 4000,
            user: mockRegularUser,
            cart: mockCart
        });

        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG5",
                data: {
                    totalItemsPurchased: 3, // 2 + 1 items
                    totalPurchaseAmount: 4000,
                    discountCodes: [],
                    totalDiscountAmount: 0
                }
            })
        );
    });

    test('should calculate correct analytics for orders with discounts', async () => {
        // Add orders with discounts
        orders.push(
            {
                total: 4000,
                discountedAmount: 400,
                couponCode: "TEST10",
                user: mockRegularUser,
                cart: mockCart
            },
            {
                total: 3000,
                discountedAmount: 300,
                couponCode: "SALE10",
                user: mockRegularUser,
                cart: {
                    ...mockCart,
                    products: [{
                        product: { id: 1, name: "Product 1", price: 3000, quantity: 5 },
                        quantity: 1
                    }]
                }
            }
        );

        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG5",
                data: {
                    totalItemsPurchased: 4, // 3 + 1 items
                    totalPurchaseAmount: 6300, // (4000 - 400) + (3000 - 300)
                    discountCodes: ["TEST10", "SALE10"],
                    totalDiscountAmount: 700 // 400 + 300
                }
            })
        );
    });

    test('should handle mixed orders with and without discounts', async () => {
        // Add mixed orders
        orders.push(
            {
                total: 4000,
                discountedAmount: 400,
                couponCode: "TEST10",
                user: mockRegularUser,
                cart: mockCart
            },
            {
                total: 2000,
                user: mockRegularUser,
                cart: {
                    ...mockCart,
                    products: [{
                        product: { id: 1, name: "Product 1", price: 2000, quantity: 5 },
                        quantity: 1
                    }]
                }
            }
        );

        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG5",
                data: {
                    totalItemsPurchased: 4, // 3 + 1 items
                    totalPurchaseAmount: 5600, // (4000 - 400) + 2000
                    discountCodes: ["TEST10"],
                    totalDiscountAmount: 400
                }
            })
        );
    });

    test('should handle orders with zero quantity items', async () => {
        // Add order with some zero quantity items
        orders.push({
            total: 2000,
            user: mockRegularUser,
            cart: {
                ...mockCart,
                products: [
                    {
                        product: { id: 1, name: "Product 1", price: 2000, quantity: 5 },
                        quantity: 0
                    },
                    {
                        product: { id: 2, name: "Product 2", price: 2000, quantity: 3 },
                        quantity: 1
                    }
                ]
            }
        });

        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG5",
                data: {
                    totalItemsPurchased: 1, // Only one item with quantity 1
                    totalPurchaseAmount: 2000,
                    discountCodes: [],
                    totalDiscountAmount: 0
                }
            })
        );
    });

    test('should handle internal server error', async () => {
        const req = mockAuthRequest(mockAdminUser);
        const res = mockResponse();
        
        // Mock orders.forEach to throw error
        jest.spyOn(orders, 'forEach').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        await getAnalytics(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: Status.Fail,
                code: "ERR1"
            })
        );
    });
});