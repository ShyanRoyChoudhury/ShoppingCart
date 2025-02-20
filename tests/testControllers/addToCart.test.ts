import request from "supertest";
import app from "../../src/index";
import { carts } from "../../src/dataStore/carts";
import { products } from "../../src/dataStore/products";
import { ResponseClass, Status } from "../../src/utils/ResponseClass";
import  { users } from "../../src/dataStore/user";

jest.mock("../../src/dataStore/carts", () => ({ carts: [] }));
jest.mock("../../src/dataStore/products", () => ({
    products: [
        { id: 1, name: "Product 1", price: 100, quantity: 10 },
        { id: 2, name: "Product 2", price: 200, quantity: 0 },
    ],
}));
jest.mock("../../src/dataStore/user", () => ({
    users: [
        { userid: 1, name: "Test User" },
    ],
}));

describe("POST /cart/addToCart", () => {
    let authToken;

    beforeEach(() => {
        carts.length = 0; // Clear carts before each test
        authToken = "mocked-auth-token"; // Simulate authentication
    });

    it("should return error if userId is missing", async () => {
        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ productId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(new ResponseClass({}, "ERR3", Status.Fail));
    });

    it("should return error if user does not exist", async () => {
        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 999, productId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(new ResponseClass({}, "ERR3", Status.Fail));
    });

    it("should add a product to the cart successfully", async () => {
        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 1, productId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                status: Status.Success,
                code: "MSG1",
                data: expect.objectContaining({
                    cart: expect.objectContaining({
                        cartId: expect.any(Number),
                        userId: expect.any(Number),
                        products: expect.any(Array),
                        cartTotal: expect.any(Number),
                    }),
                }),
            })
        );
        expect(carts.length).toBe(1);
    });

    it("should return error if product does not exist", async () => {
        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 1, productId: 999 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(new ResponseClass({}, "ERR4", Status.Fail));
    });

    it("should return error if product is out of stock", async () => {
        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 1, productId: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(new ResponseClass({}, "ERR5", Status.Fail));
    });

    it("should increment quantity if product is already in cart", async () => {
        await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 1, productId: 1 });

        const res = await request(app)
            .post("/api/cart/addToCart")
            .send({ userId: 1, productId: 1 });

        expect(res.statusCode).toBe(200);
        // @ts-ignore
        expect(res.body.data.cart.products.find(p => p.id === 1).quantity).toBe(2);
    });
});