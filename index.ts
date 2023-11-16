import express, { Express, Request, Response, Application } from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
} from 'firebase/firestore/lite';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import os from 'os-utils';
import { firebaseConfig } from './src/config/firebaseConfig';

dotenv.config();

const app: Application = express();
app.use(cors());
const port = process.env.PORT || 8000;

const fbInstance = initializeApp(firebaseConfig);
const dbInstance = getFirestore(fbInstance);

const jsonParser = bodyParser.json();

app.get('/', (req: Request, res: Response) => {
  res.send('Hive CPU Measurement Tool');
});

app.get('/measure', (req: Request, res: Response) => {
  os.cpuUsage((cpuLoad: number) => {
    res.json({ cpuLoad });
  });
});

app.get('/cpu-usage/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const docReference = doc(dbInstance, 'cpu', id);
  const docSnapshot = await getDoc(docReference);
  res.json(docSnapshot.data());
});

app.get('/cpu-usage', async (req: Request, res: Response) => {
  const docCollection = collection(dbInstance, 'cpu');
  const docSnapshot = await getDocs(docCollection);
  const result = docSnapshot.docs.map(doc => doc.data());
  res.json(result);
});

app.post('/cpu-usage', jsonParser, async (req: Request, res: Response) => {
  const requestBody = req.body;
  const ip = req.socket.remoteAddress;
  const docCollection = collection(dbInstance, 'cpu');
  const result = await addDoc(docCollection, { ...requestBody, ip });
  res.status(201).json(result.id);
});

app.put('/cpu-usage/:id', jsonParser, async (req: Request, res: Response) => {
  const requestBody = req.body;
  const { id } = req.params;
  const docReference = doc(dbInstance, 'cpu', id);
  setDoc(docReference, requestBody);
  res.status(204).json();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
