import { router } from "./router";

const server = Bun.serve({
    port: 80,
    fetch: router,
});


console.log(`Start listening on http://localhost:${server.port} ...`);