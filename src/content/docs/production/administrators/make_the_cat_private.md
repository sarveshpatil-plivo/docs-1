---
title: "Make the Cat Private"
---

Auth is always on. A fresh installation already requires a credential: out of the box the master key is the well known dev value `meow`, so the project works immediately but is never silently wide open.

Going to production is just changing those two dev defaults in your [`config.py`](/docs/production/administrators/env-variables/):

```python
# config.py

# master API key (machine-to-machine)
API_KEY = "a-very-long-and-alphanumeric-secret"

# secret used to sign and validate JWTs
JWT_SECRET = "yet-another-very-long-and-alphanumeric-secret"
```

That is enough to lock the installation. A few more steps:

- Change the password of any user you created through the Admin panel.
- Put the Cat behind a reverse proxy with TLS (see [Authentication](/docs/production/auth/authentication/#use-secure-protocols)).

Read the [Auth](/docs/production/auth/authentication/) section for the full picture.
