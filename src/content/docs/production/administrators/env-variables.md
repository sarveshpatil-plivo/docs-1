---
title: "Configuration"
---

The Cat is configured with a single, optional file: `config.py`, placed in your project folder (next to `pyproject.toml` and the `plugins/` folder).

If the file is absent, the Cat runs on sensible defaults. When present, it overrides only the settings you redefine. Everything else keeps its default.

## How it works

Configuration is a set of UPPERCASE constants. The Cat starts from its built-in defaults, then imports your `config.py` and lets it override any of them:

```python
# config.py

# lock the installation for production
API_KEY = "a-very-long-and-alphanumeric-secret"
JWT_SECRET = "yet-another-very-long-and-alphanumeric-secret"

# public address the Cat is reachable at
URL = "https://assistant.mycompany.com"
```

`config.py` is plain Python, so you are free to read values from the environment or a `.env` file yourself:

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # read a local .env if present

API_KEY = os.environ["CAT_API_KEY"]
JWT_SECRET = os.environ["CAT_JWT_SECRET"]
SQL = os.environ.get("DATABASE_URL", "sqlite:///data/core/core.db")
```

This keeps secrets out of your codebase while still giving you the full power of Python for anything computed.

## Available settings

| Setting | Default | Description |
|---------|---------|-------------|
| `URL` | `http://localhost:1865` | Public address the Cat is reachable at. Set it in production so the Cat knows its own address. |
| `SQL` | `sqlite:///data/core/core.db` | Database connection. Supports SQLite and PostgreSQL (e.g. `postgresql://user:pass@host/db`). |
| `API_KEY` | `meow` | Master key for machine-to-machine access, mapped to the admin user. Set to `None` to disable key auth entirely (JWT only). |
| `JWT_SECRET` | `meow_jwt` | Secret used to sign and validate JWTs. |
| `JWT_EXPIRE_MINUTES` | `1440` | JWT lifetime, in minutes (1 day). |
| `DEBUG` | `true` | Self-reload on file changes during development. Turn off in production. |
| `LOG_LEVEL` | `INFO` | One of `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`. |
| `HTTPS_PROXY_MODE` | `false` | Enable when running behind an HTTPS reverse proxy, otherwise redirects break. |
| `CORS_FORWARDED_ALLOW_IPS` | `*` | Comma separated list of IPs to trust with proxy headers. |
| `CORS_ENABLED` | `true` | Whether CORS is enabled. |
| `CORS_ALLOWED_ORIGINS` | `*` | Comma separated list of allowed origins, or `*` for all. |
| `DEFAULT_LLM` | `default:default` | Default language model as a `provider:model` string (e.g. `openai:gpt-4o`). |
| `DEFAULT_EMBEDDER` | `default:default` | Default embedder as a `provider:model` string. |
| `TELEMETRY` | `true` | Anonymous usage telemetry. |

:::note
The `data/` folder (SQLite database, uploads, vector memory) lives inside your project folder. See [Backups and Updates](/docs/production/administrators/backups-updates/).
:::
