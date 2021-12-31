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

const audio = new Audio('whistle.mp3');

let data = [];

let stoptime = true;
let sec = 0;
let index = 0;

let wakeLock = null;

// code -----------------------------------------------------------------------

if (localStorage.getItem(storeExercises)) {
  textarea.value = localStorage.getItem(storeExercises);
} else {
  textarea.value =
    '-příprava;10\n' + '+kliky;30\n' + '-pauza;20\n' + '+dřepy;30\n';
}

// onclick functions ----------------------------------------------------------

document.getElementById('save').onclick = function clickSave(e) {
  localStorage.setItem(storeExercises, textarea.value);
};

document.getElementById('start').onclick = function clickStart(e) {
  localStorage.setItem(storeExercises, textarea.value);

  reset();

  data = parseTextarea(localStorage.getItem(storeExercises).split('\n'));

  if ('wakeLock' in navigator) {
    wakeLockRequest();
  } else {
    console.log('The Wake Lock is not supported');
  }

  setUpAction(0);

  stoptime = false;
  timerCycle();
};

document.getElementById('pause').onclick = function clickPause(e) {
  // TODO
};

document.getElementById('stop').onclick = function clickStop(e) {
  reset();

  wakeLockRelease();
};

// functions ------------------------------------------------------------------

async function wakeLockRequest() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    console.log(err);
    console.log('The Wake Lock request has failed');
  }
}

function wakeLockRelease() {
  try {
    wakeLock.release().then(() => {
      wakeLock = null;
    });
  } catch (err) {
    console.log(err);
    console.log('The Wake Lock release has failed');
  }
}

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
