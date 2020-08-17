# KlangraumTemplate

A template webpage for Klangraum sound works. 

This template can be used for local testing.

## Requirements 

- A basic unix/linux system with git, jack, npm, rustup/cargo and ffmpeg.
- The audio output server: https://github.com/lucdoebereiner/klangraum
- The audio input server: https://github.com/lucdoebereiner/KlangSendWS
- The websocket<->osc server: https://github.com/lucdoebereiner/ws2osc
- http-server (https://www.npmjs.com/package/http-server)


## Start

Start the three servers (see their README files). Start KlagnSendWS
without the http-server (see README).

```bash
$ ./serve.sh
```
Open the http://localhost:9000/template.html in Chrome or Safari
(Firefox is currently not supported).


If you don't change the default settings, connect a sound source
ffmpeg_out_0 in jack. You should hear it in the browser now. Your mic
is available on the first output channel of the jack client
klangraum_input.
