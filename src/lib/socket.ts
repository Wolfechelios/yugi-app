/**
 * Minimal socket shim for build-time resolution.
 * Replace or expand with your real Socket.IO server logic.
 *
 * Exports:
 *  - setupSocket(httpServer: import('http').Server, io?: import('socket.io').Server): void
 *
 * This file is intentionally small so Next.js TypeScript build resolves '@/lib/socket' during CI/next build.
 */

import type { Server as HttpServer } from "http";
import type { Server as IOServer } from "socket.io";

export function setupSocket(server: HttpServer, io?: IOServer) {
  try {
    const socketServer = io ?? null;
    if (socketServer && typeof (socketServer as any).on === "function") {
      (socketServer as any).on("connection", (socket: any) => {
        console.log("Socket connected:", socket?.id ?? "(unknown id)");
        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      });
    }
  } catch (err) {
    console.warn("setupSocket placeholder invoked", err);
  }
}

export type SetupSocketFn = typeof setupSocket;
