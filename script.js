const fs = require("fs");

const inputFile = "./sample.fr"
try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    console.log("File content loaded successfully.");

    // Step 2: Perform string operations (editing the file)
    // Example: Replace "Font_Latin33" with "Font_Modified"
    const modifiedContent = fileContent.replace(/White/g, "Red");

    // Step 3: Write the modified file to a new file
    const outputFile = "./sample_modified.fr"
    fs.writeFileSync(outputFile, modifiedContent, 'utf8')
    console.log(`File modification complete. Saved as ${outputFile}`);
} catch (error) {
    console.error("An error occurred:", error);
}