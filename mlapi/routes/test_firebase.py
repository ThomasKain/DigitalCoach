from services.firebase_setup import get_firestore_client
from fastapi import APIRouter
from utils.logger_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/server/firestore", tags=["test"])

# GET /server/firestore
@router.get(
    "/"
)
async def test_firstore():
    db = get_firestore_client()
    logger.info("Attempting to write to Firestore.")
    # Write new document
    test_data = {
        "name": "Maeve Reaper",
        "age": 27,
        "email": "maeavereaper@gmail.com"
    }
    docRef = db.collection("server_test_collection").document("server_test_user")
    docRef.set(test_data)    
    logger.info("Write operation successful!")
    logger.info("Attempting to read new document")
    
    # Read new document
    doc = docRef.get()
    if doc.exists:
        logger.info(f"Document found, data: {doc.to_dict()}")
    else:
        logger.warning("Document not found.")
    return doc.to_dict()