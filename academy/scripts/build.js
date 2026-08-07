const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "src"), { recursive: true });

for (const file of ["index.html", "README.md"]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

for (const file of fs.readdirSync(path.join(root, "src"))) {
  fs.copyFileSync(path.join(root, "src", file), path.join(dist, "src", file));
}

console.log(`Built static site in ${dist}`);
