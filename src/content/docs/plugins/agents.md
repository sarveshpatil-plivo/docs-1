---
title: "Write an Agent"
---

You define an agent by subclassing `Agent` inside a plugin. The Cat discovers it at startup and registers it by its `slug`, the id clients use to talk to it. No other wiring is necessary.

An agent is a **loop**: it reads the conversation, optionally calls tools, and answers. Its behaviour comes from three things, a `system_prompt` (its instructions), its [tools](/docs/plugins/tools/) (what it can *do*), and its [directives](/docs/plugins/directives/) (middleware that steers the loop).

## The smallest agent

The smallest possible agent is just a name and a system prompt. No tools, no directives:

```python
from cat import Agent


class Poet(Agent):
    # `slug` is the id clients use to address this agent. Keep it short.
    slug = "poet"
    # `name` and `description` show up in agent listings.
    name = "Poet"
    description = "Answers every message in rhyme."

    # Main instructions.
    system_prompt = "Whatever the user says, you answer in rhyme."
```

Drop this in `plugins/my_plugin/my_agent.py`, and the Cat picks it up automatically.

## Adding tools

A tool is a method decorated with `@tool`. Its name, docstring and type hints become the schema the LLM sees, so it can decide when to call it:

```python
from cat import Agent, tool


class SockSeller(Agent):
    slug = "sock_seller"
    name = "Sock Seller"
    description = "Sells socks and knows their prices."

    system_prompt = "You sell socks. Use your tools to answer questions about price."

    @tool
    def price(self, color: str) -> str:
        """Price of a pair of socks. Input is the sock color."""
        prices = {"black": 5, "white": 8, "pink": 12}
        return f"{prices[color]} €" if color in prices else f"No {color} socks"
```

Tools are **agent-scoped**: this agent sees exactly the tools defined on it, there is no global tool pool like in v1. To share tools across agents put them in a mixin and inherit it; to add them programmatically, use a directive. Tools can be `async`, do real work, and read per-user state through the ambient `user`. See [Tools](/docs/plugins/tools/) for the full story, and [Persistence](/docs/plugins/persistence/) for storing state.

## Attaching directives

Anything that needs to touch the agent itself per turn, RAG, guardrails, memory, live context, is a [directive](/docs/plugins/directives/). Attach them by slug:

```python
class TimeAwareAgent(Agent):
    slug = "time_aware"
    name = "Time-Aware Agent"
    description = "Always knows the current date and time."

    directives = ["clock"]
    system_prompt = "You are a helpful assistant."
```

## Talking to an agent

Send a message and name the agent by its `slug`, `POST /agents/{slug}/message`. See [Message the Cat](/docs/quickstart/message/) for the full request shape and Python / JavaScript clients.

The built-in agent is `default`. Any agent in any installed plugin can be addressed by its `slug`. You can browse every registered agent, and its argument schema, at [localhost:1865/agents](http://localhost:1865/agents), or feed [localhost:1865/openapi.json](http://localhost:1865/openapi.json) to your own coding agent.
