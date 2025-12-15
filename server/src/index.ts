import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from './lib/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.get('/health',(req,res)=>{
    res.send("OK");
});

app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

