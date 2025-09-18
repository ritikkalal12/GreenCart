import request from "supertest";
import app from "../server.js";
import { connectDB, closeDB, clearDB } from "./setup.js";
import Product from "../models/Product.js";

beforeAll(async () => await connectDB());
afterAll(async () => await closeDB());
afterEach(async () => await clearDB());

describe("Product Management", () => {
  it("should add a product without images", async () => {
    const productData = { name: "Sample Product", price: 100 };

    const res = await request(app)
      .post("/api/products/add")
      .field("productData", JSON.stringify(productData));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe("Sample Product");
  });

  it("should reject product with missing fields", async () => {
    const productData = { price: 50 };

    const res = await request(app)
      .post("/api/products/add")
      .field("productData", JSON.stringify(productData));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
