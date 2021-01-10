//Game State
let gameOver = false;
//Row Selector
let currentRow = 1;  //Inital Row to start playing on
//Initial Colors
const colors = ['red', 'blue', 'yellow', 'green', 'white', 'black'];
//Create Answer Array
const answer = [];
//Answer Section
const answerSection = document.querySelector('#solution');
//Initialize HTML answer variable
let finalAnswerHTML = '';
//Gather Selection Section
const colorSelectionFields = document.querySelectorAll('.color');
//Gather Guessing Section
const guessFields = document.querySelector('.guesser').querySelectorAll('.circle');
//Guess Form
const guessForm = document.querySelector('#submit-guess');
//Start instant for timer
let startTime = Date.now();
//Post-game Modal
const modalBackground = document.querySelector('.modal-background');
const numAttempts = document.querySelector('#num-attempts');
const totalTime = document.querySelector('#time');
const resetBtn = document.querySelector('#play-again');

function resetFields(fields) {
    removeSelectedClass(fields);
    guessFields[0].classList.add('selected');
    for (let i = 0; i < fields.length; i++) {
        removeColors(fields[i]); 
    }
}

function generateAnswer() {
    for (let i = 0; i < 4; i++) {
        answer[i] = colors[getRandomInt(0, colors.length)];
    } 
    finalAnswerHTML = `<div class="guess-row">
                            <div class="circle ${answer[0]}"></div>
                            <div class="circle ${answer[1]}"></div>
                            <div class="circle ${answer[2]}"></div>
                            <div class="circle ${answer[3]}"></div>
                        </div>`;
}

function createSelectListeners(fields) {
    for (let i = 0; i < fields.length; i++) {
        fields[i].addEventListener('click', () => {
            if (!gameOver) {
                removeSelectedClass(fields);
                fields[i].classList.add('selected');
            }
        })
    }
}

function removeSelectedClass(fields) {
    for (let i = 0; i < fields.length; i++) {
        fields[i].classList.remove('selected');
    }
}

function moveSelected(fields) {
    for (let i = 0; i < fields.length; i++) {
        for (let ii = 0; ii< fields[i].classList.length; ii++) {
            if (fields[i].classList[ii].toLowerCase() === 'selected' && i !== fields.length - 1) {
                fields[i + 1].classList.add('selected');
                fields[i].classList.remove('selected');
                return;
            } else if (i === fields.length - 1) {
                fields[i].classList.remove('selected');
                fields[0].classList.add('selected');
                return;
            }
        }
    }
}

function applyColorChanges(colorFields) {
    for (let i = 0; i < colorFields.length; i++) {
        colorFields[i].addEventListener('click', (e) => {
            if (!gameOver) {
                removeColors(document.querySelector('.selected'));
                document.querySelector('.selected').classList.add(e.target.id);
                moveSelected(document.querySelector('.guesser').querySelectorAll('.circle'));
            }
        })
    }
}

function removeColors(field) {
    colors.forEach((color) => {
        field.classList.remove(color);
    })
}

function findColorClass(field) {
    for (let i = 0; i < field.classList.length; i++) {
        if (colors.includes(field.classList[i])){
            return field.classList[i];
        }
    }
}

function checkGuess(guessedRow) {
    const hintAry = [];
    const evalIndex = [];
    const guessedFieldsList = guessedRow.querySelectorAll('.circle');
    for (let i = 0; i < guessedFieldsList.length; i++) {
        const guessedColor = findColorClass(guessedFieldsList[i]);
        //Perfect Match
        if (answer[i] === guessedColor) {
            evalIndex.push(i);      //For Answer Field
            evalIndex.push(i + 10); //For Guess (Guess index starts at 10)
            hintAry.push({
                class: 'red'
            });
        } 
    }
    //find correct colors in wrong spot
    answer.forEach((color, index) => {
        for (let i = 0; i < guessedFieldsList.length; i++) {
            const guessedColor = findColorClass(guessedFieldsList[i]);
            if (color === guessedColor && !evalIndex.includes(i + 10) && !evalIndex.includes(index)) {
                evalIndex.push(index);  //For Answer Field
                evalIndex.push(i + 10); //Guess index starts at 10
                hintAry.push({
                    class: 'white'
                });
            }
        }
    })
    displayHints(hintAry, guessedRow.querySelectorAll('.guess'));
    if (correctGuess(answer, guessedFieldsList)) {
        endGame(true);
    } else if (currentRow >= 10) {
        endGame(false);
    }
}

function displayHints(hintAry, hints) {
    hintAry.sort((a, b) => sortGuess(a, b));
    hintAry.forEach((guess, index) => {
            hints[index].classList.add(guess.class);
    })
}


function sortGuess(a, b) {
    if (a.class === 'red') {
        return -1;
    } else if (b.class === 'red') {
        return 1;
    } else {
        return 0;
    }
}

function correctGuess(answers, guesses) {
    let correct = true;
    answers.forEach((color, index) => {
        if (findColorClass(guesses[index]) !== color) {
            correct = false;
        }
    })
    return correct;
}

function isCompleteGuess(guessFields) {
    let complete = true;
    for (let i = 0; i < guessFields.length; i++) {
        if (findColorClass(guessFields[i]) === undefined) {
            complete = false;
        }
    }
    return complete;
}

function endGame(success) {
    const timeDiff = findTotalTime(Date.now());
    const postGameMsg = document.querySelector('#post-game-message');
    postGameMsg.textContent = success ? 'Great Job!' : 'Nice Try!';
    setTimeout(() => {
        window.scroll(0, 0);
        answerSection.classList.remove('black');
        answerSection.innerHTML = finalAnswerHTML;
        numAttempts.textContent = `${currentRow - 1}`;
        totalTime.textContent = timeDiff;
        setTimeout(() => {
            modalBackground.classList.add('modal-active');
        }, 500);
    }, 500);
    removeSelectedClass(guessFields);    //global scope
    gameOver = true;     //global scope
}

function findTotalTime(endTime) {
    let hours = 0;
    const timeDiff = (endTime - startTime) / 1000;
    let minutes = Math.floor(timeDiff / 60);          
    const seconds = Math.floor(timeDiff - minutes * 60);
    if (minutes <= 0) {
        return `${seconds} seconds`;
    } else if (minutes >= 60) {
        hours = Math.floor(minutes / 60);   
        minutes = minutes % 60;
        return `${hours}:${minutes}:${seconds}`;
    } else {
        return `${minutes}:${seconds}`;
    }
}

function clearAllGuesses() {
    const guessCircles = document.querySelectorAll('.circle');
    for (let i = 0; i < guessCircles.length; i++) {
        removeColors(guessCircles[i]);
    }
    const guesses = document.querySelectorAll('.guess');
    for (let i = 0; i < guesses.length; i++) {
        removeColors(guesses[i]);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//Add Listeners
createSelectListeners(guessFields);
applyColorChanges(colorSelectionFields);
guessForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!gameOver && isCompleteGuess(document.querySelector('.guesser').querySelectorAll('.circle'))) {
        const rowNum = document.getElementById(`${currentRow}`);
        const row = rowNum.parentNode;
        const guessFields = row.querySelectorAll('.circle');
        for (let i = 0; i < guessFields.length; i++) {
            const colorClass = findColorClass(document.querySelector('.guesser').querySelectorAll('.circle')[i]);
            guessFields[i].classList.add(colorClass);
        }
        resetFields(document.querySelector('.guesser').querySelectorAll('.circle'));
        checkGuess(row);
        currentRow++;
        if (!gameOver) {
            rowNum.classList.remove('current-row');
            document.getElementById(`${currentRow}`).classList.add('current-row');
        }
    } else if (!gameOver && !isCompleteGuess(document.querySelector('.guesser').querySelectorAll('.circle'))) {
        alert('Please Complete Your Guess');
    }
})
resetBtn.addEventListener('click', () => {
    gameOver = false;
    modalBackground.classList.remove('modal-active');
    answerSection.innerHTML = `<div id="answer-container">
                                    <span id="answer-cover">MASTERMIND</span>
                                </div>`;
    answerSection.classList.add('black');
    document.querySelector('.current-row').classList.remove('current-row');
    currentRow = 1;
    document.getElementById(`${currentRow}`).classList.add('current-row');
    clearAllGuesses();
    resetFields(guessFields);
    generateAnswer();
    startTime = Date.now();
    window.scroll(0, 750);
})

//Initial Render
resetFields(guessFields);
generateAnswer();