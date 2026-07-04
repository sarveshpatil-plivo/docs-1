---
title: "Testing"
---

The Cat ships a shared test harness as a `pytest` plugin. Install `cheshire-cat-ai`, drop test files under your plugin, run `pytest` and the fixtures are just there. No configuration, no `conftest.py` to copy around.

Every test runs in a throwaway project folder (its own `data/`, `plugins/` and SQLite database), so your real installation is never read or mutated.

## Running tests

From your project folder:

```bash
# the whole suite
uv run pytest

# a single file
uv run pytest plugins/my_plugin/tests/test_my_plugin.py

# a single test function
uv run pytest plugins/my_plugin/tests/test_my_plugin.py::test_the_thing
```

## Testing a plugin

Put your tests under `plugins/<name>/tests/`. The harness sees where the test lives and boots **core plus that plugin**, automatically. You never name your own plugin.

```python
# plugins/my_plugin/tests/test_my_plugin.py

def test_my_endpoint(client):
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"hello": "world"}
```

### Fixtures

The harness gives you a ready FastAPI test client:

| Fixture | What it is |
|---------|-----------|
| `client` | Sync `TestClient`, authenticated as **admin** (the master key is sent on every request). |
| `anon_client` | Sync client with **no credentials**, for testing public routes and auth gating. Pass `headers={"Authorization": f"Bearer {token}"}` to authenticate per request. |
| `async_client` | Async client, authenticated as admin. Use it when your code path needs the app lifespan (async fixtures, background work). |
| `app` | The bare FastAPI app, if you want to build your own client. |

### Booting extra plugins

To boot sibling plugins on top of the one under test, use the `with_plugins` marker:

```python
import pytest

@pytest.mark.with_plugins("uploads")
def test_with_uploads(client):
    # core + my_plugin (auto-included) + uploads
    files = {"file": ("hello.txt", b"hello cat", "text/plain")}
    assert client.post("/uploads", files=files).status_code == 200
```

A plain core test (one living under the top-level `tests/` folder) boots core with **zero** plugins; add `with_plugins(...)` there to opt specific ones in.
