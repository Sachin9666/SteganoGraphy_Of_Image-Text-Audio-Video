import pymongo
import gridfs
from bson.objectid import ObjectId
from backend.services.config import settings

# MongoDB connection configuration
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "stego_vault"

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]

users_col = db["users"]
jobs_col = db["jobs"]
fs = gridfs.GridFS(db)

# Initialize indexes
users_col.create_index("id", unique=True)
users_col.create_index("email", unique=True)
jobs_col.create_index("job_id", unique=True)
jobs_col.create_index("user_id")


def save_file(data: bytes, filename: str) -> str:
    """Saves binary data to GridFS and returns the ObjectId string prefixed with gridfs://."""
    file_id = fs.put(data, filename=filename)
    return f"gridfs://{file_id}"


def get_file_bytes(path_or_id: str) -> bytes:
    """Retrieves binary data from GridFS if starting with gridfs://, otherwise reads from local file path."""
    if path_or_id.startswith("gridfs://"):
        file_id_str = path_or_id.replace("gridfs://", "")
        grid_out = fs.get(ObjectId(file_id_str))
        return grid_out.read()
    else:
        from pathlib import Path
        return Path(path_or_id).read_bytes()


def delete_file(path_or_id: str) -> None:
    """Deletes file from GridFS if starting with gridfs://, otherwise deletes from local filesystem."""
    if not path_or_id:
        return
    if path_or_id.startswith("gridfs://"):
        try:
            file_id_str = path_or_id.replace("gridfs://", "")
            fs.delete(ObjectId(file_id_str))
        except Exception:
            pass
    else:
        import os
        if os.path.exists(path_or_id):
            try:
                os.remove(path_or_id)
            except OSError:
                pass


def initialize_database() -> None:
    """No-op placeholder for backward compatibility."""
    pass
