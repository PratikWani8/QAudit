from typing import List, Dict, Any
from fastapi import WebSocket
import json

class ConnectionManager:
    """Manages active real-time WebSocket connections."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """Broadcasts real-time events to all connected clients."""
        message = json.dumps({"event": event_type, "data": data})
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()
