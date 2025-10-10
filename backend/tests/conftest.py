import pytest
from app import create_app
from models import db, Item

def seed_items(n=23):
    """
    Populate the test database with predictable dummy data.
    Adds 3 named items for search tests + (n-3) numbered items for pagination.
    """
    # Named examples (for search)
    db.session.add_all([Item(name = "Alpha"), Item(name = "Beta"), Item(name = "Charlie")])
    
    # Extra examples (for pagination)
    for i in range(1,n-2):
        db.session.add(Item(name=f"Item {i}"))

    db.session.commit()

@pytest.fixture()
def app():
    """
    Creates a temporary Flask app instance using an in-memory SQLite database.
    This isolates tests from the real app.db.
    """
    app = create_app({
        "TESTING": True, # enables Flask test mode (no error catching)
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # fast, ephemeral DB
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    })

    # Push app context so SQLAlchemy can access the DB
    with app.app_context():
        db.create_all() # create tables in the DB
        seed_items(23) # load up sample data
    yield app # yield to tests
        # No teardown required since DB exists only in memory - auto-deletes when app_context closes

@pytest.fixture()
def client(app):
    """
    Returns a lightweight HTTP client for making requests to the test app.
    """
    return app.test_client()

@pytest.fixture()
def json_headers():
    """
    Common headers for sending JSON payloads in POST/PUT tests.
    """
    return {"Content-Type": "application/json"}