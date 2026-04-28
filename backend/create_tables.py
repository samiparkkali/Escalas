from app.db import engine, Base

# Import all models so Base knows them
from app.models.user import User
from app.models.token import AuthToken
from app.models.professional import Professional
from app.models.unavailability import Unavailability

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")