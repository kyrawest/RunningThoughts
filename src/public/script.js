//FETCH DATA FROM THE FOOTER
//
//

const dataContainer = document.getElementById("data-container");
const { user, runid } = JSON.parse(dataContainer.innerHTML);
const pageRunId = runid;

let currentRunId = user.current_run;

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

if (currentRunTime !== null) {
  if (!withinXHours(currentRunTime, 2)) {
    currentRunId = null;
  }
}
console.log(currentRunId);

//TOGGLE OPEN VIEW
//
// Only show notes that are open

const toggleOpenView = document.querySelector("#toggleOpenView");
const toggleAllView = document.querySelector("#toggleAllView");

toggleOpenView.addEventListener("click", () => {
  console.log("click");
  const closedNotesAndRuns = document.querySelectorAll(".closed-note");

  closedNotesAndRuns.forEach((note) => {
    note.classList.toggle("d-none");
  });
});

toggleAllView.addEventListener("click", () => {
  console.log("click");
  const closedNotesAndRuns = document.querySelectorAll(".closed-note");

  closedNotesAndRuns.forEach((note) => {
    note.classList.toggle("d-none");
  });
});

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
      speechDisplay.innerText = transcript;
    } else if (speechEdit == "edit") {
      //this can only append to the end of a note, users will have to use native keyboard mic if they wish to edit within the text block
      editContent = document.getElementById("edit-note-modal-content").value =
        startingText + " " + transcript;
    } else if (speechEdit == "newer") {
      editContent = document.getElementById("new-note-modal-content").value =
        startingText + " " + transcript;
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

// Start recognition when modal opens
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
});

const speechMicButton = document.getElementById("speechMicButton");
speechMicButton.addEventListener("click", async function () {
  const runId = speechMicButton.dataset.runid;

  content = speechDisplay.value;
  content = content.charAt(0).toUpperCase() + content.slice(1);

  if (pageRunId !== 0) {
    await fetch(`/notes/new-note/${pageRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else if (currentRunId !== null) {
    await fetch(`/notes/new-note/${currentRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else {
    await fetch(`/runs/newRunWithNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  }
  //close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("speechModal")
  );
  modal.hide();

  //reset page
  window.location.reload();
});

const nnCurrentButton = document.getElementById("nn-current-button");

nnCurrentButton.addEventListener("click", async function () {
  const runId = nnCurrentButton.dataset.runid;

  content = speechDisplay.value;
  content = content.charAt(0).toUpperCase() + content.slice(1);

  if (pageRunId !== 0) {
    await fetch(`/notes/new-note/${pageRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else if (currentRunId !== null) {
    await fetch(`/notes/new-note/${currentRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else {
    await fetch(`/runs/newRunWithNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  }
  //close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("speechModal")
  );
  modal.hide();

  //reset page
  window.location.reload();
});

// TOGGLING OPEN STATE ON NOTE CARDS
//
//

document.addEventListener("DOMContentLoaded", () => {
  const toggleOpenForms = document.querySelectorAll(".toggle-open-form");

  toggleOpenForms.forEach((form) => {
    form.addEventListener("change", async (event) => {
      event.preventDefault();
      const url = form.action;

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
      }
      console.log(runCard);
      console.log(runCard.dataset);
      if (runCard.dataset.opennotes == 0) {
        runCard.classList.toggle("closed-note");
      }
    });
  });
});
//DLETING ALL NOTES FROM A RUN
document.addEventListener("DOMContentLoaded", () => {
  const deleteRunNotesModal = document.getElementById("deleteRunNotesModal");
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
  const deleteRunModal = document.getElementById("deleteRunModal");
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
      console.log(noteId);
      deleteNoteForm.action = `/notes/${noteId}`;
    });
  });
});

//UPDATING A RUN TITLE

document.addEventListener("DOMContentLoaded", () => {
  const editRunForm = document.querySelector("#editRunForm");

  if (!editRunForm) {
    return;
  }

  editRunForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = editRunForm.action;
    const title = document.querySelector("#editRunTitle").value;
    console.log(title);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to update run title");
      }
      console.log("here");
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

//Editing a note

const editNoteModal = document.getElementById("editNoteModal");
if (editNoteModal) {
  editNoteModal.addEventListener("show.bs.modal", (event) => {
    // Button that triggered the modal
    const button = event.relatedTarget;
    // Extract info from data-bs-* attributes
    const noteId = button.getAttribute("data-bs-noteid");
    // If necessary, you could initiate an Ajax request here
    // and then do the updating in a callback.
    const startingContent = document.querySelector(
      `#note-${noteId}-content`
    ).textContent;
    startingText = startingContent;
    // Update the modal's content.
    const modalContent = editNoteModal.querySelector(
      "#edit-note-modal-content"
    );
    modalContent.textContent = startingContent;

    // Start speech-to-text when #edit-mic is pressed
    const editMic = document.querySelector(`#edit-mic`);
    editMic.addEventListener("click", async () => {
      speechEdit = "edit";
      if (recognition && !isRecognizing) {
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
      if (recognition && isRecognizing) {
        recognition.stop();
      }
    });

    // Update note with save button clicked
    const saveButton = editNoteModal.querySelector("#save-changes-button");

    saveButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const url = `/notes/${noteId}`;
      const content = modalContent.value;

      try {
        const response = await fetch(`/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Failed to update note");
        }
        window.location.reload();
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
}

//NEw note without initial speech recognition

// Start speech-to-text when #edit-mic is pressed
const newMic = document.querySelector(`#new-mic`);
newMic.addEventListener("click", async () => {
  speechEdit = "newer";
  startingText = document.getElementById("new-note-modal-content").value;
  if (recognition && !isRecognizing) {
    //if the browser is capable and it is not yet recognizing speech, start doing so
    recognition.start();
  }

  if (recognition && isRecognizing) {
    //if the browser is capable and it IS recognizing speech, stop it
    recognition.stop();
  }
});

// Stop speech recognition when modal is closed
newNoteModal.addEventListener("hide.bs.modal", () => {
  if (recognition && isRecognizing) {
    recognition.stop();
  }
});

const submitNewButton = document.getElementById("submit-new-button");

submitNewButton.addEventListener("click", async function () {
  console.log("click");
  const runId = submitNewButton.dataset.runid;

  let content = document.getElementById("new-note-modal-content").value;
  content = content.charAt(0).toUpperCase() + content.slice(1);

  if (pageRunId !== 0) {
    await fetch(`/notes/new-note/${pageRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else if (currentRunId !== null) {
    await fetch(`/notes/new-note/${currentRunId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } else {
    await fetch(`/runs/newRunWithNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  }
  //close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("newNoteModal")
  );
  modal.hide();

  //reset page
  window.location.reload();
});
