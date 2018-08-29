class Band {
  constructor(song, instruments, endFunction) {
    this.instruments = {};
    this.endFunction = endFunction;
    this.ended = 0;
    var scope = this;

    if (instruments.includes('bass')) {
      this.instruments['bass'] = new Bass();
    }
    if (instruments.includes('electric')) {
      this.instruments['electric'] = new Electric();
    }
    if (instruments.includes('acoustic')) {
      this.instruments['acoustic'] = new Acoustic();
    }
    if (instruments.includes('drumkit')) {
      this.instruments['drumkit'] = new DrumKit();
    }
    if (instruments.includes('piano')) {
      this.instruments['piano'] = new Piano();
    }

    var opts = {
      method: 'GET',
      headers: {}
    };
    var scope = this;

    for (let instrument in this.instruments) {
      fetch('/song?song=' + song + '&instrument=' + instrument, opts).then(function(response) {
        return response.json();
      })
      .then(function(body) {
        scope.instruments[instrument].setupTab(body);
        scope.instruments[instrument].activateMobile();
      });
    };
  }

  start() {
    var scope = this;
    for (let name in this.instruments) {
      this.instruments[name].start(true, function() {
        scope.ended++;
        if (scope.ended == Object.keys(scope.instruments).length) {
          scope.endFunction();
        }
      });
    }
  }

  stop() {
    for (let name in this.instruments) {
      this.instruments[name].stop();
    }
  }
}

window.onload = function() {
  var fakeQr = new QRCode(document.getElementById('qrcode'));
  var name;
  var song;
  var tabInstruments;
  var posterObj = document.getElementById('poster');
	var poster = posterObj.contentDocument;
  var stageObj = document.getElementById('stage');
	var stage = stageObj.contentDocument;
  var instruments = ['drumkit', 'guitar', 'bass', 'piano', 'vocal'];
  var socket = io.connect('http://' + document.domain + ':' + location.port);

  function stagePosition() {
    var offsetX = document.getElementById('stage').offsetLeft;

    var bassPosition = stage.getElementById('bassScore').getBoundingClientRect();
    document.getElementById('bassScore').style.top = bassPosition.top + 'px';
    document.getElementById('bassScore').style.left = bassPosition.left + offsetX + 'px';
    document.getElementById('bassScore').style.width = bassPosition.width + 'px';
    document.getElementById('bassScore').style.height = bassPosition.height + 'px';
    document.getElementById('bassScore').style.lineHeight = bassPosition.height + 'px';

    var drumkitPosition = stage.getElementById('drumkitScore').getBoundingClientRect();
    document.getElementById('drumkitScore').style.top = drumkitPosition.top + 'px';
    document.getElementById('drumkitScore').style.left = drumkitPosition.left + offsetX + 'px';
    document.getElementById('drumkitScore').style.width = drumkitPosition.width + 'px';
    document.getElementById('drumkitScore').style.height = drumkitPosition.height + 'px';
    document.getElementById('drumkitScore').style.lineHeight = drumkitPosition.height + 'px';

    var guitarPosition = stage.getElementById('guitarScore').getBoundingClientRect();
    document.getElementById('guitarScore').style.top = guitarPosition.top + 'px';
    document.getElementById('guitarScore').style.left = guitarPosition.left + offsetX + 'px';
    document.getElementById('guitarScore').style.width = guitarPosition.width + 'px';
    document.getElementById('guitarScore').style.height = guitarPosition.height + 'px';
    document.getElementById('guitarScore').style.lineHeight = guitarPosition.height + 'px';
  }

  function generateQR(id) {
    fakeQr.makeCode('http://' + document.domain + ':' + location.port + '/join?id=' + id + '&name=' + name);
    poster.getElementById('qrimg').setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', document.getElementById('qrcode').querySelector('canvas').toDataURL());
  }

  function position() {
    var namePosition = poster.getElementById('bandName').getBoundingClientRect();
    var songPosition = poster.getElementById('bandSong').getBoundingClientRect();
    var offsetX = document.getElementById('poster').offsetLeft;
    document.getElementById('bandName').style.top = namePosition.top * 1.05 + 'px';
    document.getElementById('bandName').style.left = namePosition.left * 0.7 + offsetX + 'px';
    document.getElementById('bandSong').style.top = songPosition.top * 1.05 + 'px';
    document.getElementById('bandSong').style.left = songPosition.left * 0.7 + offsetX + 'px';

    var qrcodePosition = poster.getElementById('qrcode').getBoundingClientRect();
    document.getElementById('start').style.width = qrcodePosition.width + 'px';
    document.getElementById('start').style.height = qrcodePosition.height + 'px';
    document.getElementById('start').style.top = qrcodePosition.top + 'px';
    document.getElementById('start').style.left = qrcodePosition.left + offsetX + 'px';
  }

  function fetchQR() {
    var opts = {
      method: 'GET',
      headers: {}
    };
    fetch('/song?song=' + song + '&name=' + name, opts).then(function(response) {
      return response.json();
    })
    .then(function(body) {
      tabInstruments = body.instruments.slice();
      generateQR(body.id);
      if (body.instruments.includes('electric') || body.instruments.includes('acoustic')) {
        body.instruments.push('guitar');
      }
      instruments.forEach(function(instrument) {
        if (!body.instruments.includes(instrument)) {
          poster.getElementById(instrument).style.opacity = 0;
        }
      });
    });
  }

  var endScreen = function() {
    var animations = stage.getElementsByClassName('animated');
    document.getElementById('scores').style.display = 'none';
    for (let i = 0; i < animations.length; i++){
      animations[i].style.animation = 'none';
    }
    document.getElementById('bassScoreEnd').innerHTML = document.getElementById('bassScore').innerHTML;
    document.getElementById('drumkitScoreEnd').innerHTML = document.getElementById('drumkitScore').innerHTML;
    document.getElementById('guitarScoreEnd').innerHTML = document.getElementById('guitarScore').innerHTML;
    setTimeout(function() {
      var applause = new Audio('/static/sounds/ambience/applause.mp3');
      applause.play();
      var curtains = stage.getElementById('curtain').querySelectorAll('image')
      curtains[0].classList.add('close-curtain-right');
      curtains[1].classList.add('close-curtain-left');
      curtains[0].classList.remove('open-curtain-right');
      curtains[1].classList.remove('open-curtain-left');
    }, 2000);
    setTimeout(function() {
      document.getElementById('cover').style.display = 'block';
      document.getElementById('ending').style.display = 'block';
    }, 7000);
  }

  generateQR(0);
  position();
  this.onresize = function() {
    position();
  }
  document.getElementById('bandName').focus();
  document.getElementById('bandSong').onclick = function() {
    this.style.color = 'black';
  }
  document.getElementById('bandName').onblur = function() {
    name = this.value
    if (song != undefined) {
      fetchQR();
    }
  }
  document.getElementById('bandSong').onblur = function() {
    song = this.value
    if (name != undefined) {
      fetchQR();
    }
  }
  socket.on('ready', function(instrument) {
    if (instrument == 'electric' || instrument == 'acoustic') {
      instrument = 'guitar';
    }
    poster.getElementById(instrument).style.opacity = 1;
  });

  var scope = this;
  socket.on('all_ready', function(instrument) {
    document.getElementById('start').style.display = 'block';
    poster.getElementById('qrcode').style.opacity = 0;
    var band = new Band(song, tabInstruments, endScreen);
    document.getElementById('start').onclick = function() {
      document.getElementById('poster').style.opacity = 0;
      document.getElementById('posterInputs').style.opacity = 0;
      document.getElementById('stage').style.display = 'block';
      setTimeout(function() {
        document.getElementById('poster').style.display = 'none';
        document.getElementById('posterInputs').style.display = 'none';
        document.getElementById('stage').style.opacity = 1;
        var cheering = new Audio('/static/sounds/ambience/cheering.wav');
        cheering.play();
        stage = stageObj.contentDocument;
      }, 500);
      setTimeout(function() {
        stagePosition();
        document.getElementById('scores').style.display = 'block';
        scope.onresize = function() {
          stagePosition();
        }
        band.start();
        setTimeout(function() {
          var animations = stage.getElementsByClassName('animated');
          for (let i = 0; i < animations.length; i++){
            animations[i].style.animationPlayState = 'running';
          }
        }, 3000);
        socket.emit('start');
      }, 4000);
    }
  });
  socket.on('scoreUpdate', function(data) {
    var instrument = data['instrument'];
    if (instrument == 'electric' || instrument == 'acoustic') {
      instrument = 'guitar';
    }
    document.getElementById(instrument + 'Score').innerHTML = data['score'];
  })
};
