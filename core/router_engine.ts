export interface RouteContext<TPayload = unknown> {
  path: string;
  payload?: TPayload;
}

export type RouteHandler<TPayload = unknown, TResult = unknown> = (
  context: RouteContext<TPayload>
) => Promise<TResult> | TResult;

export class RouterEngine {
  private routes = new Map<string, RouteHandler>();

  register(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  async dispatch<TPayload = unknown, TResult = unknown>(
    path: string,
    payload?: TPayload
  ): Promise<TResult> {
    const handler = this.routes.get(path);
    if (!handler) {
      throw new Error(`No route handler found for: ${path}`);
    }

    return (await handler({ path, payload })) as TResult;
  }

  listRoutes(): string[] {
    return [...this.routes.keys()];
  }
}
