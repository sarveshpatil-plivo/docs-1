---
title: "Backups and Updates"
---

## Backups

Your whole installation is a single folder: your `config.py`, the `plugins/` folder and the `data/` folder. Backing up the Cat is copying that folder.

- `config.py` and `plugins/` are your code.
- `data/` holds all the state: the SQLite database (`data/core/core.db`), user uploads (`data/uploads`) and the file-based vector memory.

To take a full backup, just copy the folder somewhere safe:

```bash
cp -r my-cat-project my-cat-backup
```

You can automate it with tools like [rsync](https://linux.die.net/man/1/rsync) and a simple [cron](https://linux.die.net/man/8/cron).

:::note
If you run an external database (PostgreSQL via `SQL`) or an external Qdrant instance for vector memory, back those up with their own tooling. The `data/` folder only covers the built-in, file-based setup.
:::

### Restoration

Put the folder back on any machine, install the dependencies and start the Cat:

```bash
cd my-cat-backup
uv sync
uv run ccat
```

## Updates

The Cat is a Python package, `cheshire-cat-ai`. Updating is bumping that dependency:

```bash
uv add cheshire-cat-ai@latest
```

We try to respect [semantic versioning](https://semver.org/), but the project is young and there may be some retrocompatibility hiccups. Pin a specific version in `pyproject.toml` if you want full control:

```bash
uv add cheshire-cat-ai==2.0.22
```

Then restart the Cat with `uv run ccat`.
