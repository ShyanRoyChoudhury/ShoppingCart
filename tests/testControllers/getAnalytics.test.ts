import request from "supertest";
import express from "express";
import { generateCoupon } from "../../src/controllers/admin/generateCoupon";
import { ResponseClass, Status } from "../../src/utils/ResponseClass";
import { Role } from "../../src/dataStore/user";
import { orders } from "../../src/dataStore/orders";

// Mock the verifyAuthMiddleware
jest.mock("../../src/middleware/auth", () => ({
    verifyAuthMiddleware: (req: any, res: any, next: any) => {
        req.user = { userid: 1, name: "Admin User", location: "Test", role: Role.Admin }; // Mock admin user
        next();
    },
}));

// Mock the orders data store
jest.mock("../../src/dataStore/orders", () => ({
    orders: [], // Initially empty
}));

// Mock the generateCouponCode function
jest.mock("../../src/utils/generateCouponCode", () => ({
    generateCouponCode: () => "MOCK_COUPON_123",
}));

// Create an Express app for testing
const app = express();
app.use(express.json());
// app.post("/generate-coupon", generateCoupon);

describe("generateCoupon Function", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    it("should generate a coupon on the nth order for an admin user", async () => {
        // Mock the orders array to have 5 orders (nth order)
        orders.length = 5;
        process.env.NTH_ORDER_DISCOUNT = "5";

        const response = await request(app).post("/api/admin/generateCoupon").send({});

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: { couponCode: "MOCK_COUPON_123" },
            code: "MSG4",
            status: Status.Success,
        });
    });

    it("should fail if the order count is not divisible by NTH_ORDER_DISCOUNT", async () => {
        // Mock the orders array to have 4 orders (not nth order)
        orders.length = 4;
        process.env.NTH_ORDER_DISCOUNT = "5";

        const response = await request(app).post("/api/admin/generateCoupon").send({});

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: {},
            code: "ERR12",
            status: Status.Fail,
        });
    });

    it("should fail for a non-admin user", async () => {
        // Mock a non-admin user
        jest.spyOn(require("../../src/middleware/auth"), "verifyAuthMiddleware").mockImplementation((req: any, res: any, next: any) => {
            req.user = { userid: 2, name: "Regular User", location: "Test", role: Role.User };
            next();
        });

        const response = await request(app).post("/api/admin/generateCoupon").send({});

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: {},
            code: "ERR11",
            status: Status.Fail,
        });
    });

    it("should handle unexpected errors", async () => {
        // Force an error by making orders undefined
        jest.spyOn(require("../../src/dataStore/orders"), "orders", "get").mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const response = await request(app).post("/api/admin/generateCoupon").send({});

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: {},
            code: "ERR1",
            status: Status.Fail,
        });
    });
});