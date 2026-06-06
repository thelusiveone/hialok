---
title: "5 Async Python Patterns I Use in Every Production App"
date: 2026-06-01
tags: [python, async, patterns, production]
description: "Practical async/await patterns that have saved me from production incidents. Battle-tested in systems handling 15K+ req/s."
---

## Why Async Matters

Async Python isn't just about speed — it's about **resource efficiency**. When your API waits on a database query, an HTTP call, or a file read, async lets other requests use that idle time. Here are five patterns I reach for in every project.

## 1. Structured Concurrency with TaskGroups

Instead of firing off tasks and hoping for the best, use `TaskGroup` for structured concurrency:

```python
import asyncio

async def fetch_user_data(user_id: int):
    async with asyncio.TaskGroup() as tg:
        profile_task = tg.create_task(get_profile(user_id))
        orders_task = tg.create_task(get_orders(user_id))
        preferences_task = tg.create_task(get_preferences(user_id))

    return {
        "profile": profile_task.result(),
        "orders": orders_task.result(),
        "preferences": preferences_task.result(),
    }
```

If any task fails, all others are cancelled. No orphaned coroutines, no leaked resources.

## 2. Async Context Managers for Resources

Always use async context managers for connections and sessions:

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

async def get_user(user_id: int):
    async with get_db() as db:
        return await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
```

## 3. Semaphore for Rate Limiting

When calling external APIs, always limit concurrency:

```python
import asyncio
import httpx

semaphore = asyncio.Semaphore(10)  # max 10 concurrent requests

async def fetch_with_limit(client: httpx.AsyncClient, url: str):
    async with semaphore:
        response = await client.get(url)
        return response.json()

async def fetch_all(urls: list[str]):
    async with httpx.AsyncClient() as client:
        tasks = [fetch_with_limit(client, url) for url in urls]
        return await asyncio.gather(*tasks)
```

Without the semaphore, 1000 URLs would open 1000 connections simultaneously and likely get you rate-limited or banned.

## 4. Graceful Timeout Handling

Never let an async operation hang forever:

```python
import asyncio

async def resilient_fetch(url: str, timeout: float = 5.0):
    try:
        async with asyncio.timeout(timeout):
            async with httpx.AsyncClient() as client:
                return await client.get(url)
    except TimeoutError:
        return None  # or a fallback response
```

## 5. Background Tasks for Fire-and-Forget

In FastAPI, use `BackgroundTasks` for operations that don't need to block the response:

```python
from fastapi import BackgroundTasks

async def send_welcome_email(email: str):
    # This could take 2-3 seconds
    await email_service.send(email, template="welcome")

@app.post("/register")
async def register(user: UserCreate, bg: BackgroundTasks):
    new_user = await create_user(user)
    bg.add_task(send_welcome_email, user.email)
    return new_user  # responds immediately
```

The user gets their response in milliseconds while the email sends in the background.

## The Golden Rule

Async Python is powerful, but the golden rule is simple: **never block the event loop**. If you call a synchronous library (like `requests` or `time.sleep`), wrap it with `asyncio.to_thread()`. One blocking call can stall your entire application.

```python
import asyncio

result = await asyncio.to_thread(sync_heavy_computation, data)
```

These patterns have kept my production systems stable at 15K+ requests per second. Start with these foundations, and you'll avoid 90% of async-related incidents.
