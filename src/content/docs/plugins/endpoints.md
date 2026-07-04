---
title: "Custom Endpoints"
---

Custom endpoints let you extend the REST API offered by the Cat. Every endpoint is documented live on your installation at [`localhost:1865/docs`](http://localhost:1865/docs), with a playground to try it out.

## Adding an endpoint

Import `endpoint` from the front door and decorate a function with the HTTP verb you want:

```python
from cat import endpoint


@endpoint.get("/hello")
async def hello():
    return "meooow"
```

Open [`localhost:1865/hello`](http://localhost:1865/hello) and you'll see `meooow`. The endpoint also appears in `/docs`. The path you give is the path it serves, name it however you like.

## Authentication with `role`

By default an endpoint is open to the web. To require authentication, add a `role`, that single kwarg wires in the same auth core uses (it returns `403` when the caller is unauthenticated or lacks the role):

```python
from cat import endpoint

@endpoint.get("/public")                         # open, no auth
async def public():
    return "anyone can read this"

@endpoint.get("/me", role="authenticated")       # any logged-in user
async def me():
    ...

@endpoint.get("/admin", role="admin")            # must have the "admin" role
async def admin():
    ...

@endpoint.get("/staff", role=["admin", "editor"])  # any of these (OR)
async def staff():
    ...
```

`role` semantics:

- **`None`** (default) — open, no auth required.
- **`"authenticated"`** — any logged-in user, regardless of roles.
- **`"admin"`** — must have that role.
- **`["a", "b"]`** — must have any of these (OR).

You never touch FastAPI's `Depends` or any auth helper for this, `role=` is the whole story.

## Reading the user and config

Inside an endpoint you read the caller with the ambient `user` handle, and installation settings with `config`. Nothing is passed in as an argument:

```python
from cat import endpoint, user, llm


@endpoint.get("/joke", role="authenticated")
async def joke():
    # invoke the LLM directly
    answer = await llm("Tell me a short joke.")
    return {"joke": answer.text, "user": user.name}
```

## Input and output models

For anything beyond a toy, describe input and output with [pydantic](https://docs.pydantic.dev/latest/) models. You get validation and automatic documentation for free:

```python
from pydantic import BaseModel
from cat import endpoint, llm


class JokeInput(BaseModel):
    topic: str
    language: str


class JokeOutput(BaseModel):
    joke: str


@endpoint.post("/topic-joke", role="authenticated")
async def topic_joke(data: JokeInput) -> JokeOutput:
    answer = await llm(
        f"Tell me a short joke about {data.topic}, in {data.language}."
    )
    return JokeOutput(joke=answer.text)
```

Call it with a `POST` to `/topic-joke`, or use the playground under `/docs`. Request body:

```json
{ "topic": "mozzarella", "language": "italian" }
```

## Path and tags

You can pick the verb (`get`, `post`, `put`, `patch`, `delete`), add a `prefix`, and group the endpoint in `/docs` with `tags`:

```python
@endpoint.get("/joke", prefix="/random", tags=["Useful Stuff"])
async def random_joke():
    return 42
```

This serves at `http://localhost:1865/random/joke` and is documented under its own `Useful Stuff` group.

## Full FastAPI power

Each endpoint is a real [FastAPI](https://fastapi.tiangolo.com/) route, so any FastAPI primitive works, path/query params, `UploadFile`, `Request`, response models, and so on:

```python
from fastapi import Request
from cat import endpoint


@endpoint.get("/headers")
async def send_me_back_the_headers(request: Request):
    return dict(request.headers)
```
