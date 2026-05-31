# TOON — Token-Oriented Object Notation

TOON = JSON with mandatory compression metadata. Designed for LLM knowledge bases where every token counts.

## Core rule — `_toon` header

Every TOON file starts with a `_toon` block:

```json
{
  "_toon": {
    "v": "1.0",
    "schema": "<schema-name>",
    "created": "<ISO-8601>",
    "updated": "<ISO-8601>",
    "project": "<project-name>",
    "record_count": 0
  }
}
```

## Available schemas in this KB

| Schema | File | Purpose |
|--------|------|---------|
| `kb_map` | `kb_map.toon.json` | File map — every source file with purpose, exports, imports, size, tags |
| `kb_deps` | `kb_deps.toon.json` | Dependency graph — cross-file call/read/write relationships |
| `kb_updates` | `kb_updates.toon.json` | Changelog — newest first, tracks every change with before/after |
| `kb_full` | `kb.toon.json` | Consolidated summary — merges all three into one readable file |

## How to read TOON

1. **Start with** `kb.toon.json` — gives the big picture: total files, deps, data flow order, key files
2. **Drill into** `kb_map.toon.json` — see every file's purpose, what it exports/imports
3. **Trace deps** via `kb_deps.toon.json` — understand who calls what and why
4. **Check history** via `kb_updates.toon.json` — see what changed, when, and why

## dep_type values

| Type | Meaning |
|------|---------|
| `calls` | Function invocation |
| `reads` | Reads a value/export |
| `writes` | Writes to a value/export |
| `imports` | Module/file import |
| `inherits` | Class inheritance |
| `fires_event` | Event emission |

## Quick commands

```
pickle map       → print kb_map summary
pickle deps <file> → show dep chain for a file
pickle log       → show last 10 updates
```

## Why TOON?

- **Token-efficient**: structured, no prose, no filler
- **Consistent**: every file uses same schema
- **Self-documenting**: `_toon` header tells you what you're looking at
- **Machine-friendly**: plain JSON — can be parsed, diffed, queried
