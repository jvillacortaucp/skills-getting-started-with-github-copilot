document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function createDetailRow(label, value) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;
    paragraph.appendChild(strong);
    paragraph.append(value);

    return paragraph;
  }

  let messageTimeout = null;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    if (messageTimeout !== null) {
      clearTimeout(messageTimeout);
    }
    messageTimeout = setTimeout(() => {
      messageDiv.classList.add("hidden");
      messageTimeout = null;
    }, 5000);
  }

  async function unregisterParticipant(activityName, participant) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participant)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.detail || "Could not remove participant.", "error");
        return;
      }

      showMessage(result.message, "success");
      fetchActivities();
    } catch (error) {
      showMessage("Failed to remove participant. Please try again.", "error");
      console.error("Error removing participant:", error);
    }
  }

  function createParticipantsSection(activityName, participants) {
    const wrapper = document.createElement("div");
    wrapper.className = "participants-section";

    const title = document.createElement("p");
    title.className = "participants-title";
    title.textContent = "Participants";
    wrapper.appendChild(title);

    if (!participants.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "participants-empty";
      emptyState.textContent = "No one has signed up yet.";
      wrapper.appendChild(emptyState);
      return wrapper;
    }

    const list = document.createElement("ul");
    list.className = "participants-list";

    participants.forEach((participant) => {
      const item = document.createElement("li");
      item.className = "participant-item";

      const email = document.createElement("span");
      email.className = "participant-email";
      email.textContent = participant;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "participant-delete";
      deleteButton.setAttribute("aria-label", `Remove ${participant} from ${activityName}`);
      deleteButton.textContent = "x";
      deleteButton.addEventListener("click", () => {
        unregisterParticipant(activityName, participant);
      });

      item.appendChild(email);
      item.appendChild(deleteButton);
      list.appendChild(item);
    });

    wrapper.appendChild(list);
    return wrapper;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;

        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.className = "activity-description";
        description.textContent = details.description;

        const meta = document.createElement("div");
        meta.className = "activity-meta";
        meta.appendChild(createDetailRow("Schedule", details.schedule));
        meta.appendChild(createDetailRow("Availability", `${spotsLeft} spots left`));

        activityCard.appendChild(title);
        activityCard.appendChild(description);
        activityCard.appendChild(meta);
        activityCard.appendChild(createParticipantsSection(name, participants));

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
