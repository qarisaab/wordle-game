const letters = document.querySelectorAll(".scoreboard-letter   ");
const loadingDiv = document.querySelector(".info-bar");
const ROUNDS = 6;
function isLetter(word) {
  return /^[a-zA-Z]$/.test(word);
}

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let done = false;
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  setLoading(true);

  function addLetter(letter) {
    if (currentGuess.length < 5) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[5 * currentRow + currentGuess.length - 1].innerText = letter;
  }

  async function commit() {
    if (currentGuess.length !== 5) {
      // do nothing
      return;
    }

    const res = await fetch(`https://words.dev-apis.com/validate-word`, {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();
    const { validWord } = resObj;

    if (!validWord) {
      markinvalidword();
    }

    const guessParts = currentGuess.split("");
    const map = makemap(wordParts);

    for (let i = 0; i < 5; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * 5 + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * 5 + i].classList.add("close");
      } else {
        letters[currentRow * 5 + i].classList.add("wrong");
      }
    }
    currentRow++;
    if (currentGuess === word) {
      // win
      alert("you win");
      done = true;
      return;
    }
    if (currentRow === ROUNDS) {
      alert(`you lost the word was ${word}`);
      done = true;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[5 * currentRow + currentGuess.length].innerText = "";
  }

  function markinvalidword() {
    alert("not a valid word");
    return;
  }

  document.addEventListener("keydown", (e) => {
    if (done) {
      return;
    }

    const action = e.key;

    switch (action) {
      case "Enter":
        commit();
        break;
      case "Backspace":
        backspace();
        break;
      default:
        if (isLetter(action)) {
          addLetter(action.toUpperCase());
        } else {
          // do Nothing
        }
    }
  });
}

function makemap(arr) {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (obj[arr[i]]) {
      obj[arr[i]]++;
    } else {
      obj[arr[i]] = 1;
    }
  }
  return obj;
}

function setLoading(isloading) {
  loadingDiv.classList.toggle("hidden", isloading);
}

init();
