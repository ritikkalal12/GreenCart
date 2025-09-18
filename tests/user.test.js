import request from "supertest";
import app from "../server.js";   // adjust path if needed
import { connectDB, closeDB, clearDB } from "./setup.js";
import User from "../models/User.js";

beforeAll(async () => await connectDB());
afterAll(async () => await closeDB());
afterEach(async () => await clearDB());

describe("User Authentication", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "Test User", email: "test@example.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should not register duplicate email", async () => {
    await User.create({ name: "A", email: "dup@example.com", password: "hashed" });

    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "B", email: "dup@example.com", password: "password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should login a registered user", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ name: "Test", email: "login@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("should reject invalid login", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "wrong@example.com", password: "badpass" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
