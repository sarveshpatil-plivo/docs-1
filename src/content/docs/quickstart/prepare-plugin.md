---
title: "Plugin Tutorial"
---

A **plugin** is how you extend the Cat: a folder of Python files it discovers at startup. A plugin can hold [Agents](/docs/plugins/agents/), [Tools](/docs/plugins/tools/), [Directives](/docs/plugins/directives/), [Hooks](/docs/plugins/hooks/) and [Endpoints](/docs/plugins/endpoints/). In this tutorial we build a small but complete one: an agent that sells socks and can look up their price and stock.

## Create the plugin folder

Add a subfolder under `plugins/`. Two files are enough:

```
my-cat
└── plugins
    └── sock_seller
        ├── plugin.json
        └── sock_seller.py
```

`plugin.json` names the plugin in the Admin Portal. It is optional but recommended:

```json
{
    "name": "Sock Seller",
    "description": "A poetic vendor of socks."
}
```

## Write the agent

An agent is a Python class with a `slug`, a `system_prompt`, and some tools. Put this in `sock_seller.py`:

```python
from cat import Agent, tool


class SockSeller(Agent):
    slug = "sock_seller"
    name = "Sock Seller"
    description = "A poetic vendor of socks."

    system_prompt = (
        "You are Marvin, a poetic vendor of socks. "
        "You answer in exactly one rhyme. "
        "Use your tools to check prices and stock, never invent them."
    )

    @tool
    def price(self, color: str) -> str:
        """Price of a pair of socks. Input is the sock color."""
        prices = {"black": 5, "white": 8, "pink": 12}
        return f"{prices[color]} €" if color in prices else f"No {color} socks"

    @tool
    def stock(self, color: str) -> str:
        """How many pairs are in stock. Input is the sock color."""
        counts = {"black": 40, "white": 15, "pink": 0}
        return f"{counts.get(color, 0)} pairs"
```

Save the file. The Cat detects the change, reloads, and registers the agent by its `slug`.

Notice how little a tool needs: the **method name** becomes the tool name, the **docstring** tells the LLM when to reach for it, and the **type hints** define its arguments, already parsed for you. The LLM decides *when* to call `price` or `stock` and with *what* color. See [Tools](/docs/plugins/tools/) for the full story.

## Activate it

Open the **Plugins** tab of the Admin Portal and switch your plugin on:

![Activate the plugin](../assets/img/quickstart/prepare-plugin/activate-plugins.png)

## Talk to it

Message the agent by its `slug`:

```bash
curl -X POST http://localhost:1865/agents/sock_seller/message \
  -H "Authorization: meow" \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{ "role": "user", "content": [{ "type": "text", "text": "how much for pink socks, and do you have any?" }] }] }'
```

The agent calls `price("pink")` and `stock("pink")`, then answers in rhyme. For the full request shape and Python / JavaScript clients, see [Message the Cat](/docs/quickstart/message/).

## Where to go next

That is a real, working plugin. To make it do more, reach for the other constructs, each covered in the [Plugins](/docs/plugins/plugins/) section:

- give it more [Tools](/docs/plugins/tools/), to hit a database, an API, anything
- steer the agent loop with [Directives](/docs/plugins/directives/) (RAG, guardrails, memory)
- react to lifecycle events with [Hooks](/docs/plugins/hooks/)
- expose your own [Endpoints](/docs/plugins/endpoints/)
- remember state between messages with [Persistence](/docs/plugins/persistence/)

See [Main concepts](/docs/plugins/concepts/) for the map of everything a plugin can do. When you are ready to share it, head to the [Registry](/docs/plugins/plugins-registry/plugin-from-template/).

## Join the community

Building something with the Cat? Come say hi on [GitHub](https://github.com/cheshire-cat-ai/core/discussions) to connect with other developers, get help from the contributors, and share what you have made.
