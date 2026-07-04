---
title: "User Management"
---

There is no user database, no registration form, no "user types" in the Cat. A **user** is just an identity, a small object with an `id`, a `name` and a list of [`roles`], produced by the **auth handler** from the credential on a request. Whoever authenticates a request becomes the `user` for that request.

Managing users, then, is really managing the auth handler: decide how a credential becomes a `User`, and you have decided who your users are and what they can do.

[`roles`]: /docs/production/auth/authorization/

## The default handler

Out of the box, one handler is active and it is deliberately minimal:

- the master key (`API_KEY`) maps to a single, all-powerful **admin** user;
- any JWT the Cat itself signed (with `JWT_SECRET`) is trusted, and the user is rebuilt from the token's claims.

That is enough to develop and to run machine-to-machine, but it defines users *its own way*: one admin behind a shared key, plus whatever a [login flow](/docs/production/auth/authentication/#jwt) mints. As soon as you want real, per-person identities, you replace it.

## Replacing the default

Registering **any** auth handler switches the default off. The moment a plugin ships an `Auth` service, the built-in `DefaultAuth` is not registered at all, your handler is the only one deciding identities. Auth becomes totally yours.

An `Auth` subclass inherits the base's verification (master key + core-signed JWTs), so unless you override those methods they keep working. To make auth *fully* custom, e.g. drop the shared master key in favour of per-user keys, override the relevant method and return your own `User`.

Drop the class anywhere in a plugin; being a service, it is picked up automatically.

### Example: an API key per user

Override `authorize_user_from_key` to resolve each key to a distinct user with its own roles. Registering this **deactivates the default**, so the shared `meow` master key stops working, only the keys below authenticate:

```python
# plugins/my_auth/auth.py
from uuid import uuid5, NAMESPACE_DNS

from cat import User
from cat.base import Auth

# in real life, look these up in your database
KEYS = {
    "sk-alice": {"name": "alice", "roles": ["user"]},
    "sk-bob":   {"name": "bob",   "roles": ["editor"]},
}


class ApiKeyAuth(Auth):
    slug = "api_keys"
    name = "Per-user API keys"

    async def authorize_user_from_key(self, api_key: str) -> User | None:
        record = KEYS.get(api_key)
        if record is None:
            return None  # unknown key → 403
        return User(
            id=uuid5(NAMESPACE_DNS, record["name"]),
            name=record["name"],
            roles=record["roles"],
        )
```

Now `Authorization: Bearer sk-bob` logs in as `bob` with the `editor` role. The inherited JWT path still works; override `authorize_user_from_jwt` to return `None` too if you want keys to be the *only* way in.

### Example: Keycloak (or any external IdP)

When identities live in Keycloak, let it own the users and just map its tokens. Keycloak issues JWTs, so override `authorize_user_from_jwt`: verify the token against Keycloak and translate its claims into a `User`.

```python
# plugins/keycloak_auth/auth.py
import httpx

from cat import User
from cat.base import Auth

REALM = "https://id.mycompany.com/realms/cat"


class KeycloakAuth(Auth):
    slug = "keycloak"
    name = "Keycloak"

    async def authorize_user_from_jwt(self, token: str) -> User | None:
        # ask Keycloak who this token belongs to (validates it too)
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"{REALM}/protocol/openid-connect/userinfo",
                headers={"Authorization": f"Bearer {token}"},
            )
        if resp.status_code != 200:
            return None

        info = resp.json()
        return User(
            id=info["sub"],  # Keycloak's stable user id (a UUID)
            name=info.get("preferred_username", ""),
            roles=info.get("realm_access", {}).get("roles", []),
        )
```

Your frontend obtains the token from Keycloak and sends it as usual in the `Authorization` header. To add a server-side "Login with Keycloak" button that mints a session cookie, implement the OAuth login flow instead, see [Custom Auth](/docs/production/auth/custom-auth/) and the reference `simple_oauth` plugin.

## Per-user data

Each user has an isolated key-value store, so a plugin can keep state per person without a database of its own. This is how an [Agent](/docs/plugins/agents/) remembers things for the person it is talking to. See [Persistence](/docs/plugins/persistence/) for the `user` and `store` APIs.
