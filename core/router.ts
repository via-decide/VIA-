export interface RuntimeRequest<TPayload = unknown> {
  route: string;
  payload?: TPayload;
  context?: Record<string, unknown>;
}

export type RuntimeHandler<TPayload = unknown, TResult = unknown> = (
  request: RuntimeRequest<TPayload>
) => TResult | Promise<TResult>;

export class Router {
  private routes = new Map<string, RuntimeHandler>();

  register(path: string, handler: RuntimeHandler): void {
    this.routes.set(path, handler);
  }

  has(path: string): boolean {
    return this.routes.has(path);
  }

  async route<TPayload = unknown, TResult = unknown>(request: RuntimeRequest<TPayload>): Promise<TResult> {
    const handler = this.routes.get(request.route);
    if (!handler) {
      throw new Error(`Unknown route: ${request.route}`);
    }
    return await handler(request) as TResult;
  }

  list(): string[] {
    return [...this.routes.keys()];
  }
}
