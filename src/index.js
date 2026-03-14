// cluster-server.js
import cluster from "cluster";
import os from "os";
import "dotenv/config";
import { connectDB } from "./config/connection.js";
import { connectRedis } from "./config/redis.js";
import { httpServer } from "./app.js";
import { setupMaster } from "@socket.io/sticky";
import cronJobs from "#services/cronJobs";

const numCPUs = os.cpus().length;
const PORT = process.env.PORT ?? 3001;

if (cluster.isPrimary) {
  // run cron jobs
  cronJobs();

  // Master process
  console.warn(`Master ${process.pid} is running`);

  setupMaster(httpServer, {
    loadBalancingMethod: "round-robin",
  });

  // Fork workers = number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, restart it
  cluster.on("exit", (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Worker processes
  connectDB()
    .then(connectRedis)
    .then(() => {
      httpServer.listen(PORT, () =>
        console.warn(`Worker ${process.pid} running at http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.warn("Startup connection failed !!! ", err);
      process.exit(1); // stop worker if DB connection fails
    });
}
