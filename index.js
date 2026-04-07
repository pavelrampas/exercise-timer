// variables ------------------------------------------------------------------

const textareas = [
  document.getElementById('textarea1'),
  document.getElementById('textarea2'),
  document.getElementById('textarea3'),
];
const tabButtons = [
  document.getElementById('tab1'),
  document.getElementById('tab2'),
  document.getElementById('tab3'),
];
const timer = document.getElementById('timer');
const actual = document.getElementById('actual');
const next = document.getElementById('next');

const storeExercises = ['exercises1', 'exercises2', 'exercises3'];

const typePause = 'pause';
const typeExercise = 'exercise';
const colorPause = 'pause-color';
const colorExercise = 'exercise-color';

const audio = new Audio('whistle.mp3');

let activeTab = 0;

let data = [];

let stoptime = true;
let pause = false;
let sec = 0;
let index = 0;

let wakeLock = null;

// code -----------------------------------------------------------------------

textareas.forEach(function (textarea, i) {
  if (i !== activeTab) {
    textarea.style.display = 'none';
  }
  if (localStorage.getItem(storeExercises[i])) {
    textarea.value = localStorage.getItem(storeExercises[i]);
  } else if (i === 0) {
    textarea.value =
      '-příprava;10\n' + '+kliky;30\n' + '-pauza;20\n' + '+dřepy;30\n';
  }
});

// onclick functions ----------------------------------------------------------

document.getElementById('save').onclick = function clickSave(e) {
  localStorage.setItem(storeExercises[activeTab], textareas[activeTab].value);
};

tabButtons.forEach(function (button, i) {
  button.onclick = function () {
    switchTab(i);
  };
});

function switchTab(i) {
  textareas[activeTab].style.display = 'none';
  tabButtons[activeTab].classList.remove('active');
  activeTab = i;
  textareas[activeTab].style.display = '';
  tabButtons[activeTab].classList.add('active');
}

document.getElementById('start').onclick = function clickStart(e) {
  if (stoptime === true && pause === false) {
    localStorage.setItem(storeExercises[activeTab], textareas[activeTab].value);

    reset();

    data = parseTextarea(
      localStorage.getItem(storeExercises[activeTab]).split('\n')
    );

    if ('wakeLock' in navigator) {
      wakeLockRequest();
    } else {
      console.log('The Wake Lock is not supported');
    }

    setUpAction(0);

    stoptime = false;
    timerCycle();
  } else if (stoptime === true && pause === true) {
    unPause();
  }
};

document.getElementById('pause').onclick = function clickPause(e) {
  if (stoptime == false && pause === false) {
    stoptime = true;
    pause = true;
  } else if (stoptime === true && pause === true) {
    unPause();
  }
};

document.getElementById('stop').onclick = function clickStop(e) {
  reset();

  wakeLockRelease();
};

// functions ------------------------------------------------------------------

function unPause() {
  if (stoptime === true && pause === true) {
    stoptime = false;
    pause = false;
    timerCycle();
  }
}

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

    setTimeout(timerCycle, 1000);
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
  pause = false;
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
