---
title: "Plivo Plugin"
---

The Plivo plugin gives the Cat a voice and a phone number. It wires [Plivo](https://www.plivo.com/) into the Cat as two [tools](/docs/plugins/tools/) the LLM can call, plus one [endpoint](/docs/plugins/endpoints/) Plivo calls back into when a phone call is answered.

- **`send_sms`** — send an SMS message.
- **`make_call`** — place an outbound phone call.
- **`POST /plivo/answer`** — the answer webhook Plivo fetches to get the call-flow XML for an inbound or outbound call.

## Configuration

The plugin reads your Plivo account from three environment variables:

| Variable | Description |
| :--- | :--- |
| `PLIVO_AUTH_ID` | Your Plivo Auth ID, from the [Plivo console](https://cx.plivo.com/) dashboard. |
| `PLIVO_AUTH_TOKEN` | Your Plivo Auth Token, from the [Plivo console](https://cx.plivo.com/) dashboard. |
| `PLIVO_SRC` | The sender: a Plivo phone number (or, for SMS, a short code or approved alphanumeric sender ID). |

Set them alongside the other Cat environment variables before starting the container.

## Sending an SMS

`send_sms` is a `@tool`, so the LLM calls it on its own when the conversation calls for a text message. It takes the destination number in E.164 format and the message text:

```python
import os

import httpx

from cat import tool


PLIVO_API_BASE = "https://api.plivo.com/v1/Account"


@tool
async def send_sms(dst: str, text: str) -> str:
    """Send an SMS through Plivo. Input is the destination number in E.164 format and the message text."""

    auth_id = os.getenv("PLIVO_AUTH_ID")
    auth_token = os.getenv("PLIVO_AUTH_TOKEN")
    src = os.getenv("PLIVO_SRC")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PLIVO_API_BASE}/{auth_id}/Message/",
            auth=(auth_id, auth_token),
            json={"src": src, "dst": dst, "text": text},
        )

    if response.status_code == 202:
        return f"SMS queued for {dst}."
    return f"Failed to send SMS to {dst}: {response.status_code} {response.text}"
```

Plivo accepts the request and queues the message; the tool reports back that the SMS has been queued so the agent can confirm to the user.

## Placing a call

`make_call` places an outbound call. It takes the destination number and the `answer_url` Plivo fetches when the call connects:

```python
@tool
async def make_call(to: str, answer_url: str) -> str:
    """Place an outbound Plivo call. Input is the destination number in E.164 format and the answer_url Plivo fetches for call-flow XML."""

    auth_id = os.getenv("PLIVO_AUTH_ID")
    auth_token = os.getenv("PLIVO_AUTH_TOKEN")
    src = os.getenv("PLIVO_SRC")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PLIVO_API_BASE}/{auth_id}/Call/",
            auth=(auth_id, auth_token),
            json={"from": src, "to": to, "answer_url": answer_url},
        )

    if response.status_code == 201:
        return f"Call fired to {to}."
    return f"Failed to call {to}: {response.status_code} {response.text}"
```

Plivo creates the call and returns immediately; the tool confirms the call was fired. When the callee answers, Plivo fetches the `answer_url` to find out what the call should do.

## The answer webhook

The plugin exposes an `@endpoint` that returns the call-flow XML Plivo asks for on answer. Point your Plivo application's Answer URL (or the `answer_url` you pass to `make_call`) at this route:

```python
from fastapi.responses import Response

from cat import endpoint


ANSWER_XML = (
    "<Response><Speak>Hello from the Cheshire Cat, powered by Plivo.</Speak></Response>"
)


@endpoint.post("/plivo/answer", tags=["Plivo"])
async def plivo_answer() -> Response:
    return Response(content=ANSWER_XML, media_type="application/xml")
```

Like every custom endpoint, it appears in the live API docs at [`localhost:1865/docs`](http://localhost:1865/docs) under the **Plivo** tag. The XML here simply speaks a greeting; edit `ANSWER_XML` to build whatever call flow you need. See the [Plivo documentation](https://www.plivo.com/docs/) for the full XML reference.
