// routes/stream.ts
export let clients: Response[] = [];

export function handleStream(req: Request): Response {
	const encoder = new TextEncoder();

  console.log("New client connected");

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const close = () => {
        const index = clients.findIndex((c) => c.send === send);
        if (index !== -1) clients.splice(index, 1);
        try {
          controller.close();
        } catch (_) {}
      };

      // ✅ Register client
      clients.push({ send, close });

      // ✅ Send initial message
      send("connected");

      // ✅ Keep connection alive
      const interval = setInterval(() => send("heartbeat"), 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        close();
      });

      console.log("end start controller");
    },
  });

  console.log("before returning stream");

  const response = new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"Access-Control-Allow-Origin": "https://ginryuu.com/",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Accept",
		}
	});

  console.log(response.headers);

	return response;
}