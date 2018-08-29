class Instrument {
  constructor() {
    this.context = Tone.context;
    this.pendingLength = 8;
    this.numCategories = 4;
    this.categories = [];
    this.score = 0;
    this.maxScore = 0;
    this.streak = 0;
    this.highStreak = 0;
    this.pending;
    this.beat;
    this.scoreCategories = [{'description': 'excellent', 'score': 1, 'color': 'green'},
      {'description': 'good', 'score': 0.8, 'color': 'blue'},
      {'description': 'okay', 'score': 0.7, 'color': 'black'},
      {'description': 'miss', 'score': -0.5, 'color': 'red'}
    ];
  }

  activateMobile() {
    var buffer = this.context.createBuffer(1, 1, this.context.sampleRate)
    var source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.context.destination)
    source.start(0)
    if (this.context.resume){
      this.context.resume()
    }
  }

  removeNote() {
    var removed = this.pending.shift();
    var scope = this;
    if (removed.play != undefined) {
      setTimeout(function() {
        scope.removeNoteHelper(removed);
      }, 60 / this.bpm / this.beatDivision * 1000);
    }
  }

  addNote(note, secondsPerBeat) {
    var noteDiv;
    if (note.play != undefined) {
      noteDiv = document.createElement("div");
      noteDiv.classList.add('note');
      noteDiv.style.animationDuration = (this.pendingLength + 1 / this.beatDivision) * secondsPerBeat + 's';
      this.addNoteHelper(noteDiv, note);
    }
    note.beat = this.beat + this.pendingLength;
    this.pending.push(note);
  }

  frequencyAnalysis() {
    var frequency = {};
    this.tab.forEach(function(note) {
      if (note.play != undefined) {
        note.play.forEach(function(string) {
          var stringIndex = string.split('-')[0];
          if (stringIndex in frequency) {
            frequency[stringIndex]++;
          } else {
            frequency[stringIndex] = 0;
          }
        });
      }
    });
    if (Object.keys(frequency).length < this.numCategories) {
      this.categories = [0, 1, 2, 3]
    }
    while (this.categories.length < this.numCategories) {
      var max = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
      delete frequency[max];
      this.categories.push(max)
    }
    this.categories.sort();
  }

  hideNoteHelper(category) {
    var categoryDiv = this.noteContainer.querySelector('.category-' + category);
    categoryDiv.querySelector('.note').classList.add('hidden');
  }

  isNoteHidden(category) {
    var categoryDiv = this.noteContainer.querySelector('.category-' + category);
    if (categoryDiv.querySelector('.note') == null) {
      return false;
    }
    return categoryDiv.querySelector('.note').classList.contains('hidden');
  }

  addNoteHelper(noteDiv, note) {
    var scope = this;
    note.play.forEach(function(note) {
      var noteDivCopy = noteDiv.cloneNode();
      var noteParts = note.split('-');
      var string = noteParts[0];
      var stringIndex = scope.categories.indexOf(string);
      if (stringIndex > -1) {
        scope.noteContainer.querySelector('.category-' + stringIndex).appendChild(noteDivCopy);
      }
    });
  }

  removeNoteHelper(note) {
    var scope = this;
    note.play.forEach(function(note) {
      var noteParts = note.split('-');
      var string = noteParts[0];
      var stringIndex = scope.categories.indexOf(string);
      if (stringIndex > -1) {
        if (!scope.isNoteHidden(stringIndex)) {
          scope.updateScore(undefined, undefined, stringIndex);
        }
        var stringDiv = scope.noteContainer.querySelector('.category-' + stringIndex);
        stringDiv.removeChild(stringDiv.querySelector('.note'));
      }
    });
  }

  findNote(category) {
    var index = 0;
    while (index < this.pending.length) {
      if (this.pending[index].play != undefined && !this.isNoteHidden(category)) {
        var categories = this.pending[index].play;
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].split('-')[0] == this.categories[category]) {
            return index;
          }
        }
      }
      index++;
    }
    return undefined;
  }

  updateScore(differential, correctIndex, category) {
    if (differential == undefined || differential >= this.scoreCategories.length) {
      differential = this.scoreCategories.length - 1;
    } else if (correctIndex != undefined) {
      this.hideNoteHelper(category);
    }

    if (differential >= this.scoreCategories.length - 1) {
      if (this.streak > this.highStreak) {
        this.highStreak = this.streak;
      }
      this.streak = 0;
    } else {
      this.streak++;
    }

    document.getElementById('streak').innerHTML = this.streak + 'x';

    if (this.score + this.scoreCategories[differential].score < 0) {
      this.score = 0;
    } else {
      if (this.streak == 0) {
        this.score += this.scoreCategories[differential].score;
      } else {
        this.score += this.scoreCategories[differential].score * this.streak / 10;
      }
    }
    var roundedScore = Math.round( this.score * 10);

    this.socket.emit('scoreUpdate', {'score': roundedScore, 'instrument': this.name});
    document.getElementById('score').innerHTML = roundedScore;
    var status = document.getElementById('status').querySelector('.status-' + category)
    var newStatus = document.createElement('div');
    newStatus.appendChild(document.createTextNode(this.scoreCategories[differential].description));
    newStatus.classList.add('fadeout');
    newStatus.style.color = this.scoreCategories[differential].color;
    setTimeout(function() {
      newStatus.parentNode.removeChild(newStatus);
    }, 500);
    status.prepend(newStatus);
  }

  autoPlayHelper(note, secondsPerBeat) {
    var scope = this;

    if (note.play != undefined) {
      note.play.forEach(function(string) {
        if (string) {
          scope.play(string, note.duration * secondsPerBeat);
        }
      });
    }
  }

  setupControls() {
    var scope = this;
    var instructionDiv = document.querySelector('#' + this.name);
    var controlDiv = document.querySelector('#controls');
    var statusDiv = document.querySelector('#status');
    instructionDiv.classList.add('instruction');
    for (var index = 0; index < this.numCategories; index++) {
      let categoryDiv = document.createElement('div');
      categoryDiv.classList.add('category');
      categoryDiv.classList.add('category-' + index);
      instructionDiv.appendChild(categoryDiv);

      let status = document.createElement('div');
      status.classList.add('status');
      status.classList.add('status-' + index);
      statusDiv.appendChild(status);

      let controlIndex = index;
      let control = document.createElement('div');
      control.classList.add('control');
      control.classList.add('control-' + index);
      control.addEventListener('touchstart', function() {
        this.classList.add('control-active');
        var correctIndex = scope.findNote(controlIndex);
        if (correctIndex != undefined) {
          var correct = scope.pending[correctIndex].beat;
          var differential = Math.abs(scope.beat + (1 / scope.beatDivision) - correct) * scope.beatDivision;
        } else {

        }
        scope.updateScore(differential, correctIndex, controlIndex);
      }, {'passive': true});
      control.addEventListener('touchend', function() {
        this.classList.remove('control-active');
      }, {'passive': true});
      controlDiv.appendChild(control);
    };
  }

  setupTab(tab) {
    var notes = [];
    this.bpm = tab.bpm;
    this.beatDivision = tab.beatDivision;
    var scope = this;
    tab.sheet.forEach(function(sheet) {
      for (var index = 0; index < sheet.split(':')[1]; index++) {
        tab.measures[sheet.split(':')[0]].forEach(function(note) {
          var noteParts = note.split(':');
          var play = noteParts[0];
          if (play == '') {
            play = undefined;
          } else {
            play = play.split(',');
            scope.maxScore += 1;
          }
          var duration = parseFloat(noteParts[1]);
          notes.push({'play': play, 'duration': duration});
        });
      }
    });

    this.tab = notes;
  }

  setup(tab, socket) {
    this.noteContainer = document.getElementById(this.name);
    this.setupTab(tab);

    this.socket = socket;

    this.frequencyAnalysis();
    this.setupControls();
  }

  start(soundOnly, endFunction) {
    var curr = 0;
    var hold = 0;
    var secondsPerBeat = 60 / this.bpm;
    var secondsPerDivision = secondsPerBeat / this.beatDivision;
    var duration = 1;
    this.beat = -1 * this.pendingLength;
    var scope = this;

    if (!soundOnly) {
      this.pending = [];
      var pendingBeats = this.tab[curr].duration;
      this.addNote(this.tab[curr], secondsPerBeat);
    }

    this.auto = setInterval(function() {
      scope.beat += 1 / scope.beatDivision;

      if (!soundOnly && scope.pendingLength + scope.beat == pendingBeats) {
        pendingBeats += scope.tab[curr + scope.pending.length].duration;
        scope.addNote(scope.tab[curr + scope.pending.length], secondsPerBeat);
      }

      if (scope.beat < 0) {
        return;
      }

      if (hold == duration - 1) {
        duration = scope.tab[curr].duration * scope.beatDivision;

        scope.autoPlayHelper(scope.tab[curr], secondsPerBeat);

        if(!soundOnly) {
          scope.removeNote();
        }

        hold = 0;
        curr++;
        if (curr >= scope.tab.length) {
          clearInterval(scope.auto);
          if (endFunction != undefined) {
            endFunction();
          }
        }
      } else {
        hold++;
      }
    }, secondsPerDivision * 1000);
  }

  stop() {
    clearInterval(this.auto);
  }
}

class StringInstrument extends Instrument {
  constructor(folder, samples, filetype, notes) {
    super();
    var sampleDict = {}
    samples.forEach(function(sample) {
      sampleDict[sample.replace('s', '#')] = sample + '.' + filetype;
    });
    this.instrument = new Tone.Sampler(sampleDict, {
      'release': 1,
      'baseUrl': folder
    }).toMaster();
    this.notes = notes;
  }

  play(note, duration) {
    var soundBite = {'instrument': this.constructor.name, 'note': note}
    var noteParts = note.split('-');
    var stringIndex = noteParts[0];
    var fretIndex = noteParts[1];
    this.instrument.triggerAttackRelease(this.notes[stringIndex][fretIndex], duration);
  }
}

if ('addEventListener' in document) {
	document.addEventListener('DOMContentLoaded', function() {
		FastClick.attach(document.body);
	}, false);
}
