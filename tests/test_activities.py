def test_get_activities_returns_all_activities(client):
    # Arrange

    # Act
    response = client.get("/activities")
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert isinstance(payload, dict)
    assert "Chess Club" in payload


def test_get_activities_returns_expected_activity_shape(client):
    # Arrange

    # Act
    response = client.get("/activities")
    payload = response.json()
    activity = payload["Chess Club"]

    # Assert
    assert response.status_code == 200
    assert set(activity) == {"description", "schedule", "max_participants", "participants"}
    assert isinstance(activity["description"], str)
    assert isinstance(activity["schedule"], str)
    assert isinstance(activity["max_participants"], int)
    assert isinstance(activity["participants"], list)