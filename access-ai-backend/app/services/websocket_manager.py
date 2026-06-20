import logging
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger("access_ai")

class ConnectionManager:
    def __init__(self):
        # Maps channel/room ID to a set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel_id: str):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = set()
        self.active_connections[channel_id].add(websocket)
        logger.info(f"WebSocket connected to channel: {channel_id}. Active in channel: {len(self.active_connections[channel_id])}")

    def disconnect(self, websocket: WebSocket, channel_id: str):
        if channel_id in self.active_connections:
            self.active_connections[channel_id].discard(websocket)
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]
            logger.info(f"WebSocket disconnected from channel: {channel_id}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict, channel_id: str):
        if channel_id in self.active_connections:
            for connection in list(self.active_connections[channel_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to socket: {e}")
                    self.disconnect(connection, channel_id)

manager = ConnectionManager()
