import { NextFunction, Request, Response } from "express";
import { ZodError, z, ZodType } from "zod";

interface RequestValidator<
  TBody extends ZodType<any> = ZodType<any>,
  TParams extends ZodType<any> = ZodType<any>,
  TQuery extends ZodType<any> = ZodType<any>
> {
  body?: TBody;
  params?: TParams;
  query?: TQuery;
}
export type TypedBody<T extends ZodType<any>> = Request<
  object,
  object,
  z.infer<T>,
  object
>;

export type TypedParams<T extends ZodType<any>> = Request<
  z.infer<T>,
  object,
  object,
  object
>;

export type TypedQuery<T extends ZodType<any>> = Request<
  object,
  object,
  object,
  z.infer<T>
>;

export type InferRequest<
  TBody extends ZodType<any>,
  TParams extends ZodType<any>,
  TQuery extends ZodType<any>
> = Request<
  TParams extends ZodType<any> ? z.infer<TParams> : object,
  any,
  TBody extends ZodType<any> ? z.infer<TBody> : object,
  TQuery extends ZodType<any> ? z.infer<TQuery> : object
>;

function validateRequest<
  TBody extends ZodType<any> = ZodType<any>,
  TParams extends ZodType<any> = ZodType<any>,
  TQuery extends ZodType<any> = ZodType<any>
>(validators: RequestValidator<TBody, TParams, TQuery>) {
  return async (
    request: InferRequest<TBody, TParams, TQuery>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      if (validators.body) {
        Object.assign(
          request.body,
          await validators.body.parseAsync(request.body)
        );
      }

      if (validators.params) {
        Object.assign(
          request.params,
          await validators.params.parseAsync(request.params)
        );
      }

      if (validators.query) {
        Object.assign(
          request.query,
          await validators.query.parseAsync(request.query)
        );
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        response.status(422).json(err.issues);
        return;
      }
      next(err);
    }
  };
}

export default validateRequest;
