import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  console.log("Database connected");
  await sequelize.sync({ alter: true });
  console.log("Models synced");
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
} catch (err) {
  console.error("Startup failed:", err.message);
  process.exit(1);
}
