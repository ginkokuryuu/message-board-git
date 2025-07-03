import { router } from "./router";

const server = Bun.serve({
    port: 3001,
    fetch: router,
});


console.log(`Listening on http://localhost:${server.port} ...`);