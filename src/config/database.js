import { Sequelize } from "sequelize";
import "dotenv/config";
import { readFileSync } from "node:fs";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

export default sequelize;
