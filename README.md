# HomePod Radio

Internet radio player which will work with HomePod.

Note: Does not support device discovery so you'll need to specify your HomePod IT address.

## Installation

```npm install -g homebridge-homepod-radio```

## Configuration

``` 
...
    "accessories": [
        {
             "accessory": "HomePodRadio",
            "name": "Radio Two",
            "streamUrl": "http://icecast6.play.cz/cro2-128.mp3",
            "host": "10.0.1.146",
            "volume": 15,
            "port": 5000
        }
    ]
...
```

Feel free to contribute to make code better!