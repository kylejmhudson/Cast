export default (app) => {

    app.get("/status-json.xsl", (req, res) => {
        const activeStreams = streams.getActiveStreams()
        let iceStreams = []
        for (let stream of activeStreams) {
            console.log(stream);
            console.log(streams.getStreamConf(stream).bitrate);
            iceStreams.push({
                "audio_info": "bitrate=" + (streams.getStreamConf(stream).bitrate) + ";",
                "bitrate": streams.getStreamConf(stream).bitrate,
                "channels": 2, // we guess so, there is currently no reading of the audio frames
                "genre": streams.getStreamConf(stream).genre,
                "listener_peak": streams.numberOfListerners(stream),
                "listeners": streams.numberOfListerners(stream),
                "listenurl": config.hostname + "/streams/" + stream,
                "samplerate": 44100, // we guess so, there is currently no reading of the audio frames
                "server_description": "",
                "server_name": streams.getStreamConf(stream).name,
                "server_type": streams.getStreamConf(stream).type,
                "server_url": streams.getStreamConf(stream).url,
                "stream_start": "Fri, 03 Jul 2015 13:13:18 -0400", // leaving that for now
                "stream_start_iso8601": "2015-07-03T13:13:18-0400", // leaving that for now
                "title": streams.getStreamMetadata(stream).song,
                "dummy": null,
            })
        }

        if (iceStreams.length === 1) {
            iceStreams = iceStreams[0]
        }

        res.json({
            "icestats": {
                "admin": "nobody@getca.st",
                "host": config.hostname.replace("http://", "").replace("https://", ""),
                "location": "Cloud",
                "server_id": "Cast 1.0",
                "server_start": "Fri, 03 Jul 2015 09:09:19 -0400", // leaving that for now
                "server_start_iso8601": "2015-07-03T09:09:19-0400", // leaving that for now
                "source": iceStreams,
            },
        })

    })

    app.get("/admin/metadata", (req, res) => {
        if (!req.headers.Authorization) {
            return res.status(401).send()
        }
        const password = new Buffer(req.headers.Authorization.replace("Basic", "").trim(), "base64").toString()
        if (!streams.streamPasswords.hasOwnProperty(password)) {
            return res.status(401).send()
        }
        const stream = streams.streamPasswords[password]
        if (req.params.mode === "updinfo") {
            streams.setStreamMetadata(stream, {
                song: req.params.song || "", // do some encoders send more? (looks at Liquidsoap)
                djname: req.params.djname, // extended API
            })
        }
        res.set("Content-Type", "text/xml");
        res.send(`<?xml version="1.0"?>\n<iceresponse><message>Metadata update successful</message><return>1</return></iceresponse>`)
    })
}
