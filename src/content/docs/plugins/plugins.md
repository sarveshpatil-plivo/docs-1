---
title: "How to write a plugin"
---

A plugin is a folder of Python files. Drop it in the `plugins/` directory and the Cat discovers everything inside it at startup, no registration, no wiring. For a hands-on build, follow the [Plugin Tutorial](/docs/quickstart/prepare-plugin/); this page is the authoring reference.

## Discovery

The Cat imports every `.py` file in a plugin folder at startup (skipping a `tests/` directory, see [Automatic Tests](/docs/production/administrators/tests/)). Any [Agent](/docs/plugins/agents/), [Tool](/docs/plugins/tools/), [Directive](/docs/plugins/directives/), [Hook](/docs/plugins/hooks/) or [Endpoint](/docs/plugins/endpoints/) it finds is registered automatically. The folder layout is just a convention for readability:

```
plugins/
└── myplugin/
    ├── plugin.json      # metadata (optional but recommended)
    ├── agents/          # your agents
    ├── directives/      # reusable middleware
    └── endpoints.py     # custom HTTP routes
```

## `plugin.json`

Optional, but recommended: it names your plugin in the admin panel and declares compatibility.

```json
{
    "name": "My Plugin",
    "version": "1.0.0",
    "description": "Short description of my plugin",
    "min_cat_version": "2.0.0"
}
```

| Field | Purpose |
|-------|---------|
| `name` | Display name in the admin panel. |
| `version` | Your plugin's version. |
| `description` | One-line summary shown next to the name. |
| `min_cat_version` | Minimum Cat version your plugin needs. |

If your plugin needs extra Python packages, add a `requirements.txt`, see [Dependencies](/docs/plugins/dependencies/).

## One import surface: `cat`

Everything you need comes from a single front door. You import *names*, and each resolves against the configured installation when you call it:

```python
from cat import Agent, tool, hook, endpoint, Directive, user, store, config, llm, log
```

There is no `cat` instance to thread around, no deeply nested objects. You reach the caller with `user`, the LLM with `llm(...)`, persistent storage with `store`, and so on.

## What goes in a plugin

A plugin extends the Cat through a handful of building blocks, each with its own page. See [Main concepts](/docs/plugins/concepts/) for the map, then dive into [Agents](/docs/plugins/agents/), [Tools](/docs/plugins/tools/), [Directives](/docs/plugins/directives/), [Hooks](/docs/plugins/hooks/) and [Endpoints](/docs/plugins/endpoints/).
