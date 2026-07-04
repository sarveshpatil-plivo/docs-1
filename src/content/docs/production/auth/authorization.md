---
title: "Authorization"
---

Once a request is [authenticated](/docs/production/auth/authentication/), the Cat knows **who** the user is and **which roles** they hold. Authorization is deciding what those roles are allowed to do.

Authorization is **roles, and nothing else**. There are no resources, no granular per-resource permissions (the old v1 `CONVERSATION_WRITE`, `MEMORY_READ`, `/auth/available-permissions` model is gone). A user carries a flat list of role strings, and an endpoint asks for a role. That is the whole model.

## Roles

A user carries a flat list of roles (e.g. `["editor", "user"]`). One role is special: **`admin`** passes every role check. The master API key maps to an admin user; JWTs carry whatever roles your auth handler put in them.

You can read the current user, roles included, from the `/me` endpoint or, inside a plugin, from the ambient `user`:

```python
from cat import user

user.name          # display name
user.roles         # ["editor", ...]
user.has_role("editor")      # True if editor OR admin
user.is_admin()              # True if admin
```

## Gating endpoints

Custom endpoints are open by default. Pass `role=` to require authorization:

```python
from cat import endpoint, user

@endpoint.get("/public")                       # open, no auth
async def public(): ...

@endpoint.get("/inbox", role="authenticated")  # any logged-in user
async def inbox(): ...

@endpoint.get("/admin", role="admin")          # must have the admin role
async def admin(): ...

@endpoint.post("/edit", role=["editor", "author"])  # any of these (OR)
async def edit(): ...
```

The four `role=` forms:

| `role=` | Meaning |
|---------|---------|
| omitted | Open, no authentication required |
| `"authenticated"` | Any logged-in user, no specific role |
| `"admin"` | Must hold that role (`admin` always passes) |
| `["a", "b"]` | Must hold **any** of these roles |

A request that fails the check gets a `403`.
