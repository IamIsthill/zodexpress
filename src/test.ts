import { getMockReq, getMockRes } from "@jest-mock/express";
import { z } from "zod";
import validateRequest from ".";

describe("validateRequest middleware", () => {
  const bodySchema = z.object({
    name: z.string(),
    age: z.number().int().positive(),
  });

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const querySchema = z.object({
    search: z.string().optional(),
  });
  const { res, next, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("should pass validation and call next()", async () => {
    const req = getMockReq({
      body: { name: "Alice", age: 30 },
      params: { id: "123e4567-e89b-12d3-a456-426614174000" },
      query: { search: "test" },
    });

    const middleware = validateRequest({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // no error
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 422 for invalid body", async () => {
    const req = getMockReq({
      body: { name: "Alice", age: "not-a-number" },
    });

    const middleware = validateRequest({ body: bodySchema });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ path: ["age"] })])
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should forward unexpected errors to next()", async () => {
    const faultySchema = {
      parseAsync: () => {
        throw new Error("Unexpected error");
      },
    };

    const req = getMockReq({ body: {} });

    const middleware = validateRequest({ body: faultySchema as any });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
