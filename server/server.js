import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js';
dotenv.config();
const app = express();
connectDB()

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'If-None-Match'],
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.get('/', (req, res)=> res.send("API is Working"))
app.use('/api/admin', adminRouter)
app.use('/api/ai', aiRouter)
app.use('/api/blog', blogRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log('Server is running on port ' + PORT)
})

export default app;
