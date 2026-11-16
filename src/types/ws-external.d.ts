declare module 'ws' {
  export default class WebSocket {
    constructor(address: string, options?: Record<string, unknown>);
    on(event: string, listener: (...args: any[]) => void): this;
    send(data: string): void;
    close(): void;
    terminate(): void;
  }
}
