#!/usr/bin/env node

/*
Reads all metadata from a directory structure containing .mbtiles and outputs metadata in JSON format.
*/

const sqlite = require("better-sqlite3");
const fs = require("fs");
var path = require("path");

function sqliteQuery(mbtilesPath, sql) {
  try {
    const db = new sqlite(mbtilesPath);
    const rows = db.prepare(sql).all();
    return rows;
  } catch (error) {
    console.error(`Error reading ${mbtilesPath}: ${error.message}`);
    return { error: error.message };
  }
}

function readMbtilesMetadata(mbtilesPath) {
  const sql = "SELECT * FROM metadata";
  const rows = sqliteQuery(mbtilesPath, sql);
  return rows.reduce((acc, row) => {
    acc[row.name] = row.value;
    return acc;
  }, {});
}

function readSpatialiteMetadata(spatialitePath) {
  const sql = "select * from vector_layers_statistics";
  return sqliteQuery(spatialitePath, sql)[0];
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
      rec = Object.assign(rec, readMetadata(file));
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

function readMetadata(file) {
  try {
    const ext = path.extname(file);
    if (ext === ".mbtiles") rec = Object.assign(rec, readMbtilesMetadata(file));
    if (ext === ".sqlite")
      // Spatialite
      rec = Object.assign(rec, readSpatialiteMetadata(file));
  } catch (e) {
    console.error(e);
  }
}
