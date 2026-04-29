"""
Gen Audius — MCP Router
========================
Proxies the GenAudius MCP server (genaudius.cloud) to authenticated SaaS users.

Endpoints:
  GET  /api/mcp/health                       — public proxy of MCP /health
  GET  /api/mcp/tools                        — admin only: list MCP tools
  POST /api/mcp/call/{tool_name}             — authenticated user: invoke any tool
  GET  /api/admin/mcp/status                 — admin: status + analytics + chatgau
"""
import logging
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from deps import get_db, get_user_id, require_admin, deduct_credits_atomic
from services.mcp_client import MCPClient, MCPError

logger = logging.getLogger("gen_audius.mcp_router")

router = APIRouter(prefix="/api/mcp", tags=["MCP"])

# Credit cost per tool (override defaults). Tools NOT in this map cost 0 (free metadata calls).
TOOL_CREDIT_COST: dict[str, int] = {
    "generate_song":           20,
    "generate_bgm":            15,
    "generate_image":           5,
    "generate_cover_art":       8,
    "generate_video":          10,
    "create_full_production":  35,
    "compose_lyrics":           5,
    "analyze_prompt":           1,
    "refine_lyrics":            3,
    "separate_stems":          15,
    "export_midi":              5,
    "build_prompt":             1,
    "chatgau_support":          1,
    "chatgau_quick":            0,
    "trigger_training":       100,
    "trigger_composer_training": 50,
    "trigger_chatgau_training":  50,
}


@router.get("/health")
async def mcp_health() -> dict[str, Any]:
    """Public: returns whether the upstream MCP is reachable."""
    async with MCPClient() as mcp:
        if not mcp.base_url:
            return {"status": "not_configured", "detail": "MCP_BASE_URL is empty"}
        try:
            data = await mcp.health()
            return {"status": "ok", "mcp": data, "base_url": mcp.base_url}
        except Exception as e:
            return {"status": "unreachable", "error": str(e), "base_url": mcp.base_url}


@router.get("/tools")
async def mcp_list_tools(
    request: Request,
    db: Session = Depends(get_db),
    _: Any = Depends(require_admin),
) -> dict[str, Any]:
    """Admin-only: list all MCP tools."""
    async with MCPClient() as mcp:
        try:
            return await mcp.list_tools()
        except MCPError as e:
            raise HTTPException(status_code=502, detail=str(e))


@router.post("/call/{tool_name}")
async def mcp_call(
    tool_name: str,
    request: Request,
    arguments: dict[str, Any] = Body(default_factory=dict),
    db: Session = Depends(get_db),
):
    """
    Authenticated user invokes any MCP tool via the SaaS backend.
    Deducts credits according to TOOL_CREDIT_COST.
    """
    user_id = get_user_id(request)
    cost = TOOL_CREDIT_COST.get(tool_name, 0)

    if cost > 0:
        deduct_credits_atomic(db, user_id, cost)

    async with MCPClient() as mcp:
        if not mcp.is_configured:
            raise HTTPException(status_code=503, detail="MCP not configured (MCP_BASE_URL / MCP_API_KEY missing)")
        try:
            result = await mcp.call_tool(tool_name, arguments)
        except MCPError as e:
            raise HTTPException(status_code=502, detail=str(e))

    logger.info(f"🔌 [MCP] {user_id} -> {tool_name} ({cost} credits)")
    return {"tool": tool_name, "credits_charged": cost, "result": result}


# ─── Admin status combining multiple MCP tools ────────────────────────────────
admin_router = APIRouter(prefix="/api/admin/mcp", tags=["Admin", "MCP"])


@admin_router.get("/status")
async def mcp_full_status(
    request: Request,
    _: Any = Depends(require_admin),
) -> dict[str, Any]:
    """Comprehensive MCP dashboard: health + gateway + analytics + ChatGAU."""
    out: dict[str, Any] = {}
    async with MCPClient() as mcp:
        try:
            out["health"] = await mcp.health()
        except Exception as e:
            out["health"] = {"error": str(e)}

        # Best-effort calls to optional tools — don't fail the whole endpoint
        for tool, args in [
            ("gateway_health", {}),
            ("analytics_summary", {"days": 30}),
            ("chatgau_status", {}),
            ("get_system_status", {}),
        ]:
            try:
                out[tool] = await mcp.call_tool(tool, args)
            except MCPError as e:
                out[tool] = {"error": str(e)}

    return out
