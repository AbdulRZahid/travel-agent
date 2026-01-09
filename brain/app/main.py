from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncIterator

from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI(title="Travel Agent Brain", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _sse_event(payload: dict[str, Any]) -> str:
    # SSE format: one event per "data:" line block separated by a blank line
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@app.post("/agent/stream")
async def agent_stream(body: dict[str, Any]) -> StreamingResponse:
    """Minimal SSE stream compatible with the spec.

    This is a placeholder implementation to validate the container, routing, and SSE wiring.
    """

    thread_id = body.get("thread_id")
    user_message = body.get("message") or body.get("input")

    async def gen() -> AsyncIterator[str]:
        yield _sse_event({"type": "status", "data": "starting"})
        await asyncio.sleep(0.05)

        if thread_id is not None:
            yield _sse_event({"type": "status", "data": f"thread:{thread_id}"})
            await asyncio.sleep(0.05)

        if user_message:
            yield _sse_event({"type": "content", "data": f"echo: {user_message}"})
        else:
            yield _sse_event({"type": "content", "data": "echo: (no message provided)"})

        await asyncio.sleep(0.05)
        yield _sse_event({"type": "status", "data": "done"})

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/agent/state/{thread_id}")
def agent_state(thread_id: str) -> dict[str, Any]:
    return {
        "thread_id": thread_id,
        "state": {
            "messages": [],
            "itinerary": None,
            "user_profile": None,
        },
    }
