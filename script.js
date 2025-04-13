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

const questionElement = document.getElementById('current-question');
const questionCard = document.getElementById('question-card');
const rollBtn = document.getElementById('roll-btn');
const participantElement = document.getElementById('selected-participant');
const participantCard = document.getElementById('participant-card');

// List of participants
const participants = ['Alex', 'Jordan', 'Taylor', 'Casey'];

// Set initial text to blank
questionElement.textContent = '';
participantElement.textContent = '';

// Roll functionality
rollBtn.addEventListener('click', () => {
    // Disable button during roll
    rollBtn.disabled = true;
    
    // Clear any previous selections
    participantElement.textContent = '';
    participantElement.classList.remove('reveal-participant');
    
    // Select final question immediately
    const finalQIndex = Math.floor(Math.random() * questions.length);
    questionElement.textContent = questions[finalQIndex];
    
    // Add reveal animation class
    questionElement.classList.add('reveal-question');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        questionElement.classList.remove('reveal-question');
        
        // Start participant selection after a longer pause (2 seconds)
        setTimeout(() => {
            // Select random participant
            const selectedIndex = Math.floor(Math.random() * participants.length);
            participantElement.textContent = participants[selectedIndex];
            
            // Add reveal animation class
            participantElement.classList.add('reveal-participant');
            
            // Re-enable button after animation
            setTimeout(() => {
                rollBtn.disabled = false;
            }, 1200); // Match animation duration
        }, 2000); // Increased from 500ms to 2000ms for more anticipation
    }, 1000); // Wait for question animation to complete
}); 