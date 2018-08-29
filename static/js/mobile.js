class Mobile {
  constructor(instrument) {
    this.socket = io.connect('http://' + document.domain + ':' + location.port);
    this.instrument = instrument;
    document.getElementById('bandName').innerHTML = window.location.search.split('=')[2];
    document.getElementById('instrument').innerHTML = this.instrument.name;
    if (this.instrument.name == 'electric') {
      document.getElementById('instrument').innerHTML += ' guitar';
    }
    var scope = this;
    var opts = {
      method: 'GET',
      headers: {}
    };
    fetch('/song?song=' + 'seven_nation_army' + '&instrument=' + this.instrument.name, opts).then(function(response) {
      return response.json();
    })
    .then(function(tab) {
      scope.instrument.setup(tab, scope.socket);
      document.getElementById('ready').onclick = function() {
        scope.instrument.activateMobile();
        document.getElementById('cover').style.display = 'none';
        document.getElementById('ready-container').style.display = 'none';
        scope.socket.emit('ready', {
          'id': window.location.search.split('=')[1].split('&')[0],
          'instrument': scope.instrument.name
        });
      }
      scope.socket.on('start', function() {
        scope.instrument.start(false, function() {
          document.getElementById('cover').style.display = 'block';
          document.getElementById('ending').style.display = 'block';
          document.getElementById('highestStreak').innerHTML = scope.instrument.highStreak;
          document.getElementById('endScore').innerHTML = Math.round(scope.instrument.score * 10);
        });
      });
    });
  }
}
