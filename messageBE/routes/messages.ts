import { Database } from "bun:sqlite";
import { clients } from "./stream"; 

const db = new Database("./database/messages.sqlite", { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function broadcast(data: object) {
  const payload = JSON.stringify(data);
  clients.forEach((client) => {
    try {
      client.send(payload);
    } catch (err) {
      console.error("Failed to send SSE:", err);
      client.close();
    }
  });
}

export async function handleMessages(req: Request): Promise<Response> {
	const url = new URL(req.url);

	// GET /messages → Return all messages
	if (req.method === "GET" && url.pathname === "/messages") {
		const messages = db.query("SELECT * FROM messages ORDER BY created_at DESC").all();
		return new Response(JSON.stringify(messages), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	// POST /messages → Add a new message
	if (req.method === "POST" && url.pathname === "/messages") {
		try {
			const body = await req.json();
			if (!body) {
				return new Response(JSON.stringify({ error: "Invalid JSON" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			const text = body.text?.trim();
			let author = body.author?.trim();

			// Validate input
			if (!author) {
				author = "Anonymous";
			}
			if (!text) {
				return new Response(JSON.stringify({ error: "Message text is required." }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			db.query("INSERT INTO messages (author, text) VALUES ($author, $message)")
				.run({
					$author: author,
					$message: text
				});

			// Inside POST handler after db.insert:
			// clients.forEach(client => {
			// 	const encoder = new TextEncoder();
			// 	const payload = JSON.stringify({ type: "new_message", text });
			// 	(client as any).body?.getWriter()?.write(encoder.encode(`data: ${payload}\n\n`));
			// });

			broadcast({ type: "new_message", text });

			return new Response(JSON.stringify({ success: true }), {
				status: 201,
				headers: { "Content-Type": "application/json" },
			});
		} catch (err) {
			console.log(err);
			return new Response(JSON.stringify({ error: "Invalid JSON" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	return new Response(JSON.stringify({ error: "Method not allowed" }), {
		status: 405,
		headers: { "Content-Type": "application/json" },
	});
}