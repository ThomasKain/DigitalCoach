"""
Seed file used to populate Firebase services with mock data. This script is to be run within the backend's Docker container because it uses the Firebase Admin SDK.
"""
from services import firebase_setup 
from firebase_admin import firestore    
import requests


def drop_emulator_data():
    """
    Removes all data from Firebase emulators.
    """
    print("Dropping emulator data...")
    PROJECT_ID = "demo-digital-coach"    
    # clear firestore
    firestore_url = f"http://firebase:8080/emulator/v1/projects/{PROJECT_ID}/databases/(default)/documents"
    try:
        requests.delete(firestore_url) # send DELETE request
        print("Firestore data cleared!")
    except Exception as e:
        print(f"Failed to clear Firestore data: {e}")

    # clear authenticator
    auth_url = f"http://firebase:9099/emulator/v1/projects/{PROJECT_ID}/accounts"
    try:
        requests.delete(auth_url)
        print("Authentication data cleared!")
    except Exception as e:
        print(f"Failed to clear Authentication data: {e}")

def start_seed():
    """
    Seeds Firebase Services with data, e.g. add users.
    """
    auth = firebase_setup.get_auth_client()
    db = firebase_setup.get_firestore_client()
    
    # clear out current data
    drop_emulator_data()

    # add new data
    user1 = auth.create_user(
        email="marzia@talon.com",
        password="Vendetta@29",
    )
    data1 = { 
        "avatarUrl": "https://picsum.photos/200",
        "concentration": "Technology",
        "createdAt": firestore.SERVER_TIMESTAMP,
        "email": "marzia@talon.com",
        "hasCompletedInterview": False,
        "id": user1.uid,
        "name": "Marzia Bartalotti",
        "proficiency": "Student",
        "registrationCompletedAt": firestore.SERVER_TIMESTAMP
    }
    db.collection("users").document(f"{user1.uid}").set(data1)

    

    print(f"Created user with authentication id={user1.uid}")

print("Seeding Firebase...")
start_seed()
print("Done seeding Firebase!")