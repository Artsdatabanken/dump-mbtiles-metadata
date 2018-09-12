#!/usr/bin/env node
const sqlite = require("better-sqlite3")
const fs = require("fs")
var path = require("path")

function readMetadata(mbtilesPath) {
  const db = new sqlite(mbtilesPath)
  const rows = db.prepare("SELECT * FROM metadata").all()
  return rows.reduce((acc, row) => {
    acc[row.name] = row.value
    return acc
  }, {})
}

function dumpAllMetadata(mbtilesPath) {
  const meta = fs
    .readdirSync(mbtilesPath)
    .map(file => path.join(mbtilesPath, file))
    .filter(file => {
      console.log(JSON.stringify(path.parse(file)))
      return fs.statSync(file).isFile() && path.extname(file) === ".mbtiles"
    })
    .reduce((acc, file) => {
      acc[path.parse(file).name] = readMetadata(file)
      return acc
    }, {})
  console.log(JSON.stringify(meta))
}

try {
  if (process.argv.length === 3) dumpAllMetadata(process.argv[2])
  else throw new Error("Usage: node scan-mbtiles.js <directory>")
} catch (error) {
  console.error(error)
  process.exit(1)
}
