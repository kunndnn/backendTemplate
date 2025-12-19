import cron from "node-cron";

const cronJobs = () => {
  // runs every minute
  // cron.schedule("* * * * *", () => {
  //   console.log("Task running every minute", new Date().toISOString());
  // });
};

export default cronJobs;
