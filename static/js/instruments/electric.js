class Electric extends StringInstrument {
  constructor(strumOnly = false) {
    super(
      '/static/sounds/electric/', ['A1', 'B2', 'D2', 'E1', 'E3', 'G2'],
      'm4a', [
        ['E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4',
          'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5'
        ],
        ['B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3',
          'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4'
        ],
        ['G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3',
          'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4'
        ],
        ['D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3',
          'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'
        ],
        ['A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2',
          'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3'
        ],
        ['E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2',
          'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3'
        ]
      ], strumOnly
    );
    this.name = 'electric';
    // var overdrive = new Tone.WaveShaper(function(amount, i) {
    //   amount = Math.min(amount, 0.9999);
    //   var k = 2 * amount / (1 - amount),
    //       i, x;
    //   x = i * 2 / 1024 - 1;
    //   return (1 + k) * x / (1 + k * Math.abs(x));
    // });
    function sign(x) {
      if (x === 0) {
        return 1;
      } else {
        return Math.abs(x) / x;
      }
    }
    var overdrive = new Tone.WaveShaper(function(amount, i) {
      var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
      x = i * 2 / 1024 - 1;
      abx = Math.abs(x);
      if (abx < a) y = abx;
      else if (abx > a) y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
      else if (abx > 1) y = abx;
      return sign(x) * y * (1 / ((a + 1) / 2));
    });
    var dist = new Tone.Distortion(0.8);
    dist._shaper = overdrive;
    dist.toMaster();
    this.instrument.connect(dist);
  }
}
