export function ws2osc(url, id, channel, oscCallback) {

    const socket = new WebSocket(url);
    
    socket.onopen = (event) => {
	socket.send(JSON.stringify({msgType: "id", id: id, channel: channel}));
    };
    
    socket.onmessage = (message) => {
	let msg = JSON.parse(message.data);
        switch (msg.msgType) {
	case "roundtrip":
	    socket.send(message.data);
	    break;
	case "osc":
	    oscCallback(message.data);
	    break;

	};
    };

    return socket;
}
