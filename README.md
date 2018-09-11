# Scan .mbtiles

Reads the metadata table from all [.mbtiles](https://github.com/mapbox/mbtiles-spec) inside a directory. Outputs the metadata to console in JSON format.


## Installation

```
 npm install -g @artsdatabanken/dump-mbtiles-metadata
```

## Usage

```
 dump-mbtiles-metadata <directory>
```

## Sample

```
> dump-mbtiles-metadata .
```

```json
{
  "AO": {
    "name": "/data/AO.mbtiles",
    "description": "/data/AO.mbtiles",
    "version": "2",
    "minzoom": "0",
    "maxzoom": "11",
    "center": "10.810547,59.578822,11",
    "bounds": "4.087527,57.759005,31.761389,71.384877",
    "type": "overlay",
    "format": "pbf",
    "json": "{...}"
  },
  "NA": {
    "...": "..."
  }
```
