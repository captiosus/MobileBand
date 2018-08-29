from flask import Flask, jsonify, render_template, request, redirect
from flask_socketio import SocketIO, emit
import json
import os
import random
import redis
import uuid
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
rdb = redis.StrictRedis(host='localhost', port=6379, db=0)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/song', methods=['GET'])
def song():
    if 'song' not in request.args:
        return jsonify('{"error": "error"}')
    folder = './songs/' + request.args['song']
    instruments = os.listdir(folder)

    if 'instrument' in request.args:
        instrument = request.args['instrument']
        with open(os.path.join(folder, instrument + '.json')) as tab:
            return jsonify(json.loads(tab.read()))

    if 'name' in request.args:
        instrument_names = []
        id = str(uuid.uuid4())
        for instrument in instruments:
            instrument = instrument.split('.')[0]
            instrument_names.append(instrument)
            rdb.set(id + ':' + instrument + ':pending', 1)
            rdb.set(id + ':' + instrument + ':ready', 0)
        rdb.set(id + ':' + 'instruments', ','.join(instrument_names))
        rdb.set(id + ':' + 'name', request.args['name'])
        result = {'instruments': instrument_names, 'id': id}
        return jsonify(result)


@app.route('/join', methods=['GET'])
def join():
    if not ('id' in request.args and request.args['id']):
        return render_template('error.html', error='No Id')
    else:
        key = request.args['id'] + ':' + 'instruments'
        instruments = rdb.get(key).decode("utf-8").split(',')
        choices = []
        for instrument in instruments:
            pending = request.args['id'] + ':' + instrument + ':pending'
            if rdb.get(pending) == b'1':
                choices.append(instrument)
        if not len(choices):
            return render_template('error.html', error='No More Spaces')
        choice = random.choice(choices)
        rdb.set(request.args['id'] + ':' + choice + ':pending', 0)
        args = '?id=' + request.args['id'] + '&name=' + request.args['name']
        return redirect('/' + choice + args)


@app.route('/piano')
def piano():
    return render_template('piano.html')


@app.route('/bass')
def bass():
    return render_template('bass.html')


@app.route('/electric')
def electric():
    return render_template('electric.html')


@app.route('/acoustic')
def acoustic():
    return render_template('acoustic.html')


@app.route('/drumkit')
def drumkit():
    return render_template('drum.html')


@socketio.on('connect')
def connect():
    print('connected')


@socketio.on('ready')
def ready(data):
    emit('ready', data['instrument'], broadcast=True)
    rdb.set(data['id'] + ':' + data['instrument'] + ':ready', 1)
    key = data['id'] + ':' + 'instruments'
    instruments = rdb.get(key).decode("utf-8").split(',')
    all_ready = True
    for instrument in instruments:
        ready = data['id'] + ':' + instrument + ':ready'
        if rdb.get(ready) == b'0':
            all_ready = False
    if all_ready:
        emit('all_ready', broadcast=True)


@socketio.on('start')
def start():
    emit('start', broadcast=True)


@socketio.on('scoreUpdate')
def sound(data):
    emit('scoreUpdate', data, broadcast=True)
