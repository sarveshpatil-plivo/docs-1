---
title: "Custom Auth Handler"
---

Want to plug in your own users and login flow? Subclass `Auth`. Out of the box the base class is already a complete verifier: it trusts any core-signed JWT and accepts the master API key. You only add the parts you need, then ship it inside a plugin.

## The `Auth` base

Drop an `Auth` subclass anywhere in a plugin. Being a service, it is picked up automatically once the plugin is active.

```python
# plugins/my_auth/auth.py
from uuid import uuid5, NAMESPACE_DNS
from urllib.parse import urljoin
from typing import Dict

from cat import config, User
from cat.base import Auth


class MyOAuth(Auth):
    slug = "myprovider"
    name = "My Provider"
    description = "Login against my identity provider."

    async def get_provider_login_url(self, redirect_uri: str) -> str:
        # where to send the browser to start login
        return urljoin(config.URL, f"/auth/internal-idp?redirect_uri={redirect_uri}")

    async def authorize_user_from_oauth_code(
        self, redirect_uri: str, query_params: Dict
    ) -> User | None:
        # exchange the provider's `code` for a User
        if query_params.get("code"):
            return User(id=uuid5(NAMESPACE_DNS, "alice"), name="alice", roles=["user"])
        return None
```

Implementing these two methods is enough to get a "login with My Provider" button and a full OAuth dance. Core never changes: your flow mints a JWT (`self.jwt.encode(user)`), and from then on the Cat just verifies it.

## What you can override

The base class exposes small, focused hooks. Override only what your provider needs:

| Method | Purpose |
|--------|---------|
| `get_provider_login_url(redirect_uri)` | Start a login flow (return the provider's authorize URL). |
| `authorize_user_from_oauth_code(redirect_uri, params)` | Finish the flow: map the provider's `code` to a `User`. |
| `authorize_user_from_jwt(token)` | Verify a token. Override only for non-core JWTs (e.g. a third-party JWKS). |
| `authorize_user_from_key(api_key)` | Key policy. Override for per-user keys looked up in a database. |
| `get_credential(request)` | Where the credential is read from (default: `Authorization` header, then cookie). |
| `get_admin()` | The identity the master key maps to. |

Every method returns a [`User`](/docs/production/auth/user-management/) (`id`, `name`, `roles`) or `None`.

## Reference

The [`simple_oauth`](https://github.com/cheshire-cat-ai/core/tree/main/plugins/simple_oauth) plugin shipped with core is the reference: a complete OAuth login against a built-in mock identity provider. Clone it, point the two methods at your real provider, and you are in production.
