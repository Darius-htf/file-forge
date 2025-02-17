const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });
const sevenZipPath = '"F:/Apps/7-Zip/7z.exe"';

// Enable CORS for all routes
app.use(cors());

// OR enable CORS for specific origins
// app.use(cors({ origin: "http://localhost:5500" })); // Example: Only allow requests from this origin

// Func for extracting the files
function extractExe(filePath, outputDir) {
  return new Promise((resolve, reject) => {
    outputDir.forEach((path) => {
      const command = `${sevenZipPath} x "${filePath}" -o"${path}" -y`;
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(error.message);
        return resolve(stdout || stderr);
      });
    });
  });
}

function create7z(outputDir, outputExePath) {
  return new Promise((resolve, reject) => {
    // Step 1: Create .7z archive
    const archivePath = `${outputExePath}.7z`;
    const command = `${sevenZipPath} a "${archivePath}" "${outputDir}\\*"`;

    exec(command, async (error, stdout, stderr) => {
      if (error) return reject(`Compression error: ${error.message}`);

      try {
        await createExe(outputExePath);
        resolve(`${outputExePath}.exe created successfully!`);
      } catch (exeError) {
        reject(`EXE creation error: ${exeError.message}`);
      }
    });
  });
}

function createExe(outputExePath) {
  return new Promise((resolve, reject) => {
    const archivePath = `${outputExePath}.7z`;
    const exePath = `${outputExePath}.exe`;

    // Step 2: Copy SFX module + archive + config to create EXE
    const command = `copy /b "F:/Apps/7-Zip/7z.sfx" + "config.txt" + "${archivePath}" "${exePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) return reject(`SFX creation error: ${error.message}`);
      resolve(stdout || stderr);
    });
  });
}

// Post method
app.post("/upload", upload.array("files"), async (req, res) => {
  const files = req.files;

  // Check for output directory
  const outputDir = path.join(__dirname, "extracted");
  const backupOutputdir = path.join(__dirname, "backupExtracted");

  // Dir existance check
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  if (!fs.existsSync(backupOutputdir)) fs.mkdirSync(backupOutputdir);

  // Pushing logs
  const log = [];
  for (const file of files) {
    try {
      log.push(`[INFO] Extracting: ${file.originalname}`);
      await extractExe(file.path, [outputDir, backupOutputdir]);
      log.push(`[SUCCESS] Extracted: ${file.originalname}`);
    } catch (error) {
      log.push(`[ERROR] Failed to extract ${file.originalname}: ${error}`);
    }
  }

  return res.json({ message: "Extraction completed.", log });
});

app.post("/pack", async (req, res) => {
  const outputDir = path.join(__dirname, "extracted"); // Folder with extracted files
  const outputExePath = path.join(__dirname, "repacked_output"); // Path for the new EXE

  try {
    const message = await create7z(outputDir, outputExePath);
    return res.json({ message });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
