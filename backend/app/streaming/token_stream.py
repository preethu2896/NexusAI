"""
token_stream — Utility helpers for Server-Sent Events (SSE) formatting.
"""
import json


def format_sse(event_type: str, data: dict | None = None) -> str:
    """
    Formats a structured dictionary into a standard HTTP SSE event block.
    Example output:
        data: {"type": "token", "content": "Hello"}\n\n
    """
    payload = {"type": event_type}
    if data:
        payload.update(data)

    # SSE specifies each event block must end with double newlines (\n\n)
    return f"data: {json.dumps(payload)}\n\n"
