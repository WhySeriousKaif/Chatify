import express from "express";
import path from "path";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const __dirname=path.resolve();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// serve static files from frontend dist folder
app.use(express.static(path.join(__dirname,"../frontend/dist")));

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

// make ready for deployment - serve frontend for all routes except API routes
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));
  
  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
  });
}
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
