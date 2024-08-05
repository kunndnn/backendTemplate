require("dotenv").config();
const { connectDB } = require("./db/connection");
const { httpServer } = require("./app");
const { PORT } = process.env || 3001;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  })
  .catch((err) => console.log(`DB connection failed !!!`, err));
