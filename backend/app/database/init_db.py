from app.database.session import engine, Base
import app.models # Ensure all models are registered with Base

def init_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully!")

if __name__ == "__main__":
    init_db()
