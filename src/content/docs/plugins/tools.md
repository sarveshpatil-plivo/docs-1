---
title: "Tools"
---

A Tool is a method the LLM can decide to call. You write a normal Python method; the LLM chooses *when* to run it and *what* to pass in, based on its name, docstring and type hints.

Tools belong to an [Agent](/docs/plugins/agents/). There is no global tool pool: an agent sees exactly the tools defined on it (plus any MCP tools). This keeps each agent's abilities explicit and easy to reason about.

## Declaring a tool

A tool is a method on your `Agent` subclass decorated with `@tool`:

```python
from cat import Agent, tool


class SockSeller(Agent):
    slug = "sock_seller"
    name = "Sock Seller"
    description = "Sells socks and knows their prices."

    system_prompt = "You sell socks. Use your tools to answer questions about price."

    @tool
    def socks_prices(self, color: str) -> str:
        """How much do socks cost? Input is the sock color."""
        prices = {"black": 5, "white": 10, "pink": 50}
        if color not in prices:
            return f"No {color} socks"
        return f"{prices[color]} €"
```

When the user writes *"How much for pink socks?"*, the Cat sends the tool's schema to the LLM. The LLM decides to call `socks_prices` with `color="pink"`, the Cat runs the method, and the returned string goes back into the agentic loop so the agent can answer.

## What the LLM sees

The schema the LLM reads is built entirely from the method signature:

- **The method name** becomes the tool name.
- **The docstring** is the tool's manual: say *when* to use it and *what* the inputs mean. Write it for the LLM, not for other developers.
- **The type hints** define the arguments. Ask for an `int`, a `bool`, a `float` and you receive exactly that, already parsed and validated. No manual string parsing.

```python
@tool
def convert_currency(self, amount: float, currency: str) -> str:
    """Convert an amount in euros to another currency (USD, GBP or JPY)."""
    rates = {"USD": 1.07, "GBP": 0.86, "JPY": 150.13}
    if currency not in rates:
        return f"{currency} is not available"
    return f"{amount:.2f} EUR = {amount * rates[currency]:.2f} {currency}"
```

Because arguments are typed, the LLM is guided to fill each one correctly and you get real Python values in the body, no manual string parsing.

## Tools can be async and do real work

A tool is just a method, so it can be `async` and `await` a database, an HTTP call, anything. State is scoped to the caller through the ambient `user` handle: two people talking to the same agent never see each other's data, and you never pass a user id around.

```python
from cat import Agent, tool, user


class TodoAgent(Agent):
    slug = "todo"
    name = "Todo Agent"
    description = "Keeps a personal to-do list, saved per user."

    system_prompt = (
        "You are a to-do list assistant. Use your tools to read and change the "
        "user's list, then briefly confirm what you did."
    )

    @tool
    async def list_todos(self) -> str:
        """List all of the user's todos."""
        todos = await user.load("todos", [])
        return "\n".join(t["text"] for t in todos) or "The list is empty."

    @tool
    async def create_todo(self, text: str) -> str:
        """Add a new todo with the given text."""
        todos = await user.load("todos", [])
        todos.append({"text": text})
        await user.save("todos", todos)
        return f"Added: {text}"
```

Say *"add milk and eggs, then show my list"* and watch the loop work: the agent calls `create_todo` twice, then `list_todos`, then answers, each step a real tool call.

## Guardrails live in the tool body

A tool can reach the whole machine, so *you* decide what it may do. Validate the input first, then act or refuse. The guardrail is plain Python:

```python
@tool
async def run_query(self, sql: str) -> str:
    """Run a read-only SQL query and return the rows."""
    if not sql.strip().lower().startswith("select"):
        return "Only SELECT queries are allowed."
    ...
```

## Sharing tools across agents

Tools are agent-scoped by design. To reuse a tool:

- **Inheritance** — put shared tools on a base class or mixin and subclass it.
- **[Directives](/docs/plugins/directives/)** — to add tools cross-cuttingly to many agents (for example, every agent gets a `search` tool), a directive can attach them in its `start()`.

## Returning values

A tool usually returns a string, which the agent reads and reasons about. You can also return the result of a nested `llm(...)` call directly. Whatever you return becomes the tool's output in the loop.
