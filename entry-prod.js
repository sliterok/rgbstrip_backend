import { createServer } from "http";
import sirv from "sirv";

let handleExports;
let sirvHandler;

async function init() {
    const PORT = 8001;
    const HOST = process.env.HOST || "localhost";

    const server = createServer((req, res) =>
        sirvHandler(req, res, () => {
            handleExports.default(req, res, () => {
                if (!res.writableEnded) {
                    res.statusCode = 404;
                    res.end();
                }
            });
        })
    );

    global.__PRODUCTION_SERVER__ = server;

    handleExports = await import("./dist/server/index.js");
    sirvHandler = sirv("./dist/client", handleExports.sirvOptions);

    server.listen(PORT, HOST, () => {
        // eslint-disable-next-line no-console
        console.log(`Server listening on http://${HOST}:${PORT}`);
    });
}

init();
