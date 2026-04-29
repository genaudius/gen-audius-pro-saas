"""
Gen Audius — MCP Client
========================
HTTP client to call the GenAudius MCP server running at genaudius.cloud (VPS Hostinger).

The MCP exposes 30+ tools as REST endpoints (POST /tool/{tool_name}) authenticated
with an X-GenAudius-Key header. This client is a thin async wrapper used by the
backend's `/api/mcp/*` router and (optionally) by the music/image/video pipelines.
"""
import os
import logging
from typing import Any

import httpx

logger = logging.getLogger("gen_audius.mcp_client")


class MCPError(Exception):
    """Raised on any non-2xx response from the MCP server."""


class MCPClient:
    """
    Thin async client for the GenAudius MCP HTTP API.

    Usage:
        async with MCPClient() as mcp:
            res = await mcp.call_tool("generate_song", {"prompt": "bachata romántica"})
    """

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 600.0,
    ):
        self.base_url = (base_url or os.getenv("MCP_BASE_URL", "https://genaudius.cloud")).rstrip("/")
        self.api_key = api_key or os.getenv("MCP_API_KEY") or os.getenv("GENAUDIUS_API_KEY", "")
        self.timeout = timeout
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=self.timeout)
        return self

    async def __aexit__(self, *exc):
        if self._client:
            await self._client.aclose()

    @property
    def is_configured(self) -> bool:
        return bool(self.base_url and self.api_key)

    def _headers(self, include_key: bool = True) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if include_key and self.api_key:
            h["X-GenAudius-Key"] = self.api_key
        return h

    async def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def _safe_json(self, response: httpx.Response, endpoint: str) -> dict[str, Any]:
        """Parse JSON tolerantly: return raw text under 'raw' if parse fails."""
        try:
            return response.json()
        except Exception:
            text = response.text
            logger.warning(f"MCP {endpoint} returned non-JSON ({len(text)} chars)")
            return {"_warning": "non_json_response", "raw": text[:2000]}

    # ─── Public methods ──────────────────────────────────────────────────────
    async def health(self) -> dict[str, Any]:
        """Public health endpoint — no API key needed."""
        client = await self._ensure_client()
        r = await client.get(f"{self.base_url}/health", timeout=15)
        r.raise_for_status()
        return await self._safe_json(r, "/health")

    async def list_tools(self) -> dict[str, Any]:
        """Authenticated: list all tools the MCP exposes."""
        client = await self._ensure_client()
        r = await client.get(
            f"{self.base_url}/tools",
            headers=self._headers(),
            timeout=30,
        )
        if r.status_code >= 400:
            raise MCPError(f"MCP /tools failed [{r.status_code}]: {r.text[:300]}")
        return await self._safe_json(r, "/tools")

    async def call_tool(self, tool_name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        """Invoke an MCP tool and return its full response payload."""
        if not self.api_key:
            raise MCPError("MCP_API_KEY (or GENAUDIUS_API_KEY) not configured")
        client = await self._ensure_client()
        try:
            r = await client.post(
                f"{self.base_url}/tool/{tool_name}",
                json={"arguments": arguments or {}},
                headers=self._headers(),
            )
        except httpx.RequestError as e:
            raise MCPError(f"MCP unreachable: {e}") from e

        if r.status_code >= 400:
            raise MCPError(f"MCP tool '{tool_name}' failed [{r.status_code}]: {r.text[:400]}")
        return await self._safe_json(r, f"/tool/{tool_name}")

    async def batch(self, steps: list[dict[str, Any]], stop_on_error: bool = True) -> dict[str, Any]:
        """Run multiple tools in sequence on the MCP."""
        client = await self._ensure_client()
        r = await client.post(
            f"{self.base_url}/batch",
            json={"steps": steps, "stop_on_error": stop_on_error},
            headers=self._headers(),
        )
        if r.status_code >= 400:
            raise MCPError(f"MCP /batch failed [{r.status_code}]: {r.text[:400]}")
        return await self._safe_json(r, "/batch")
