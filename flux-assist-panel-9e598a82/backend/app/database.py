"""History storage. Tries MongoDB (motor), falls back to history.json."""
from __future__ import annotations

import asyncio
import json
import os
from typing import Any, Dict, List, Optional

HISTORY_FILE = "history.json"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "jarvis_reader")

_client = None
_collection = None
_use_mongo = False
_lock = asyncio.Lock()


async def init() -> None:
    """Try to connect to Mongo; otherwise stay on JSON fallback."""
    global _client, _collection, _use_mongo
    try:
        from motor.motor_asyncio import AsyncIOMotorClient

        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=1500)
        await client.admin.command("ping")
        _client = client
        _collection = client[MONGO_DB]["history"]
        _use_mongo = True
        print("[db] MongoDB connected")
    except Exception as e:
        _use_mongo = False
        print(f"[db] MongoDB unavailable ({e}); using {HISTORY_FILE}")
        if not os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "w") as f:
                json.dump([], f)


async def _load_json() -> List[Dict[str, Any]]:
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r") as f:
        try:
            return json.load(f)
        except Exception:
            return []


async def _save_json(items: List[Dict[str, Any]]) -> None:
    with open(HISTORY_FILE, "w") as f:
        json.dump(items, f, indent=2, default=str)


async def add_record(record: Dict[str, Any]) -> None:
    if _use_mongo and _collection is not None:
        await _collection.insert_one(record)
        return
    async with _lock:
        items = await _load_json()
        items.append(record)
        await _save_json(items)


async def list_records() -> List[Dict[str, Any]]:
    if _use_mongo and _collection is not None:
        cur = _collection.find({}, {"_id": 0}).sort("created_at", -1)
        return [doc async for doc in cur]
    items = await _load_json()
    return list(reversed(items))


async def get_record(file_id: str) -> Optional[Dict[str, Any]]:
    if _use_mongo and _collection is not None:
        return await _collection.find_one({"file_id": file_id}, {"_id": 0})
    items = await _load_json()
    for it in items:
        if it.get("file_id") == file_id:
            return it
    return None


async def delete_record(file_id: str) -> bool:
    if _use_mongo and _collection is not None:
        res = await _collection.delete_one({"file_id": file_id})
        return res.deleted_count > 0
    async with _lock:
        items = await _load_json()
        new_items = [it for it in items if it.get("file_id") != file_id]
        if len(new_items) == len(items):
            return False
        await _save_json(new_items)
        return True
