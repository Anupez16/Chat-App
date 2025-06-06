// printStructure.js
const fs = require("fs");
const path = require("path");

function printTree(dirPath, indent = "") {
  const files = fs.readdirSync(dirPath);

  files.forEach((file, index) => {
    if (file === "node_modules" || file === ".git") return; // skip large folders

    const fullPath = path.join(dirPath, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    const isLast = index === files.length - 1;

    const prefix = isLast ? "└── " : "├── ";
    console.log(indent + prefix + file);

    if (isDirectory) {
      const newIndent = indent + (isLast ? "    " : "│   ");
      printTree(fullPath, newIndent);
    }
  });
}

printTree(".");
