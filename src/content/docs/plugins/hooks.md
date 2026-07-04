---
title: "Hooks"
---

A Hook lets you react to a global event in the Cat's lifecycle and, optionally, transform the value flowing through it. Unlike a [directive](/docs/plugins/directives/), a hook is **data-only**: it never receives the agent. If you need the agent, write a directive instead.

## Defining a hook

Decorate a function with `@hook`, named after the event you want to handle. The function takes exactly one argument, the piped value:

```python
from cat import hook


@hook
def before_agent_run(task):
    # inspect or mutate the incoming task in place
    task.messages.append(...)
```

Mutate the value in place and return nothing, the change survives to the next handler and to the caller. Return a value only to replace the object wholesale.

Hooks run priority-first with error isolation. Set a priority (higher runs first) when order matters:

```python
@hook(priority=2)
def before_agent_run(task): ...
```

## The core hooks

There are five lifecycle hooks:

| Hook                   | Value        | Fires                                          |
| ---------------------- | ------------ | ---------------------------------------------- |
| `before_cat_bootstrap` | `None`       | app starting, after plugin discovery           |
| `after_cat_bootstrap`  | `None`       | app ready                                      |
| `after_plugins_reload` | `None`       | plugins, endpoints and services reindexed      |
| `before_agent_run`     | `Task`       | an agent is about to run (a message came in)   |
| `after_agent_run`      | `TaskResult` | an agent finished (a message is going out)     |

The two bootstrap/reload hooks are pure reactions (their value is `None`). `before_agent_run` and `after_agent_run` carry the request's `Task` / `TaskResult`, so you can inspect or adjust the conversation as it enters and leaves the agent.

## What you can reach from inside a hook

- The Cat runtime is always available.
- `from cat import user` resolves in the request hooks (`before_agent_run`, `after_agent_run`, and plugin request hooks). It raises in the bootstrap/reload hooks, there is no active request there.

```python
from cat import hook, user, log


@hook
def after_agent_run(result):
    log.info(f"answered {user.name}")
```

## Plugins can define their own hooks

Hooks are not limited to the core catalog. Any plugin can fire its own hook by any name, and other plugins can handle it, same single-value, data-only, mutate-in-place contract. For example the `uploads` plugin fires `after_file_upload(uploaded_file)` when a file arrives, so any plugin can react to uploads:

```python
@hook
def after_file_upload(uploaded_file):
    log.info(f"received {uploaded_file.name}")
```

To fire a hook from your own code:

```python
from cat import execute_hook

value = await execute_hook("after_file_upload", uploaded_file)
```
