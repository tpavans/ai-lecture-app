import logging
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger("access_ai")

# Fallback in-memory stores for MongoDB when not running
class MockMongoCollection:
    def __init__(self, name):
        self.name = name
        self.data = []

    async def insert_one(self, document):
        import uuid
        from datetime import datetime
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        if "created_at" not in document:
            document["created_at"] = datetime.utcnow().isoformat()
        self.data.append(document)
        return type('InsertResult', (object,), {'inserted_id': document["_id"]})()

    async def find_one(self, filter):
        for doc in self.data:
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter=None):
        filter = filter or {}
        results = []
        for doc in self.data:
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        class AsyncCursor:
            def __init__(self, items):
                self.items = items
                self.index = 0
            def sort(self, *args, **kwargs):
                # Simple sort by date if needed
                return self
            async def to_list(self, length=None):
                if length:
                    return self.items[:length]
                return self.items
        
        return AsyncCursor(results)

    async def delete_one(self, filter):
        for i, doc in enumerate(self.data):
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                self.data.pop(i)
                return type('DeleteResult', (object,), {'deleted_count': 1})()
        return type('DeleteResult', (object,), {'deleted_count': 0})()

class MockMongoClient:
    def __init__(self):
        self.db_store = {}
    def __getitem__(self, db_name):
        if db_name not in self.db_store:
            self.db_store[db_name] = MockDatabase(db_name)
        return self.db_store[db_name]

class MockDatabase:
    def __init__(self, name):
        self.name = name
        self.collections = {}
    def __getitem__(self, col_name):
        if col_name not in self.collections:
            self.collections[col_name] = MockMongoCollection(col_name)
        return self.collections[col_name]

# Fallback in-memory Redis Mock
class MockRedis:
    def __init__(self):
        self.store = {}
    async def get(self, key):
        return self.store.get(key)
    async def set(self, key, value, ex=None):
        self.store[key] = value
        return True
    async def delete(self, key):
        if key in self.store:
            del self.store[key]
            return 1
        return 0

# Database clients
db_client = None
db = None
redis_client = None

async def init_db():
    global db_client, db, redis_client
    
    # Init MongoDB
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
        # Short timeout to fail-fast and fall back to mock
        db_client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Force connection check
        await db_client.admin.command('ping')
        db = db_client[settings.DATABASE_NAME]
        logger.info("Connected to MongoDB successfully.")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to in-memory Mock DB.")
        db_client = MockMongoClient()
        db = db_client[settings.DATABASE_NAME]

    # Init Redis
    try:
        logger.info(f"Connecting to Redis at {settings.REDIS_URL}")
        redis_client = aioredis.from_url(settings.REDIS_URL, socket_timeout=2.0)
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Falling back to in-memory Mock Redis.")
        redis_client = MockRedis()

async def close_db():
    global db_client, redis_client
    if db_client and not isinstance(db_client, MockMongoClient):
        db_client.close()
    if redis_client and not isinstance(redis_client, MockRedis):
        await redis_client.close()
