---
title: "Writing the first Tool"
---

In the Cheshire Cat you talk to an **Agent**: a small class with a personality (its `system_prompt`) and, optionally, some **tools**. A tool is a method the LLM can decide to call to actually *do* something, look up a price, hit a database, send an email.

Let's build a poetic sock seller: an agent that answers in rhyme and can look up sock prices with a tool.

## Creating the Agent and its Tool

Open `poetic_sock_seller.py` and paste this in:

```python
from cat import Agent, tool


class PoeticSockSeller(Agent):
    slug = "sock_seller"
    name = "Poetic Sock Seller"
    description = "A poetic vendor of socks."

    system_prompt = (
        "You are Marvin, a poetic vendor of socks. "
        "You are an expert in socks and you reply with exactly one rhyme. "
        "Use your tools to look up prices, never invent them."
    )

    @tool
    def socks_prices(self, color: str) -> str:
        """How much do socks cost? Input is the sock color."""
        prices = {"black": 5, "white": 10, "pink": 50}
        if color not in prices:
            return f"No {color} socks"
        return f"{prices[color]} €"
```

The Cat detects the change, reloads, and registers your agent by its `slug`.

## Testing the Tool

Send a message to your agent (naming it by its `slug`) and ask for a price:

```bash
curl -X POST http://localhost:1865/agents/sock_seller/message \
  -H "Authorization: meow" \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{ "role": "user", "content": [{ "type": "text", "text": "how much for pink socks?" }] }] }'
```

The agent calls `socks_prices` with `color="pink"`, gets back `50 €`, and answers in rhyme.

## Explaining the code step by step

```python
from cat import Agent, tool
```

Everything you need comes from the `cat` front door: here, the `Agent` base class and the `@tool` decorator.

```python
class PoeticSockSeller(Agent):
    slug = "sock_seller"
    system_prompt = "You are Marvin, a poetic vendor of socks..."
```

Subclassing `Agent` and giving it a `slug` is all it takes for the Cat to pick it up. The `system_prompt` is the agent's whole personality and instructions.

```python
    @tool
    def socks_prices(self, color: str) -> str:
        """How much do socks cost? Input is the sock color."""
```

The `@tool` decorator turns a method into something the LLM can call. Three parts do the work:

- **the method name** becomes the tool's name;
- **the docstring** tells the LLM *when* to use the tool and what the input means;
- **the type hints** (`color: str`) define the arguments, already parsed for you, no manual string handling.

Inside the body you can connect to any service, database, file or device. The only limit is your imagination &#128512;.

## WatchFiles detected changes... reloading

When you edit a plugin's source, the Cat automatically restarts. Change the code and watch the results.

#### More Info

Tools reference: [Plugins → Tools](/docs/plugins/tools/)
Agents reference: [Plugins → Write an Agent](/docs/plugins/agents/)
