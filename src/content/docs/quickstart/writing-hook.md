---
title: "Writing the first Hook"
---

A **Hook** lets you react to an event in the Cat's lifecycle and, if you want, change the data flowing through it. Where an agent's personality lives in its `system_prompt`, a hook sits *outside* the agent and watches the pipeline: a message coming in, a message going out, the app booting.

We'll use the `before_agent_run` hook, which fires every time a message reaches an agent, to slip a shop-wide promotion into the conversation. Our sock seller will then weave it into its rhyme.

## Adding the Hook

Append this to `poetic_sock_seller.py`:

```python
from cat import hook
from cat.types import Message, TextContent


@hook
def before_agent_run(task):
    promo = "Today only: every pink item is half price."
    task.messages.append(
        Message(role="user", content=[TextContent(text=promo)])
    )
```

## Testing the Hook

Ask about pink socks again:

```bash
curl -X POST http://localhost:1865/agents/sock_seller/message \
  -H "Authorization: meow" \
  -H "Content-Type: application/json" \
  -d '{ "messages": [{ "role": "user", "content": [{ "type": "text", "text": "how much for pink socks?" }] }] }'
```

The agent now knows about the promotion and mentions it in its reply, even though the user never asked.

## Explaining the code step by step

```python
from cat import hook
```

The `@hook` decorator, imported from the `cat` front door, attaches a function to a lifecycle event. The function's **name** is what wires it to an event, `before_agent_run`.

```python
@hook
def before_agent_run(task):
    ...
    task.messages.append(...)
```

A hook receives exactly one argument: the value flowing through that event. For `before_agent_run` it's the `Task`, the incoming conversation. We mutate it in place, and the change carries on to the agent. A hook is **data-only**: it never receives the agent itself. When you need to touch the agent (its prompt, its tools), that's a [Directive](/docs/plugins/directives/)'s job.

There are five lifecycle hooks in total (`before_cat_bootstrap`, `after_cat_bootstrap`, `after_plugins_reload`, `before_agent_run`, `after_agent_run`), and plugins can define their own.

#### More Info

Hooks reference: [Plugins → Hooks](/docs/plugins/hooks/)

To customize the agent itself, per turn, see [Plugins → Directives](/docs/plugins/directives/).
