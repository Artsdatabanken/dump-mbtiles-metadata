#!/usr/bin/env node

/*
Reads all metadata from a directory structure containing .mbtiles and outputs metadata in JSON format.
*/

const sqlite = require("better-sqlite3");
const fs = require("fs");
var path = require("path");

function sqlite(mbtilesPath, sql) {
  try {
    const db = new sqlite(mbtilesPath);
    const rows = db.prepare(sql).all();
    return rows.reduce((acc, row) => {
      acc[row.name] = row.value;
      return acc;
    }, {});
  } catch (error) {
    console.error(`Error reading ${mbtilesPath}: ${error.message}`);
    return { error: error.message };
  }
}

function readMbtilesMetadata(mbtilesPath) {
  const sql = "SELECT * FROM metadata";
  return sqlite(mbtilesPath, sql);
}

function readSpatialiteMetadata(spatialitePath) {
  const sql = "select * from vector_layers_statistics";
  return sqlite(mbtilesPath, sql);
}

function dumpAllMetadata(basePath, mbtilesPath, acc = {}) {
  return fs
    .readdirSync(mbtilesPath)
    .map(file => path.join(mbtilesPath, file))
    .reduce((acc, file) => {
      const stat = fs.statSync(file);
      if (stat.isDirectory()) {
        dumpAllMetadata(basePath, file, acc);
        return acc;
      }
      const fn = path.basename(file);
      let rec = {
        size: stat.size,
        mtime: stat.mtime
      };
      const ext = path.extname(file);
      if (ext === ".mbtiles")
        rec = Object.assign(rec, readMbtilesMetadata(file));
      if (ext === ".sqlite")
        // Spatialite
        rec = Object.assign(rec, readSpatialiteMetadata(file));
      const relPath = path.relative(basePath, file);
      const dir = path.dirname(relPath);
      acc[dir] = acc[dir] || {};
      acc[dir][fn] = rec;
      return acc;
    }, acc);
}

try {
  if (process.argv.length === 3) {
    const sourcePath = process.argv[2];
    const meta = dumpAllMetadata(sourcePath, sourcePath);
    console.log(JSON.stringify(meta));
  } else throw new Error("Usage: node dump-mbtiles-metadata.js <directory>");
} catch (error) {
  console.error(error);
  process.exit(1);
}
