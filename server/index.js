const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, '../client')));

app.post('/upload', upload.single('file'), (req, res) => {
  const results = [];
  const fileSize = req.file.size;
  let processedSize = 0;

  const stream = fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
      processedSize += JSON.stringify(data).length;
      const percentage = Math.min((processedSize / fileSize) * 100, 100);
      io.emit('progress', { percentage });
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json(results);
    });

  stream.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
