import os
from redis import Redis, ConnectionPool
from utils.logger_config import get_logger
from dotenv import load_dotenv
logger = get_logger(__name__)


load_dotenv() # load environment variables
# Create the connection pool, i.e. a way to manage and reuse the same Redis connection instead of establishing a new one everytime
redis_url = os.getenv("REDIS_URL") # check if we have a redis URL (this is for cases where we'd use a cloud provider)

if (redis_url):
    POOL = ConnectionPool.from_url(redis_url, decode_responses=False)
else:
    try:
        print(f"Creating connection pool")
        # create connection pool using our own parameters
        POOL = ConnectionPool(
            host=os.getenv("REDIS_HOST"),
            port=int(os.getenv("REDIS_PORT")),
            decode_responses=False,
            socket_timeout=5, # time to wait for Redis to respond before throwing an error instead of infinitely hanging 
            health_check_interval=30,
        )
    except Exception as e:
        logger.error("Can't create connection pool: {e}")
    


def get_redis_con() -> Redis:
    """
    Create a secure Redis connection with authentication.

    Returns:
        Redis: Authenticated Redis connection
    """
    try:
        redis = Redis(connection_pool=POOL) # return Redis client that uses the already established connection to our Redis server
        print(f"Pinging: {redis.ping()}") # check if connection was successfull
        return redis
    except Exception as e:
        logger.error(f"Failed to create Redis connection: {e}")
