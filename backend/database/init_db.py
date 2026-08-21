from database.connection import Base, engine
from database.models import BloodBank

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("PRAVAH database tables created successfully.")
