"""
User-related schemas
"""
import datetime

from pydantic import BaseModel

class User(BaseModel):
    """
    Model representing a user

    (Note: This should match the IUser interface in /digital-coach-app/lib/user/models.ts)
    """
    id: str | None = None
    email: str
    registrationCompletedAt: datetime.datetime | None = None
    createdAt: datetime.datetime
    hasCompletedInterview: bool

class CreateUserRequest(BaseModel):
    """
    Model representing the shape of the request made from the client to create a new user document.
    """
    user: User # partially filled user to insert

class CreateUserResponse(BaseModel):
    """
    Model representing the response made after creating a new user.
    """
    success: bool

class GetUserRequest(BaseModel):
    """
    Model representing the shape of the request made from the client to retrieve a user document.
    """
    userId: str # user id

class GetUserResponse(BaseModel):
    """
    Model representing the response made from retrieving a user.
    """
    user: User | None
