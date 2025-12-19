import cron from "node-cron";

const cronJobs = () => {
  // runs every minute
  cron.schedule("*/5 * * * * *", () => {
    console.log("Task running every minute", new Date().toISOString());
  });
};

export default cronJobs;
