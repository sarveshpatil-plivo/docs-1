---
title: "How to write a plugin"
---

A plugin is a folder of Python files. Drop it in the `plugins/` directory and the Cat discovers everything inside it at startup, no registration, no wiring.

```
plugins/
└── myplugin/
    ├── plugin.json      # metadata (name, version, description)
    ├── agents/          # your agents
    ├── directives/      # reusable middleware
    └── endpoints.py     # custom HTTP routes
```

The folder layout is a convention for readability, the Cat simply imports every `.py` file in the plugin (skipping `tests/`). A `plugin.json` is optional but recommended, it names your plugin in the admin panel:

```json
{
    "name": "My Plugin",
    "version": "1.0.0",
    "description": "Short description of my plugin",
    "min_cat_version": "2.0.0"
}
```

## One import surface: `cat`

Everything you need comes from a single front door. You import *names*, and each resolves against the configured installation when you call it:

```python
from cat import Agent, tool, hook, endpoint, Directive, user, store, config, llm, log
```

There is no `cat` instance to thread around, no deeply nested objects. You reach the caller with `user`, the LLM with `llm(...)`, persistent storage with `store`, and so on.

## The building blocks

A plugin extends the Cat through a handful of primitives. Each has its own page:

- **[Agents](/docs/plugins/agents/)** — the things you run. An agent is a loop with a `system_prompt`, some tools, and some directives. Subclass `Agent`, give it a `slug`, and clients can talk to it.

- **[Tools](/docs/plugins/tools/)** — an agent's hands. A method decorated with `@tool` that the LLM can decide to call. Its docstring and type hints are the manual the LLM reads.

- **[Directives](/docs/plugins/directives/)** — reusable middleware over the agent loop (`start` / `step` / `finish`). RAG, memory and guardrails are all just directives. This is how you customize an agent's behaviour.

- **[Hooks](/docs/plugins/hooks/)** — data-only reactions to global lifecycle events (a message coming in, the app booting). Use a hook when you don't need the agent; use a directive when you do.

- **[Custom Endpoints](/docs/plugins/endpoints/)** — extend the REST API with `@endpoint.get/post/...`, guarded by a single `role=` kwarg.

## A minimal plugin

The smallest useful plugin is one agent:

```python
# plugins/myplugin/agents/poet.py
from cat import Agent


class Poet(Agent):
    slug = "poet"
    name = "Poet"
    description = "Answers every message in rhyme."
    system_prompt = "Whatever the user says, you answer in rhyme."
```

Talk to it by naming its `slug`:

```bash
curl -X POST http://localhost:1865/agents/poet/message \
  -H "Authorization: meow" \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{ "role": "user", "content": [{ "type": "text", "text": "hello" }] }] }'
```

From here, give the agent [tools](/docs/plugins/tools/), attach [directives](/docs/plugins/directives/), or expose your own [endpoints](/docs/plugins/endpoints/).
