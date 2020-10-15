
function getBrowserId () {
    var aKeys = ["MSIE", "Firefox", "Safari", "Chrome", "Opera"],
        sUsrAg = navigator.userAgent,
        nIdx = aKeys.length - 1;
    
    for (nIdx; nIdx > -1 && sUsrAg.indexOf(aKeys[nIdx]) === -1; nIdx--);

    return nIdx;
}

function canUseWSConnection() {
    var browserSupported = getBrowserId() > 1;
    var MSESupported = (window.MediaSource) ? true : false;
    var isIPhone = navigator.platform == "iPhone";

    return (browserSupported && MSESupported && !isIPhone);
}


function audioWSInputConnection(server, jackChannel, debugMode) {
    
    var mediaSource = new MediaSource();
    var buffer;
    var queue = [];
    var playing = false;
    
    const audio = document.querySelector('audio');
    audio.src = window.URL.createObjectURL(mediaSource);

    const playButton = document.getElementById('play-button');
    playButton.onclick = () => playPause();

    
    function playPause() {
	if (playing) {
	    playing = false;
	    playButton.innerText = "Play";
	    queue = [];
	    audio.pause();
	    if (buffer.duration > 0) { buffer.remove(0, buffer.duration); };
	} else {
	    playing = true;
	    playButton.innerText = "Buffering";
	    playButton.disabled = true;
	    setTimeout(() => {
		playButton.innerText = "Pause";
		playButton.disabled = false;
		audio.play();
	    }, 250);
	}

    }

    audio.addEventListener('error',function(e){ console.error(e); });
    
    mediaSource.addEventListener('sourceopen', function(e) {

//	buffer = mediaSource.addSourceBuffer('audio/webm; codecs="vorbis"');
	buffer = mediaSource.addSourceBuffer('audio/mpeg'); 

	buffer.mode = 'sequence';	
	
//	buffer.appendBuffer(new Uint8Array(webmheadervorbis.buffer));
	
	buffer.addEventListener('update', function() { // Or 'updateend'
	    
	    if (audio.paused && !buffer.updating && (buffer.duration > 0)) {
		buffer.remove(0, buffer.duration);
	    }

	    if (queue.length > 0 && !buffer.updating) {
		buffer.appendBuffer(queue.shift());
	    }
	});


	if (debugMode) {
	    buffer.addEventListener('updatestart', function(e) { console.log('updatestart: ' + mediaSource.readyState); });
	    buffer.addEventListener('update', function(e) { console.log('update: ' + mediaSource.readyState); });
	    buffer.addEventListener('updateend', function(e) { console.log('updateend: ' + mediaSource.readyState); });
	    buffer.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); console.log(e); });
	    buffer.addEventListener('abort', function(e) { console.log('abort: ' + mediaSource.readyState); });
	    
	    
	    mediaSource.addEventListener('sourceopen', function(e) { console.log('sourceopen: ' + mediaSource.readyState); });
	    mediaSource.addEventListener('sourceended', function(e) { console.log('sourceended: ' + mediaSource.readyState); });
	    mediaSource.addEventListener('sourceclose', function(e) { console.log('sourceclose: ' + mediaSource.readyState); });
	    mediaSource.addEventListener('error', function(e) { console.log('error: ' + mediaSource.readyState); });
	};

	
    }, false);


    let websocket = new WebSocket("wss://" + server + ":3012");
    websocket.binaryType = 'arraybuffer';
    websocket.onopen = function (event) {

	websocket.send(JSON.stringify({ channel: jackChannel }));
	
	websocket.addEventListener('message', function(e) {
	    
	    if (buffer.updating || (queue.length > 0) && playing) {
		queue.push(e.data);
	    } else if (playing) {
		buffer.appendBuffer(e.data);
	    }

	}, false);
	
    };

};


export function playAudio(server, jackChannel, debugMode) {
    if (canUseWSConnection()) {
	audioWSInputConnection(server, jackChannel, debugMode);
    } else {
	const audio = document.querySelector('audio');
	audio.src = "https://" + server + ":8443/listen.mp3";

	const playButton = document.getElementById('play-button');
	playButton.onclick = () => playPause();

	var playing = false;
	
	function playPause() {
	    if (playing) {
		playing = false;
		playButton.innerText = "Play";
		audio.pause();
	    } else {
		playing = true;
		playButton.innerText = "Buffering";
		playButton.disabled = true;
		audio.play();
		setTimeout(() => {
		    playButton.innerText = "Pause";
		    playButton.disabled = false;
		}, 500);
	    }
	}

    }
}
