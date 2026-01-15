// Log all folders in src/pages/characters at build time
const fs = require("fs");
const path = require("path");

const charactersDir = path.join(__dirname, "../src/pages/characters");

console.log("[diagnostic] Listing folders in src/pages/characters:");
if (fs.existsSync(charactersDir)) {
  const entries = fs.readdirSync(charactersDir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      console.log("  [folder]", entry.name);
    } else {
      console.log("  [file]", entry.name);
    }
  });
} else {
  console.log("src/pages/characters does not exist");
}
