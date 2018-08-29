class DrumKit extends Instrument {
  constructor() {
    super();
    this.name = 'drumkit';
    this.players = new Tone.Players(
      {'BD': '/static/sounds/drum/bass.mp3',
       'FT': '/static/sounds/drum/lowtom.mp3',
       'T2': '/static/sounds/drum/midtom.mp3',
       'T1': '/static/sounds/drum/hitom.mp3',
       'S': '/static/sounds/drum/snare.mp3',
       'CC': '/static/sounds/drum/crash.mp3',
       'Rd': '/static/sounds/drum/ride.mp3',
       'fH': '/static/sounds/drum/hihat.mp3',
       'HH': '/static/sounds/drum/hihat.mp3'
     }
    ).toMaster()
    this.players.volume.value = -12;
    this.players.get('CC').volume.value = 0;
    this.players.get('BD').volume.value = +24;
  }

  play(note, duration) {
    this.players.get(note).start(undefined, 0, duration);
  }
}
