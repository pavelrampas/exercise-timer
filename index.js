// variables ------------------------------------------------------------------

const textarea = document.getElementById('textarea');
const timer = document.getElementById('timer');
const actual = document.getElementById('actual');
const next = document.getElementById('next');

const storeExercises = 'exercises';

const typePause = 'pause';
const typeExercise = 'exercise';
const colorPause = 'pause-color';
const colorExercise = 'exercise-color';

let data = [];

let stoptime = true;
let sec = 0;
let index = 0;

var audio = new Audio('whistle.mp3');

// code -----------------------------------------------------------------------

if (localStorage.getItem(storeExercises)) {
  textarea.value = localStorage.getItem(storeExercises);
}

// onclick functions ----------------------------------------------------------

document.getElementById('save').onclick = function clickSave(e) {
  localStorage.setItem(storeExercises, textarea.value);
};

document.getElementById('start').onclick = function clickStart(e) {
  reset();

  data = parseTextarea(localStorage.getItem(storeExercises).split('\n'));

  setUpAction(0);

  stoptime = false;
  timerCycle();
};

document.getElementById('pause').onclick = function clickPause(e) {};

document.getElementById('stop').onclick = function clickStop(e) {
  reset();
};

// functions ------------------------------------------------------------------

function timerCycle() {
  if (stoptime === false) {
    if (sec === 1) {
      audio.play();
    }

    if (sec === 0) {
      if (index + 1 < data.length) {
        setUpAction(index + 1);
      } else {
        setUpAction(0);
      }
    }

    sec = parseInt(sec) - 1;
    timer.innerHTML = sec;

    setTimeout('timerCycle()', 1000);
  }
}

function setUpAction(newIndex) {
  sec = data[newIndex].time + 1;
  index = newIndex;

  actual.innerText = data[newIndex].value;
  resetColors();
  if (data[newIndex].type === typeExercise) {
    actual.classList.add(colorExercise);
    timer.classList.add(colorExercise);
  } else {
    actual.classList.add(colorPause);
    timer.classList.add(colorPause);
  }

  if (newIndex + 1 < data.length) {
    next.innerText = data[newIndex + 1].value;
  } else {
    next.innerText = data[0].value;
  }
}

function reset() {
  stoptime = true;
  sec = 0;
  index = 0;
  timer.innerHTML = sec;
  actual.innerText = '-';
  next.innerText = '-';
  resetColors();
}

function resetColors() {
  actual.classList.remove(colorExercise);
  actual.classList.remove(colorPause);
  timer.classList.remove(colorPause);
  timer.classList.remove(colorExercise);
}

function parseTextarea(data) {
  exercise = [];
  data.forEach(function (element) {
    lineType = typeExercise;
    if (element.charAt(0) === '-') {
      lineType = typePause;
    }

    splitData = element.split(';');

    exercise.push({
      type: lineType,
      value: splitData[0].substring(1),
      time: parseInt(splitData[1]),
    });
  });

  return exercise;
}
