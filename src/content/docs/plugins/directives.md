---
title: "Directives"
---

A Directive is reusable middleware over the agent loop. It receives the live [Agent](/docs/plugins/agents/) and edits it in place, at three moments of the agent's life:

```
start(agent)    once, before the loop       -> setup: filter tools, set the base prompt
step(agent)     every turn, before the LLM  -> per-turn context: RAG, guardrails, the clock
finish(agent)   once, after the loop        -> teardown: save memory, log, audit
```

> An agent is a loop. Directives hook the loop. Tools are its hands.

Most things you might expect to be built-in features, RAG, memory, guardrails, are not special: they are just directives. This is the main way to customize an agent's behaviour in v2, and it replaces the old prompt and memory hooks.

## Writing a directive

Subclass `Directive`, give it a `slug`, and implement whichever of the three methods you need:

```python
from datetime import datetime

from cat import Directive, Agent


class ClockDirective(Directive):
    slug = "clock"
    name = "Clock"
    description = "Injects the current date and time into the prompt each turn."

    async def step(self, agent: Agent) -> None:
        now = datetime.now().strftime("%A %d %B %Y, %H:%M")
        agent.system_prompt += f"\n\nThe current date and time is: {now}."
```

The Cat discovers the directive at startup and registers it by its `slug`.

## Attaching a directive to an agent

An agent attaches a directive by listing its slug in `directives`. The agent and the directive live in different files and never import each other, the Cat resolves the slug through the registry at run time:

```python
from cat import Agent


class TimeAwareAgent(Agent):
    slug = "time_aware"
    name = "Time-Aware Agent"
    description = "A helpful assistant that always knows the current date and time."

    directives = ["clock"]

    system_prompt = "You are a helpful assistant."
```

You can also pass a ready-made instance when you want to configure it inline: `directives = [ClockDirective()]`.

## The three lifecycle methods

The agent loop resets the system prompt before each `step()`, so anything you append in `step()` is fresh every turn and never accumulates.

### `start(agent)`

Runs once before the loop begins. Use it for permanent setup: filter or add tools, set the base prompt.

```python
async def start(self, agent: Agent) -> None:
    # keep only read-only tools on this agent
    agent.tools = [t for t in agent.tools if t.name.startswith("get_")]
```

### `step(agent)`

Runs every turn, right before the LLM is called. Use it for per-turn context: retrieval (RAG), guardrails, live data like the clock above.

```python
async def step(self, agent: Agent) -> None:
    query = agent.task.messages[-1].content.text
    memories = await recall(query)          # your retrieval
    agent.system_prompt += "\n\n" + memories
```

### `finish(agent)`

Runs once after the loop ends. Use it for post-processing: save memory, log, audit.

```python
async def finish(self, agent: Agent) -> None:
    log.info(f"Agent {agent.slug} finished for user {user.name}")
```

## Directive or hook?

The one rule:

- Need the agent? Write a **directive** (agent-scoped, opt-in, stateful).
- Reacting to a global pipeline event, with no agent involved? Write a [hook](/docs/plugins/hooks/) (data-only).

A directive is the only primitive that receives the live agent. Reaching the agent's prompt, tools or result is always a directive's job.
