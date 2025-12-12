

import dotenv from "dotenv"

dotenv.config({ quiet: true });

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: ['https://docs.blog-api.codewithsadee.com'],
  MONGO_URI: process.env.MONGO_URI
}

export default config
