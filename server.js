const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });
const sevenZipPath = '"F:/Apps/7-Zip/7z.exe"';

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

// Post method
app.post("/upload", upload.array("files"), async (req, res) => {
    const files = req.files;

    // Check for output directory
    const outputDir = path.join(__dirname, "extracted");
    const backupOutputdir = path.join(__dirname, "backupExtracted");

    // Dir existance check
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

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

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
});
