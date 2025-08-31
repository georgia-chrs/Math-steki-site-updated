import express from 'express';
import fs from 'fs/promises';

const app = express();
app.use(express.json());



app.post('/save-edit', async (req, res) => {
  const { id, content } = req.body;
  let data = {};
  try {
    const file = await fs.readFile('server-text.json', 'utf8');
    data = JSON.parse(file);
  } catch (e) {}
  data[id] = content;
  await fs.writeFile('server-text.json', JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.get('/footer-links', async (req, res) => {
  try {
    const file = await fs.readFile('server-text.json', 'utf8');
    res.json(JSON.parse(file));
  } catch (e) {
    res.json({});
  }
});