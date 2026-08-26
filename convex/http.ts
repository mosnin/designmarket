import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handler as mcpHandler } from "./mcpHttp";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * The MCP endpoint. Both paths are registered because clients differ on
 * whether they append a trailing slash, and a 404 at connect time is a
 * miserable thing to debug from inside an agent.
 */
http.route({ path: "/mcp", method: "POST", handler: mcpHandler });
http.route({ path: "/mcp", method: "OPTIONS", handler: mcpHandler });
http.route({ path: "/mcp", method: "GET", handler: mcpHandler });

export default http;
