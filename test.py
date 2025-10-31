import redis

# Replace these with your actual Redis Cloud credentials
r = redis.Redis(
    host="redis-16842.c73.us-east-1-2.ec2.redns.redis-cloud.com",
    port=16842,
    password="GSUGLIuzDg3zegaBobelEse9t3M7pPzv",
    decode_responses=True  # returns strings instead of bytes
)

# Test connection
print(r.ping())  # Should print True
