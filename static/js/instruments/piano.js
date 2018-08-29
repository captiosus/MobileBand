class Piano extends Instrument {
  constructor() {
    var notes = ['A0', 'B0'];
    var order = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    for (var index = 1; index < 8; index++) {
      order.forEach(function(note) {
        notes.push(note + index);
      });
    }
    var samples = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'C1', 'C2', 'C3', 'C4',
     'C5', 'C6', 'C7', 'C8', 'Ds1', 'Ds2', 'Ds3', 'Ds4', 'Ds5', 'Ds6', 'Ds7',
     'Fs1', 'Fs2', 'Fs3', 'Fs4', 'Fs5', 'Fs6', 'Fs7'];
    var sampleDict = {}
    samples.forEach(function(sample) {
      sampleDict[sample.replace('s', '#')] = sample + '.mp3';
    });
    this.instrument = new Tone.Sampler(sampleDict, {
      'release': 1,
      'baseUrl': '/static/sounds/piano/'
    }).toMaster();
    this.notes = notes;
    this.started = false;
    this.blackKeysHidden = [0, 2, 5, 9, 12, 16, 19, 23, 26, 30, 33, 37, 40, 44, 47, 51, 52];
    this.position = 23;
  }

  setup(whiteKeyClass, blackKeyClass) {
    this.blackKeyClass = blackKeyClass;
    var setupBlackKeys = function() {
      var offset = -25;
      var width = window.innerWidth;
      var amount = document.querySelectorAll('.' + blackKeyClass).length - 1;
      document.querySelectorAll('.' + blackKeyClass).forEach(function(blackKey) {
        blackKey.style.left = offset + 'px';
        offset += width / amount;
      });
    }
    window.onresize = setupBlackKeys;
    setupBlackKeys();
    this.hideBlackKeys();

    var scope = this;
    document.querySelectorAll('.' + whiteKeyClass).forEach(function(whiteKey, keyIndex) {
      whiteKey.addEventListener('touchstart', function(e) {
        scope.activateMobile();
        scope.instrument.triggerAttack(scope.notes[keyIndex + scope.position]);
        this.classList.add('key-active');
      });

      whiteKey.addEventListener('touchend', function(e) {
        scope.instrument.triggerRelease(scope.notes[keyIndex + scope.position]);
        this.classList.remove('key-active');
      });
    });

    document.querySelectorAll('.' + blackKeyClass).forEach(function(blackKey, keyIndex) {
      blackKey.addEventListener('touchstart', function(e) {
        var note = scope.notes[keyIndex + scope.position - 1];
        var sharp = note.slice(0, 1) + '#' + note.slice(1);
        scope.instrument.triggerAttack(sharp);
        this.classList.add('key-active');
      });

      blackKey.addEventListener('touchend', function(e) {
        var note = scope.notes[keyIndex + scope.position - 1];
        var sharp = note.slice(0, 1) + '#' + note.slice(1);
        scope.instrument.triggerRelease(sharp);
        this.classList.remove('key-active');
      });
    });
  }

  hideBlackKeys() {
    var scope = this;
    document.querySelectorAll('.' + this.blackKeyClass).forEach(function(blackKey, keyIndex) {
      blackKey.classList.remove('hidden');
      if (scope.blackKeysHidden.includes(keyIndex + scope.position)) {
        blackKey.classList.add('hidden');
      }
    });
  }

  shift(amount) {
    super.shift(amount);
    this.hideBlackKeys();
  }

  autoPlayHelper() {

  }
}
