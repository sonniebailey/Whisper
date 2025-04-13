let questions = [];

// Load questions from JSON file
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data.questions;
    })
    .catch(error => {
        console.error('Error loading questions:', error);
        // Fallback questions in case JSON fails to load
        questions = [
            "What's your favorite memory?",
            "What's the best advice you've ever received?",
            "What's something you're proud of?"
        ];
    });

document.addEventListener('DOMContentLoaded', (event) => {
    const questionElement = document.getElementById('current-question');
    const questionCard = document.getElementById('question-card');
    const rollBtn = document.getElementById('roll-btn');
    const participantElement = document.getElementById('selected-participant');
    const participantCard = document.getElementById('participant-card');
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // --- New Settings Element References ---
    const pointSpecificToggle = document.getElementById('point-specific-toggle');
    const newParticipantInput = document.getElementById('new-participant-name');
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const participantListSettings = document.getElementById('participant-list-settings');

    // --- State Variables ---
    let participants = []; // Use this array, managed via settings
    let pointToSpecific = false;

    // --- Initialization ---

    // Load settings and participants from localStorage
    loadSettings();
    renderParticipantList();

    // Set initial visibility based on loaded settings
    updateParticipantCardVisibility(); 

    // Set initial introductory text (check if element exists)
    if (questionElement) {
        questionElement.textContent = 'Whisper is an app that helps you have deeper conversations. It asks you a question, and someone can give an answer. Click the button below for the first question.';
    }
    if (participantElement) {
        participantElement.textContent = '';
    }

    // --- Functions ---

    function saveSettings() {
        localStorage.setItem('whisperParticipants', JSON.stringify(participants));
        localStorage.setItem('whisperPointSpecific', pointSpecificToggle.checked);
    }

    function loadSettings() {
        const savedParticipants = localStorage.getItem('whisperParticipants');
        const savedPointSpecific = localStorage.getItem('whisperPointSpecific');

        participants = savedParticipants ? JSON.parse(savedParticipants) : []; // Default to empty array
        pointToSpecific = savedPointSpecific === 'true'; // localStorage stores strings

        // Update the toggle switch state
        if (pointSpecificToggle) {
            pointSpecificToggle.checked = pointToSpecific;
        }
    }

    function renderParticipantList() {
        if (!participantListSettings) return;
        participantListSettings.innerHTML = ''; // Clear existing list
        participants.forEach((name, index) => {
            const li = document.createElement('li');
            li.textContent = name;

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;'; // Use a simple 'x'
            removeBtn.classList.add('remove-participant-btn');
            removeBtn.onclick = () => {
                removeParticipant(index);
            };

            li.appendChild(removeBtn);
            participantListSettings.appendChild(li);
        });
    }

    function addParticipant() {
        if (!newParticipantInput) return;
        const name = newParticipantInput.value.trim();
        if (name && !participants.includes(name)) { // Add only if non-empty and not duplicate
            participants.push(name);
            newParticipantInput.value = ''; // Clear input
            renderParticipantList();
            saveSettings();
        } else if (participants.includes(name)) {
            alert(`"${name}" is already in the list.`); // Optional: user feedback
             newParticipantInput.value = ''; 
        }
    }

    function removeParticipant(index) {
        participants.splice(index, 1);
        renderParticipantList();
        saveSettings();
    }

    function updateParticipantCardVisibility() {
        if (participantCard) {
             participantCard.style.display = pointToSpecific ? 'flex' : 'none';
        }
    }


    // --- Event Listeners ---

    // Roll functionality - Modified
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            rollBtn.disabled = true;

            // Always clear previous selections/states
             if (participantElement) {
                participantElement.textContent = '';
                participantElement.classList.remove('reveal-participant');
            }
             if (questionElement) {
                questionElement.textContent = '';
                 questionElement.classList.remove('reveal-question');
             }

            // Select final question
            if (questions.length > 0 && questionElement) {
                const finalQIndex = Math.floor(Math.random() * questions.length);
                questionElement.textContent = questions[finalQIndex];
                questionElement.classList.add('reveal-question');
            } else if (questionElement) {
                questionElement.textContent = 'No questions loaded.';
            }

            // --- Participant Logic based on Toggle ---
            const questionRevealDuration = 1000;
            const participantDelay = pointToSpecific ? 1500 : 0; // Delay participant reveal if shown
            const participantRevealDuration = 1200;
            const totalDuration = questionRevealDuration + participantDelay + (pointToSpecific ? participantRevealDuration : 0);

            // After question animation completes...
            setTimeout(() => {
                if (questionElement) {
                     questionElement.classList.remove('reveal-question');
                 }

                if (pointToSpecific) {
                    // If pointing to specific, wait a bit more, then select participant
                    setTimeout(() => {
                        if (participants.length > 0 && participantElement) {
                            const selectedIndex = Math.floor(Math.random() * participants.length);
                            participantElement.textContent = participants[selectedIndex];
                            participantElement.classList.add('reveal-participant');
                        } else if (participantElement) {
                            // Handle insufficient participants when toggle is ON
                            if (pointToSpecific && participants.length < 2) {
                                participantElement.textContent = 'Please add at least 2 participants in Settings.';
                                participantElement.classList.add('reveal-participant'); // Still reveal to show message
                            } else {
                                // Should not happen if toggle is ON and list is empty, but good fallback
                                participantElement.textContent = 'No participants added.'; 
                                participantElement.classList.add('reveal-participant');
                            }
                        }
                        // Re-enable button after participant animation
                         setTimeout(() => {
                             rollBtn.disabled = false;
                         }, participantRevealDuration);
                    }, participantDelay);
                } else {
                     // If not pointing to specific, re-enable button sooner
                     rollBtn.disabled = false;
                 }

            }, questionRevealDuration);
        });
    }


    // Settings Panel Logic (Show/Hide)
    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.add('visible');
            renderParticipantList(); // Ensure list is up-to-date when opened
        });
    }
    if (closeSettingsBtn && settingsPanel) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsPanel.classList.remove('visible');
        });
    }
    if (settingsPanel && settingsBtn) {
        document.addEventListener('click', (event) => {
            if (!settingsPanel.contains(event.target) && !settingsBtn.contains(event.target)) {
                settingsPanel.classList.remove('visible');
            }
        });
    }

    // --- Settings Interaction Listeners ---

    // Toggle switch change
    if (pointSpecificToggle) {
        pointSpecificToggle.addEventListener('change', (event) => {
            pointToSpecific = event.target.checked;
            updateParticipantCardVisibility();
            saveSettings();
        });
    }

    // Add participant button click
    if (addParticipantBtn) {
        addParticipantBtn.addEventListener('click', addParticipant);
    }

    // Allow adding participant by pressing Enter in the input field
    if (newParticipantInput) {
        newParticipantInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                 event.preventDefault(); // Prevent potential form submission
                 addParticipant();
            }
        });
    }

}); 