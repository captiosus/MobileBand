class Acoustic extends StringInstrument {
  constructor(strumOnly=false) {
    super('/static/sounds/acoustic/', ['A1', 'B2', 'D2', 'E1', 'E3', 'G2'],
      'm4a', [
        ['E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4',
          'D#4', 'E4', 'F4', 'F#4', 'G4'
        ],
        ['B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3',
          'A#3', 'B3', 'C4', 'C#4', 'D4'
        ],
        ['G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3',
          'F#3', 'G3', 'G#3', 'A3', 'A#3'
        ],
        ['D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3',
          'C#3', 'D3', 'D#3', 'E3', 'F3'
        ],
        ['A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2',
          'G#2', 'A2', 'A#2', 'B2', 'C3'
        ],
        ['E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2',
          'D#2', 'E2', 'F2', 'F#2', 'G2'
        ]
      ], strumOnly
    );
    this.name = 'acoustic';
  }
}
