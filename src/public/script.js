//FETCH DATA FROM THE FOOTER

const dataContainer = document.getElementById("data-container");
const { user, runid } = JSON.parse(dataContainer.innerHTML);
const pageRunId = runid;

let currentRunId = user.current_run;

const pageMic = document.querySelector(".mic-button-page");

pageMic.addEventListener("click", () => {
  pageMic.classList.toggle("d-none"); //make the page mic button disappear since we have another one embedded in the modal
});

// Client side determines a user's current run so it can decide where to put a new note.
//If the user has a current run, it checks if the current run is older than 2 hours.
// If it is, it sets the current run to null, so starting a new note using the mic button on the bashboard will also create a new run.
const currentRunTime = user.currentRunUpdatedAt;

const withinXHours = (date, hours) => {
  //FUNCTION: check a date is within x hours of right now
  const diff = Math.abs(new Date(date).getTime() - new Date().getTime());
  const diffHours = diff / (1000 * 60 * 60);
  return diffHours < hours;
};

// If the user has a current run, check if it is within 2 hours of now. Dsable the corresponding nav button if not.
if (currentRunTime !== null) {
  if (!withinXHours(currentRunTime, 2)) {
    currentRunId = null;
    document.getElementById("current-run-nav").classList.add("disabled");
  }
}

//Speech Recognition
//
//
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
let speechEdit;
let startingText;

let isRecognizing = false;

const speechDisplay = document.getElementById("content");

if (recognition) {
  speechDisplay.innerText = "";

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-CA";

  recognition.onstart = function () {
    isRecognizing = true;
  };

  recognition.onresult = function (event) {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    if (speechEdit == "new") {
      //for new note modal that starts with speech input
      speechDisplay.innerText = transcript;
    } else if (speechEdit == "edit") {
      //for the edit note modal
      //this can only append to the end of a note, users will have to use native keyboard mic if they wish to edit within the text block
      document.getElementById("edit-note-modal-content").value =
        startingText + " " + transcript;
    } else if (speechEdit == "newer") {
      //for new note modal that starts with no speech input
      document.getElementById("new-note-modal-content").value =
        startingText + ` ${transcript}`;
    }
  };

  recognition.onerror = function (event) {
    console.log("Error occurred in recognition: " + event.error);
    isRecognizing = false;
  };

  recognition.onend = function () {
    isRecognizing = false;
  };
}

// Start recognition when speech modal opens
const modal = document.getElementById("speechModal");
modal.addEventListener("shown.bs.modal", () => {
  if (recognition && !isRecognizing) {
    speechEdit = "new";
    recognition.start();
  }

  // Stop recognition when modal closes
  if (recognition && isRecognizing) {
    recognition.stop();
  }

  form = document.getElementById("speechModalForm");
  if (pageRunId !== 0) {
    form.action = `/notes/${pageRunId}`;
  } else if (currentRunId !== null) {
    form.action = `/notes/${currentRunId}`;
  } else {
    form.action = `/runs/with-note`;
  }

  // Stop speech recognition when modal is closed
  this.addEventListener("hide.bs.modal", () => {
    pageMic.classList.toggle("d-none"); //make the page mic button disappear since we have another one embedded in the modal
    if (recognition && isRecognizing) {
      recognition.stop();
    }
  });
});

//TOGGLE OPEN VIEW
//
// Only show notes that are open

const toggleOpenView = document.querySelector("#toggleOpenView");
const toggleAllView = document.querySelector("#toggleAllView");

// TOGGLING OPEN STATE ON NOTE CARDS
//
//

let viewState = "all"; // Default view state

toggleOpenView.addEventListener("click", () => {
  const closedNotesAndRuns = document.querySelectorAll(".closed-note");
  viewState = "openOnly"; // Set view state to open
  toggleAllView.disabled = false;
  toggleOpenView.disabled = true;

  closedNotesAndRuns.forEach((note) => {
    note.classList.add("d-none");
  });
});

toggleAllView.addEventListener("click", () => {
  const closedNotesAndRuns = document.querySelectorAll(".closed-note");
  viewState = "all"; // Set view state to all
  toggleAllView.disabled = true;
  toggleOpenView.disabled = false;

  closedNotesAndRuns.forEach((note) => {
    note.classList.remove("d-none");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleOpenForms = document.querySelectorAll(".toggle-open-form");

  toggleOpenForms.forEach((form) => {
    form.addEventListener("change", async (event) => {
      event.preventDefault();
      const url = form.action;

      //using a client-side fetch here does mean that errors are not displayed
      //on the client-side with req.flash() for toggling a ntoe open/closed as there is no page refresh.
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Failed to toggle note status");
        }
      } catch (error) {
        console.error("Error:", error);
        return;
      }

      const noteId = form.dataset.noteid;
      const runId = form.dataset.runid;

      const noteCard = document.querySelector(`#note-${noteId}-card`);
      const runCard = document.querySelector(`#run-${runId}-card`);

      if (noteCard) {
        noteCard.classList.toggle("closed-note");
        if (viewState === "openOnly") {
          // If the view state is open only, hide the note card if it's closed
          if (noteCard.classList.contains("closed-note")) {
            noteCard.classList.add("d-none");
          } else {
            noteCard.classList.remove("d-none");
          }
        }
      }
      if (runCard.dataset.opennotes == 0) {
        runCard.classList.toggle("closed-note");
      }
    });
  });
});

//DELETING ALL NOTES FROM A RUN
document.addEventListener("DOMContentLoaded", () => {
  const deleteRunNotesForm = document.getElementById("deleteRunNotesForm");

  document.querySelectorAll(".delete-run-notes-button").forEach((button) => {
    button.addEventListener("click", () => {
      const runId = button.dataset.runid;
      deleteRunNotesForm.action = `/runs/${runId}/notes`;
    });
  });
});

// DELETING AN ENTIRE RUN
document.addEventListener("DOMContentLoaded", () => {
  const deleteRunForm = document.getElementById("deleteRunForm");

  document.querySelectorAll(".delete-run-button").forEach((button) => {
    button.addEventListener("click", () => {
      const runId = button.dataset.runid;
      deleteRunForm.action = `/runs/${runId}`;
    });
  });
});

//DELETE A NOTE
document.addEventListener("DOMContentLoaded", () => {
  const deleteNoteForm = document.getElementById("deleteNoteForm");

  document.querySelectorAll(".delete-note-button").forEach((button) => {
    button.addEventListener("click", () => {
      const noteId = button.dataset.noteid;
      deleteNoteForm.action = `/notes/${noteId}`;
    });
  });
});

//Editing a note

const editNoteModal = document.getElementById("editNoteModal");
if (editNoteModal) {
  editNoteModal.addEventListener("show.bs.modal", (event) => {
    pageMic.classList.toggle("d-none");
    // Button that triggered the modal
    const button = event.relatedTarget;
    // Extract info from data-bs-* attributes
    const noteId = button.getAttribute("data-bs-noteid");
    const startingContent = document.querySelector(
      `#note-${noteId}-content`
    ).innerText;

    // Update the modal's content.
    const modalContent = editNoteModal.querySelector(
      "#edit-note-modal-content"
    );
    modalContent.textContent = startingContent.trim();

    // Start speech-to-text when #edit-mic is pressed
    const editMic = document.querySelector(`#edit-mic`);
    editMic.addEventListener("click", async () => {
      speechEdit = "edit";
      if (recognition && !isRecognizing) {
        startingText = modalContent.value;
        //if the browser is capable and it is not yet recognizing speech, start doing so
        recognition.start();
      }

      if (recognition && isRecognizing) {
        //if the browser is capable and it IS recognizing speech, stop it
        recognition.stop();
      }
    });

    // Stop speech recognition when modal is closed
    editNoteModal.addEventListener("hide.bs.modal", () => {
      pageMic.classList.toggle("d-none"); //make the page mic appear again
      if (recognition && isRecognizing) {
        recognition.stop();
      }
    });

    // Set the action of this form to the specified note
    const editNoteForm = editNoteModal.querySelector("#edit-note-form");

    editNoteForm.action = `/notes/${noteId}`;
  });
}

// New note without initial speech recognition

// Start speech-to-text when #edit-mic is pressed
const newMic = document.querySelector(`#new-mic`);
newMic.addEventListener("click", async () => {
  speechEdit = "newer";

  if (recognition && !isRecognizing) {
    startingText = document.getElementById("new-note-modal-content").value;
    //if the browser is capable and it is not yet recognizing speech, start doing so
    recognition.start();
  }

  if (recognition && isRecognizing) {
    //if the browser is capable and it IS recognizing speech, stop it
    recognition.stop();
  }
});

// Stop speech recognition when modal is closed
newNoteModal.addEventListener("show.bs.modal", () => {
  pageMic.classList.toggle("d-none");
});

// Stop speech recognition when modal is closed
newNoteModal.addEventListener("hide.bs.modal", () => {
  pageMic.classList.toggle("d-none"); //make the page mic button disappear since we have another one embedded in the modal
  if (recognition && isRecognizing) {
    recognition.stop();
  }
});

const submitNewButton = document.getElementById("submit-new-button");

submitNewButton.addEventListener("click", async function () {
  console.log("click");

  let content = document.getElementById("new-note-modal-content").value;
  content = content.charAt(0).toUpperCase() + content.slice(1);

  form = document.getElementById("newModalForm");
  if (pageRunId !== 0) {
    form.action = `/notes/${pageRunId}`;
  } else if (currentRunId !== null) {
    form.action = `/notes/${currentRunId}`;
  } else {
    form.action = `/runs/with-note`;
  }

  //close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("newNoteModal")
  );
  modal.hide();
});
