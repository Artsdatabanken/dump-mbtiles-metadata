const sqlite = require("better-sqlite3");
const fs = require("fs");
var path = require("path");

function readMetadata(mbtilesPath) {
  const db = new sqlite(mbtilesPath);
  const rows = db.prepare("SELECT * FROM metadata").all();
  return rows.reduce((acc, row) => (acc[row.name] = row.value), {});
}

function dumpAllMetadata(mbtilesPath) {
  const meta = fs
    .readdirSync(mbtilesPath)
    .filter(
      file => fs.statSync(file).isFile() && path.extname(file) === ".mbtiles"
    )
    .reduce(
      (acc, file) => (acc[path.parse(file).name] = readMetadata(file)),
      {}
    );
  console.log(JSON.stringify(meta));
}

try {
  if (process.argv.length === 3) dumpAllMetadata(process.argv[2]);
  else throw new Error("Usage: node scan-mbtiles.js <directory>");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
