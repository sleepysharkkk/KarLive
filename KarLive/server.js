// server.js
const express = require('express');
const multer  = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// 上傳目的地資料夾：uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    // 用時間 + 副檔名 當檔名
    const ext = path.extname(file.originalname);
    const id = 'vid_' + Date.now();
    cb(null, id + ext);
  }
});

const upload = multer({ storage });

// 建一個 uploads 資料夾
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 上傳 API
app.post('/api/upload', upload.single('video'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: '沒有收到檔案' });

  // 從檔名取出剛剛我們設定的 id
  const filename = file.filename;            // vid_1700897xxxxx.mp4
  const videoId = path.parse(filename).name; // vid_1700897xxxxx

  // 影片網址（假設前端也在 http://localhost:3000 放）
  const url = `http://localhost:3000/uploads/${filename}`;

  // 回傳給前端
  res.json({ videoId, url });
});

// 把 uploads 靜態開出來
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 啟動伺服器
const PORT = 3001;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
