/**
 * Created by ari on 5/28/2015.
 */

//(function() {

    var NOTE_INTERVAL = 10;

    var onPlay = function(e) {

    };

    var onNote = function(e) {
        var offset = e.detail.offset || 0;
        var length = e.detail.length || 0;
        var frequency = e.detail.frequency || 0;
        var velocity = e.detail.velocity || 0;
        var channel = e.detail.channel || 0;
        var instrument = e.detail.instrument || 0;
        var type = e.detail.type || 0;

        var noteInfo = playNote(offset, length, frequency, velocity, channel, instrument, type);
        e.detail.note = noteInfo[0];
        e.detail.gain = noteInfo[1];

    };

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var channels = [];
    var curChannel = 0;
    var maxChannels = 4;

    var playNote = function(offset, length, frequency, velocity, channel, instrument, type) {

        if(typeof channel === 'undefined') {
            curChannel++;
            if(curChannel > maxChannels)
                curChannel = 0;
            channel = curChannel;
        }
        if(typeof channels[channel] === 'undefined') {
            channels[channel] = audioCtx.createGain();
            channels[channel].connect(audioCtx.destination);
        }
        var gainNode = channels[channel];

        // create Oscillator and gain node
        var oscillator = audioCtx.createOscillator();
        oscillator.connect(gainNode);

        
//         var panner = audioCtx.createPanner();
//         panner.panningModel = 'equalpower';
//         panner.connect(audioCtx.destination);

        oscillator.type = type || 'sawtooth';
        oscillator.frequency.value = frequency || 130.81; // value in hertz
//         oscillator.detune.value = detune || 100; // value in cents
        oscillator.start(audioCtx.currentTime + offset);
        if(length > 0) {
            oscillator.stop(audioCtx.currentTime + length);
        }

        return [oscillator, gainNode];
    };

    var noteQueue = [];
    var masterTime = 0;
    var doPlayMusic = function(e) {
        var newQueue = [];
        for(var i=0; i<noteQueue.length; i++) {
            var noteTime = noteQueue[i][0];
            if(noteTime > masterTime + NOTE_INTERVAL) {
                newQueue.push(noteQueue[i]);
                continue;
            }
            var note = noteQueue[i];
            note[0] = masterTime - noteTime;
            playNote.apply(playNote, note);
        }
        noteQueue = newQueue;
    };

    document.addEventListener('play', onPlay, false);
    document.addEventListener('note', onNote, false);


    var playInterval = setInterval(doPlayMusic, NOTE_INTERVAL);

    var pause = function() {
        clearInterval(playInterval);
    };
    var resume = function() {
        clearInterval(playInterval);
        playInterval = setInterval(doPlayMusic, NOTE_INTERVAL)
    };

//})();