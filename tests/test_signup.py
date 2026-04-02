from src.app import activities


def test_signup_adds_participant_to_activity(client):
    # Arrange
    activity_name = "Chess Club"
    email = "new_student@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})

    # Assert
    assert response.status_code == 200
    assert response.json() == {"message": f"Signed up {email} for {activity_name}"}
    assert email in activities[activity_name]["participants"]


def test_signup_returns_not_found_for_unknown_activity(client):
    # Arrange
    activity_name = "Unknown Club"
    email = "new_student@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}


def test_signup_returns_bad_request_for_duplicate_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "Student already signed up"}


def test_signup_returns_bad_request_when_activity_is_full(client):
    # Arrange: fill the activity to max capacity
    activity_name = "Chess Club"
    max_participants = activities[activity_name]["max_participants"]
    existing_count = len(activities[activity_name]["participants"])
    for i in range(max_participants - existing_count):
        activities[activity_name]["participants"].append(f"filler{i}@mergington.edu")

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": "newcomer@mergington.edu"})

    # Assert
    assert response.status_code == 400
    assert response.json() == {"detail": "Activity is full"}