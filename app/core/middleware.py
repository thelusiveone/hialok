from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SubdomainMiddleware(BaseHTTPMiddleware):
    """Rewrites blog.hialok.com requests to /blog prefix."""

    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        if host.startswith("blog."):
            scope = request.scope
            path = scope["path"]
            if not path.startswith("/blog") and not path.startswith("/static") and not path.startswith("/api"):
                scope["path"] = f"/blog{path}"
        return await call_next(request)
