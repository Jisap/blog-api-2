

import express from "express";
import config from "./config/index";
import cors from "cors";
import type { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "./lib/express_rate_limit";
import v1Routes from "@/routes/v1"

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
      console.log(`CORS error: ${origin} is not allowed by CORS`)
    }
  }
}

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser()); // Analiza el encabezado "Cookie" de las solicitudes http y puebla el objeto "req.cookies"

app.use(compression({    // Compress response bodies
  threshold: 1024        // only responses greater than 1kb 
}));

app.use(helmet());       // Secure HTTP headers

app.use(limiter);        // Rate limiting


(async () => {
  try {
    app.use('/api/v1', v1Routes);


    app.listen(config.PORT, () => {
      console.log(`Server running: http://localhost:${config.PORT}`);
    });

  } catch (error) {
    console.log('Failed to start the server', error);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})()


