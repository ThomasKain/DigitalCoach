"""
Seed file used to populate Firebase services with mock data. This script is to be run within the backend's Docker container because it uses the Firebase Admin SDK.
"""
from services import firebase_setup 
import requests
from datetime import datetime
import asyncio

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

async def start_seed():
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
    interview1 = {
        "id": "vsoSA7V72JFdBPMLJL29",
        "date": "03/04/2024", # MM/DD/YY
        "timeStarted": datetime.now().strftime("%H:%M"), # HH:MM 12-hour
        "duration": "5m 30s", # MMm SSs (not 0-padded)
        "feedback": {
            "ai_feedback": "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
            "overall_competency": {
                "clarity": {
                    "score": 8,
                    "summary": "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow.",
                },
                "confidence": {
                    "score": 10,
                    "summary": "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!",
                },
                "engagement": {
                    "score": 9,
                    "summary": "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses.",
                },
                "star": {
                    "score": 88,
                    "summary": "To elevate your solid foundation, focus on quantifying your 'Result' with concrete metrics and explicitly highlighting your individual contributions rather than just the team's effort during the 'Action' phase."
                }
            },
        },
        "metrics": {
            "filler_count": 2,
            "overall_score": 99,
            "wpm": 100,
        },
        "transcript": 
        """
            Interviewer: Hi Alex, thanks for taking the time to speak with me today. To kick things off, could you tell me about a recent software project you worked on and a specific technical challenge you had to overcome?

            Marzia Bartalotti: Hi, yes, absolutely. Um, to be honest, I'm a little bit nervous, but I'm really excited to be here. So, recently, I worked on a full-stack web application. The biggest hurdle was definitely optimizing the database queries. Initially, the main user dashboard was loading incredibly slowly—it was taking almost five seconds to render. I felt pretty frustrated because I just couldn't figure out the bottleneck at first.

            Interviewer: That does sound stressful. How did you end up resolving it?

            Marzia Bartalotti: Well, I stepped back, dug into the documentation, and realized I was making a classic N+1 query error. Once I understood the root of the problem, I felt a lot more confident. I restructured the backend logic to use batch processing and implemented some basic indexing. Seeing the load time drop to under 200 milliseconds was incredibly rewarding. I'm actually really proud of how that turned out.
        """,
        "sentiment": "POSITIVE",
        "url": "https://google.com",
    }

    data1 = { 
        "avatarUrl": "https://picsum.photos/200",
        "concentration": "Technology",
        "createdAt": datetime.now().strftime("%m/%d/%Y"),
        "email": "marzia@talon.com",
        "hasCompletedInterview": False,
        "id": user1.uid,
        "name": "Marzia Bartalotti",
        "proficiency": "Student",
        "registrationCompletedAt": datetime.now().strftime("%m/%d/%Y"),
    }
    await db.collection("users").document(f"{user1.uid}").set(data1) # add user
    await db.collection("users").document(f"{user1.uid}").collection("interviews").document(interview1["id"]).set(interview1) # add interview to user's account
    

    print(f"Created user with authentication id={user1.uid}")

print("Seeding Firebase...")
asyncio.run(start_seed())
print("Done seeding Firebase!")