import request from "supertest";
import { jest } from "@jest/globals";

// Mock sequelize before importing app
jest.unstable_mockModule("../src/config/database.js", () => ({
  default: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    define: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  save: jest.fn(),
  destroy: jest.fn(),
};

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findByPk: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
  },
}));

const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");

describe("Users API", () => {
  let authHeader;

  beforeAll(async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@example.com", password: "password123" });

    authHeader = `Bearer ${res.body.token}`;
  });

  describe("POST /auth/login", () => {
    it("returns a token for valid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.tokenType).toBe("Bearer");
      expect(res.body.token).toBeTruthy();
    });

    it("rejects invalid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@example.com", password: "wrong" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /users", () => {
    it("returns all users when there is no query", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(User.findAll).toHaveBeenLastCalledWith({
        limit: 20,
        offset: 0,
        order: [["id", "ASC"]],
      });
    });

    it("passes pagination query values to Sequelize", async () => {
      User.findAll.mockResolvedValueOnce([]);
      const res = await request(app).get("/users?limit=0&offset=0");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(User.findAll).toHaveBeenLastCalledWith({
        limit: 20,
        offset: 0,
        order: [["id", "ASC"]],
      });
    });
  });

  describe("GET /users/:id", () => {
    it("returns a user by id", async () => {
      const res = await request(app).get("/users/1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Alice");
    });

    it("returns 404 for unknown id", async () => {
      User.findByPk.mockResolvedValueOnce(null);
      const res = await request(app).get("/users/999");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("returns 400 for invalid id", async () => {
      const res = await request(app).get("/users/abc");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid user id");
    });
  });

  describe("POST /users", () => {
    it("creates a user with valid data", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({ name: "Alice", email: "alice@example.com" });
      expect(res.status).toBe(201);
      expect(res.body.email).toBe("alice@example.com");
    });

    it("requires auth", async () => {
      const res = await request(app)
        .post("/users")
        .send({ name: "Alice", email: "alice@example.com" });

      expect(res.status).toBe(401);
    });

    it("returns 400 when name is missing", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({ email: "alice@example.com" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });

    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({ name: "Alice", email: "bad-email" });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /users/:id", () => {
    it("updates a user", async () => {
      mockUser.save.mockResolvedValueOnce(mockUser);
      const res = await request(app)
        .put("/users/1")
        .set("Authorization", authHeader)
        .send({ name: "Alice Updated" });
      expect(res.status).toBe(200);
    });

    it("returns 404 for unknown id", async () => {
      User.findByPk.mockResolvedValueOnce(null);
      const res = await request(app)
        .put("/users/999")
        .set("Authorization", authHeader)
        .send({ name: "X" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /users/:id", () => {
    it("deletes a user", async () => {
      mockUser.destroy.mockResolvedValueOnce();
      const res = await request(app)
        .delete("/users/1")
        .set("Authorization", authHeader);
      expect(res.status).toBe(204);
    });

    it("returns 404 for unknown id", async () => {
      User.findByPk.mockResolvedValueOnce(null);
      const res = await request(app)
        .delete("/users/999")
        .set("Authorization", authHeader);
      expect(res.status).toBe(404);
    });
  });

  describe("404 catch-all", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/unknown");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Route not found");
    });
  });
});
