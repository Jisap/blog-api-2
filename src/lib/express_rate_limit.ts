

import { rateLimit } from "express-rate-limit";


// Configure rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 60000,            // 1-minute time window for request limittin
  max: 60,                    // Allow a maximun of 60 requests per window per IP
  standardHeaders: 'draft-8', // Use the latest standard for rate limiting headers
  legacyHeaders: false,       // Do not send the legacy rate limiting headers
  message: {
    error:
      'You have sent too many requests in a given amount of time. please try again later'
  }
});

export default limiter;