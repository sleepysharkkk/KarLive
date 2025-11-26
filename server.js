// server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 允許前端從任何來源來呼叫（之後如果只允許自己網域可以再縮）
app.use(cors());

// ---- 靜態檔案：前端頁面 ----
const publicFolder = path.join(__dirname, "public");
app.use(express.static(publicFolder));

// ---- 確保 uploads 資料夾存在 ----
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// 讓影片可以透過 /uploads/xxx.mp4 存取
app.use("/uploads", express.static(uploadFolder));

// ---- Multer 設定（處理影片上傳）----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 例如 .mp4
    const videoId = "vid_" + Date.now();
    cb(null, videoId + ext); // vid_1234567890.mp4
  }
});

const upload = multer({ storage });

// ---- 上傳 API：/api/upload ----
app.post("/api/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "no file" });
    }

    const filename = req.file.filename;         // vid_1234567890.mp4
    const videoId = path.parse(filename).name;  // vid_1234567890

    // Render 上線後，這裡的 domain 會換成 https://你的服務名.onrender.com
    const baseUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3001";
    const url = `${baseUrl}/uploads/${filename}`;

    console.log("Uploaded:", videoId, url);

    res.json({ success: true, videoId, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "upload failed" });
  }
});

// ---- 其餘路由都回 index.html（例如直接開 /創作.html ）----
app.get("*", (req, res) => {
  res.sendFile(path.join(publicFolder, "index.html"));
});

// ---- 啟動 Server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
