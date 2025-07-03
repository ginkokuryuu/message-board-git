import { handleMessages } from "./routes/messages";
import { handleStream } from "./routes/stream";

export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Add CORS handling globally (optional)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (pathname === "/messages") {
    const res = await handleMessages(req);
    return withCORS(res);
  }

  if (pathname === "/stream") {
    return handleStream(req);
  }

  return new Response("Not Found", { status: 404 });
}

function withCORS(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(res.body, { status: res.status, headers });
}