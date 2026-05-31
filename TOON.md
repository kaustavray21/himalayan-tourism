# TOON — Token-Oriented Object Notation

TOON = compact knowledge-base format. Two flavors: **JSON** (`.toon.json`) and **YAML** (`.toon`).

## Core rule — `_toon` header

Every TOON file starts with metadata block:

**JSON (.toon.json):**
```json
{ "_toon": { "v": "1.0", "schema": "kb_map", "created": "...", "updated": "...", "project": "himalayan-tourism", "record_count": 17 } }
```

**YAML (.toon):**
```yaml
_toon:
  v: "1.0"
  schema: merged
  project: himalayan-tourism
  record_count: 66
```

## Available files

| File | Format | Purpose |
|------|--------|---------|
| `project_local_knowledge_base/kb_map.toon.json` | JSON | File map — every source file with purpose, exports, imports, size, tags |
| `project_local_knowledge_base/kb_deps.toon.json` | JSON | Dependency graph — cross-file call/read/write relationships |
| `project_local_knowledge_base/kb_updates.toon.json` | JSON | Changelog — newest first, tracks every change |
| `project_local_knowledge_base/kb.toon.json` | JSON | Consolidated summary — merges map+deps+updates |
| `project_local_knowledge_base/kb_merged.toon.json` | JSON | Auto-merged by `node toon.mjs` — combines all 4 schemas into one file |
| `kb.toon.toon` | YAML | Human-readable KB overview — summary, data flow, key files, deps heatmap, changelog |
| `kb_merged.toon` | YAML | Human-readable merged view — all schemas in compact YAML tables |

## How to read TOON

1. **Quick overview** — open `kb.toon.toon` (YAML, 60 lines). Shows summary, data flow order, key files, deps heatmap, changelog
2. **Full merged view** — open `kb_merged.toon` (YAML, 230 lines). All schemas: summary + deps table + file map + updates
3. **Machine query** — use `kb_merged.toon.json` (JSON, 808 lines). Parsable, diffable, queryable
4. **Per-schema drill** — use `kb_map.toon.json` (file details), `kb_deps.toon.json` (dep tracing), `kb_updates.toon.json` (history)

## YAML TOON conventions

- Indentation = nesting (2 spaces)
- `key[n]:` = array with count hint (e.g. `views[6]: home,packages,...`)
- `key[n]{field1,field2}` = array of objects with fields listed
- Lists on one line comma-separated, or as YAML list items (`- item`)

## dep_type values

| Type | Meaning |
|------|---------|
| `calls` | Function invocation |
| `reads` | Reads a value/export |
| `writes` | Writes to a value/export |
| `imports` | Module/file import |
| `inherits` | Class inheritance |
| `fires_event` | Event emission |

## TOON commands

```
node toon.mjs                        → merge all *.toon.json into kb_merged.toon.json
node toon.mjs --files kb_map kb_deps → merge only specific schemas
node toon.mjs --out custom.toon.json → custom output name
```

## Why TOON?

- **Token-efficient**: structured, no prose, no filler
- **Consistent**: every file uses same schema
- **Self-documenting**: `_toon` header tells you what you're looking at
- **Dual format**: JSON for machines, YAML for humans
