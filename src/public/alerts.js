/**
 * Displays a Bootstrap alert message.
 * @param {string} message The message to display.
 * @param {'success'|'danger'|'warning'|'info'} type The Bootstrap alert type.
 * @param {string} heading The heading for the alert (e.g., 'Error', 'Success!').
 * @param {number} [duration=5000] Optional: Duration in milliseconds before the alert auto-dismisses. Use 0 for no auto-dismiss.
 */
function displayBootstrapAlert(
  message,
  type = "danger",
  heading = "Heads Up!",
  duration = 5000
) {
  const container = document.getElementById("client-side-alerts-container");
  if (!container) {
    console.error("Client-side alerts container not found!");
    return;
  }

  // Sanitize message to prevent XSS (basic example, more robust needed for complex HTML)
  const sanitizedMessage = new DOMParser().parseFromString(message, "text/html")
    .body.textContent;
  const sanitizedHeading = new DOMParser().parseFromString(heading, "text/html")
    .body.textContent;

  const alertHtml = `
        <div class="alert alert-dismissible alert-${type} fade show">
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            <h4 class="alert-heading">${sanitizedHeading}</h4>
            <p class="mb-0">${sanitizedMessage}</p>
        </div>
    `;

  // Create a temporary div to parse the HTML string into a DOM element
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = alertHtml;
  const alertElement = tempDiv.firstElementChild;

  // Append the alert to the container
  container.appendChild(alertElement);

  // Bootstrap's JS will handle the dismiss button automatically due to data-bs-dismiss="alert"

  // Auto-dismiss after duration if set
  if (duration > 0) {
    setTimeout(() => {
      // Manually trigger Bootstrap's dismiss functionality
      const bootstrapAlert = bootstrap.Alert.getInstance(alertElement);
      if (bootstrapAlert) {
        bootstrapAlert.dispose(); // Use dispose to remove it fully
      } else {
        // Fallback if Bootstrap's JS hasn't initialized it yet or for older versions
        alertElement.remove();
      }
    }, duration);
  }
}

// Ensure Bootstrap's JS is loaded AFTER your custom JS if you use getInstance.
// Typically Bootstrap's JS should be loaded before your custom JS, but you need to ensure
// the global 'bootstrap' object is available if you use methods like getInstance.
// If you're on a very old Bootstrap version or not using their JS, alertElement.remove() is fine.
