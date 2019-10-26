require('dotenv').config();
let Spotify = require('node-spotify-api');
let keys = require('./keys.js');
let spotify = new Spotify(keys.spotify);
let axios = require('axios');
let moment = require('moment');

let command;
if (!process.argv[2]) {
    console.log('Need to provide a command as an argument.');
} else {
    command = process.argv[2]
}

/**
 * Checks for a second command line argument.
 */
function checkForInput() {
    if (!process.argv[3]) {
        console.log('Need to provide a second argument to run this command.');
    } else {
        return process.argv.slice(3).join('+');
    }
}

function axiosCall(type, input) {
    let queryURL;
    if (command === 'concert-this') {
        queryURL = 'https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp';
    } else {
        queryURL = 'http://www.omdbapi.com/?apikey=ef2f0ffe&t=' + input;
    }
    return axios.get(queryURL).then((response) => {
        return response.data;
    }).catch(function(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('---------------Data---------------');
            console.log(error.response.data);
            console.log('---------------Status---------------');
            console.log(error.response.status);
            console.log('---------------Status---------------');
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an object that comes back with details pertaining to the error that occurred.
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
    });
}

switch (command) {
    case 'concert-this':
        let artist = checkForInput();
        let queryURL = 'https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp';
        axios.get(queryURL).then((response) => {
            console.log('Events for ' + artist.replace('+', ' ') + ':');
            console.log('---------------------------------------------------');
            for(let i = 0; i < 10; i++) {
                console.log('Venue:             ' + response.data[i].venue.name);
                let location = response.data[i].venue.city;
                let region = response.data[i].venue.region;
                if (region != '') {
                    location += ', ' + region;
                }
                location += ', ' + response.data[i].venue.country;
                console.log('Venue Location:    ' + location);
                console.log('Date of the event: ' + response.data[i].datetime);
                console.log('---------------------------------------------------');
            }
        }).catch(function(error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log('---------------Data---------------');
              console.log(error.response.data);
              console.log('---------------Status---------------');
              console.log(error.response.status);
              console.log('---------------Status---------------');
              console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an object that comes back with details pertaining to the error that occurred.
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
        });
        break;
    case 'spotify-this-song':
        let song = process.argv[3];
        if (!song) {
            spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
                .then(function(data) {
                    console.log(JSON.stringify(data, null, 2)); 
                    console.log('Artist:       ' + data.artists[0].name);
                    console.log('Song Name:    ' + data.name);
                    console.log('Preview Link: ' + data.preview_url);
                    console.log('Album:        ' + data.album.name);
                })
                .catch(function(err) {
                    console.error('Error occurred: ' + err); 
                });
        } else {
            spotify.search({ type: 'track', query: song, limit: 10}, function(error, data) {
                if (error) {
                    return console.log('Error occurred: ' + error);
                }
                console.log('Songs found for song name: ' + song);
                for (let i = 0; i < 10; i ++) { 
                    console.log('---------------------------------------------------');
                    console.log('Artist:       ' + data.tracks.items[i].artists[0].name);
                    console.log('Song Name:    ' + data.tracks.items[i].name);
                    let preview = data.tracks.items[i].preview_url;
                    if (preview !== null) {
                        console.log('Preview Link: ' + preview);
                    } else {
                        console.log('Preview Link: No Preview Link Available');
                    }
                    console.log('Album:        ' + data.tracks.items[i].album.name);
                }
                console.log('---------------------------------------------------');
            }); 
        }
        break;
    case 'movie-this':
        let movie = process.argv.slice(3).join('+');
        if (!movie) { 
            movie = 'Mr.+Nobody'
        }
        axiosCall(command, movie).then(data => {
            console.log(JSON.stringify(data, null, 2));
        }).catch(function(error) {
            console.log(error)
        });
        break;
    case 'do-what-it-says':
        break;                                     
}
