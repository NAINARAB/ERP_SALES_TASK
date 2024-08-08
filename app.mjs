import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors'
import indexRouter from './routes/index.mjs';
import morgan from 'morgan';
import fs from 'fs';
import { connectDB } from './config/dbconfig.mjs';
import dotenv from 'dotenv';
import { listRoutes } from './middleware/apiList.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));


const logStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('dev', { stream: logStream }));

connectDB();

app.use('/api', indexRouter);

const reactBuildPath = path.join(__dirname, 'frontend');
app.use(express.static(reactBuildPath));

const machineOutern = path.join(__dirname, 'controller', 'DataEntry', 'fileHandling', 'uploads', 'machineOutern');
app.use('/imageURL/machineOutern', express.static(machineOutern));

const inwardActivity = path.join(__dirname, 'controller', 'DataEntry', 'fileHandling', 'uploads', 'inwardActivity');
app.use('/imageURL/inwardActivity', express.static(inwardActivity));

app.get('*', (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

const routes = listRoutes(app);
console.table(routes);

const PORT = process.env.PORT || 9001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});