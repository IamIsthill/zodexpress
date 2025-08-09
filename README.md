# zodexpress

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Express + Zod Middleware](https://img.shields.io/badge/Express%20%2B%20Zod-Middleware-3068B7?logo=express&logoColor=white)

zodexpress is a lightweight, zero-dependency Express middleware for validating requests using Zod schemas. Supports body, params, and query with automatic 422 responses on validation errors.

---

## Features

- Validates req.body, req.params, and req.query
- Uses Zod's powerful schema definitions
- Automatically returns 422 Unprocessable Entity on validation failure
- Forwards unexpected errors to Express error handler

## 📦 Installation

```bash
# Install middleware and peer dependency
npm install zodexpress zod
```

## API

`validateRequest({ body?, params?, query? })`

| Option | Type        | Description                        |
| ------ | ----------- | ---------------------------------- |
| body   | `ZodSchema` | Schema for validating `req.body`   |
| params | `ZodSchema` | Schema for validating `req.params` |
| query  | `ZodSchema` | Schema for validating `req.query`  |

## Usage

```typescript
import express from "express";
import { z } from "zod";
import validateRequest from "zodexpress";

const app = express();
app.use(express.json());

// Sample schema built using zod
const userSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});

app.post(
  "/users/:id",
  validateRequest({
    body: userSchema,
    params: z.object({ id: z.string().uuid() }),
    query: z.object({ ref: z.string().optional() }),
  }),
  (req, res) => {
    res.json({ message: "Validated successfully", data: req.body });
  }
);
```

## Testing

This middleware is tested using [Jest](https://jestjs.io/)

To run tests:

```cmd
npm install -D jest @jest-mock/express
npm test
```

Example test case:

```typescript
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
```

## License

This package is licensed under [MIT](https://opensource.org/licenses/MIT)
