# zodware

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Express + Zod Middleware](https://img.shields.io/badge/Express%20%2B%20Zod-Middleware-3068B7?logo=express&logoColor=white)

zodware is a lightweight, zero-dependency Express middleware for validating requests using Zod schemas. Supports body, params, and query with automatic 422 responses on validation errors.

## Features

- Validates req.body, req.params, and req.query
- Uses Zod's powerful schema definitions
- Automatically returns 422 Unprocessable Entity on validation failure
- Forwards unexpected errors to Express error handler

## 📦 Installation

```bash
# Install middleware and peer dependency
npm install zodware zod
```

## API

`validateRequest({ body?, params?, query? })`

| Option | Type        | Description                        |
| ------ | ----------- | ---------------------------------- |
| body   | `ZodSchema` | Schema for validating `req.body`   |
| params | `ZodSchema` | Schema for validating `req.params` |
| query  | `ZodSchema` | Schema for validating `req.query`  |

- ZodSchema means any Zod object schema (z.ZodObject or compatible).

## Usage

```typescript
import express from "express";
import { z } from "zod";
import validateRequest from "zodware";

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
    // req.body, req.params, req.query are typed correctly here
    res.json({ message: "Validated successfully", data: req.body });
  }
);
```

## Typescript Support

`zodware` provides utility types to help strongly type your Express request handlers using your Zod schemas. This is especially useful when the controller is located in a separate file

```typescript
import type { TypedBody, TypedParams, TypedQuery } from "zodware";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});

const paramsSchema = z.object({ id: z.string().uuid() });

const querySchema = z.object({ ref: z.string().optional() });

// Usage in Express handler:
app.post(
  "/users/:id",
  validateRequest({
    body: userSchema,
    params: paramsSchema,
    query: querySchema,
  }),
  (req, res) => {
    // Now req.body, req.params, and req.query are properly typed!
    res.json({ message: "Validated successfully", data: req.body });
  }
);
```

### Exported Types

| Type             | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `TypedBody<T>`   | Typed Express Request with validated `req.body` of schema `T`   |
| `TypedParams<T>` | Typed Express Request with validated `req.params` of schema `T` |
| `TypedQuery<T>`  | Typed Express Request with validated `req.query` of schema `T`  |

## Error Handling

On validation failure, zodware automatically responds with HTTP status 422 Unprocessable Entity and a JSON array of Zod validation issues.

Any other unexpected errors are forwarded to the next Express error handler middleware.

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
