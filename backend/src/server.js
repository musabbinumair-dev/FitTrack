import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { seedAdminUser } from "./utils/seedAdmin.js";

async function startServer() {
  try {
    await connectDB();
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Connected to database: ${connectDB.name ? 'MongoDB Atlas' : 'Local'}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error.message);
  }
}

startServer();
