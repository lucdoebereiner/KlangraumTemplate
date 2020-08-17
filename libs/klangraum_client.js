export function klangraumConnect(url, onmessageFunc) {

//     let socket = new WebSocket("wss://static.184.12.47.78.clients.your-server.de:8800");
//    let socket = new WebSocket("ws://localhost:8800");
    
    let socket = new WebSocket(url);
    const mp3encoder = new lamejs.Mp3Encoder(1, 44100, 128);

    const CHUNK_LENGTH = 1152;
    
    socket.onmessage = onmessageFunc;
    
    socket.onopen = function (event) {	 
	
	navigator.mediaDevices.getUserMedia({
	    audio: {
		sampleRate: 44100,
		channelCount: 1,
		echoCancellation: false,
		noiseSuppression: false,
		autoGainControl: false
	    },
	    video : false
	})
	    .then(function(stream) {
		
		const context = new AudioContext({ sampleRate: 44100 });
		const source = context.createMediaStreamSource(stream);
		const processor = context.createScriptProcessor(16384, 1, 1);
		
		source.connect(processor);
		processor.connect(context.destination);
		
		let toDecode = new Int16Array(CHUNK_LENGTH);
		let toDecodeI = 0;
		processor.onaudioprocess = function(e) {
		    let audioData = e.inputBuffer.getChannelData(0);
		    for (let i = 0; i < audioData.length; i++) {
			
			if (toDecodeI >= CHUNK_LENGTH) {
			    let mp3Chunk = mp3encoder.encodeBuffer(toDecode);
			    socket.send(mp3Chunk);
			    //				  console.log('sending chunk with length ', mp3Chunk.length);
			    toDecode = new Int16Array(CHUNK_LENGTH);
			    toDecodeI = 0;
			}
			
			let sampleFloat = audioData[i];
			let sample = sampleFloat > 0 ? sampleFloat*0x7FFF : sampleFloat*0x8000;
			
			toDecode[toDecodeI] = sample;
			toDecodeI += 1;
		}
		};		  
		
	    })
	    .catch(function(err) {
		
	    });

    };

    return socket;
}


