import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
import Groq from "groq-sdk";

dotenv.config({
  path: "./.env",
});
export const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//       console.log(` listening on http://localhost:${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("mongodb connection failed: " + err);
//   });

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    // Explicitly listen on 0.0.0.0 to be accessible by Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed: ", err);
    process.exit(1); 
  });
