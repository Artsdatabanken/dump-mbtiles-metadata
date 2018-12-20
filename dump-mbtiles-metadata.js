#!/usr/bin/env node
const sqlite = require("better-sqlite3")
const fs = require("fs")
var path = require("path")

function readMetadata(mbtilesPath) {
  try {
    const db = new sqlite(mbtilesPath)
    const rows = db.prepare("SELECT * FROM metadata").all()
    return rows.reduce((acc, row) => {
      acc[row.name] = row.value
      return acc
    }, {})
  } catch (error) {
    console.error(`Error reading ${mbtilesPath}: ${error.message}`)
    return { error: error.message }
  }
}

function dumpAllMetadata(basePath, mbtilesPath, acc = {}) {
  return fs
    .readdirSync(mbtilesPath)
    .map(file => path.join(mbtilesPath, file))
    .reduce((acc, file) => {
      if (fs.statSync(file).isDirectory()) {
        dumpAllMetadata(basePath, file, acc)
      } else if (path.extname(file) === ".mbtiles")
        acc[path.relative(basePath, file)] = readMetadata(file)
      return acc
    }, acc)
}

try {
  if (process.argv.length === 3) {
    const sourcePath = process.argv[2]
    const meta = dumpAllMetadata(sourcePath, sourcePath)
    console.log(JSON.stringify(meta))
  } else throw new Error("Usage: node scan-mbtiles.js <directory>")
} catch (error) {
  console.error(error)
  process.exit(1)
}
