require('dotenv').config();
let Spotify = require('node-spotify-api');
let keys = require('./keys.js');
let spotify = new Spotify(keys.spotify);
let axios = require('axios');
let moment = require('moment');
let fs = require('fs');

let command;
if (!process.argv[2]) {
    console.log('Need to provide a command as an argument.');
} else {
    command = process.argv[2]
}

function axiosCall(input) {
    let queryURL;
    if (command === 'concert-this') {
        queryURL = 'https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp';
    } else {
        queryURL = 'http://www.omdbapi.com/?apikey=ef2f0ffe&t=' + input;
    }
    console.log(queryURL)
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

function liri(command, input) {
    switch (command) {
        case 'concert-this':
            let artist = input;
            let queryURL = 'https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp';
            axiosCall(artist).then(response => {
                console.log('Events for ' + artist.replace('+', ' ') + ':');
                console.log('---------------------------------------------------');
                for(let i = 0; i < 10; i++) {
                    console.log('Venue:             ' + response[i].venue.name);
                    let location = response[i].venue.city;
                    let region = response[i].venue.region;
                    if (region != '') {
                        location += ', ' + region;
                    }
                    location += ', ' + response[i].venue.country;
                    console.log('Venue Location:    ' + location);
                    console.log('Date of the event: ' + moment(response[i].datetime).format('MM/DD/YYYY'));
                    console.log('---------------------------------------------------');
                }
            }).catch(function(error) {
                console.log(error)
            });
            break;
        case 'spotify-this-song':
            if (!input) {
                spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
                    .then(function(data) {
                        console.log('Artist:       ' + data.artists[0].name);
                        console.log('Song Name:    ' + data.name);
                        console.log('Preview Link: ' + data.preview_url);
                        console.log('Album:        ' + data.album.name);
                    })
                    .catch(function(err) {
                        console.error('Error occurred: ' + err); 
                    });
            } else {
                spotify.search({ type: 'track', query: input, limit: 10}, function(error, data) {
                    if (error) {
                        return console.log('Error occurred: ' + error);
                    }
                    console.log('Songs found for song name: ' + input.split('+').join(' '));
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
            if (!input) { 
                input = 'Mr.+Nobody'
            }
            axiosCall(input).then(data => {
                // console.log(JSON.stringify(data, null, 2))
                console.log('Title:                  ' + data.Title);
                console.log('Release Year:           ' + data.Year);
                console.log('IMDB Rating:            ' + data.imdbRating);
                console.log('Rotton Tomatoes Rating: ' + data.Ratings[1].Value);
                console.log('Country Produced In:    ' + data.Country);
                console.log('Language/s:             ' + data.Language);
                console.log('Plot:                   ' + data.Plot);
                console.log('Actors:                 ' + data.Actors);
            }).catch(function(error) {
                console.log(error)
            });
            break;
        case 'do-what-it-says':
            fs.readFile("random.txt", "utf8", function(error, data) {
                // If the code experiences any errors it will log the error to the console.
                if (error) {
                    return console.log(error);
                }
                // Then split it by commas (to make it more readable)
                let dataArr = data.split(",");
                liri(dataArr[0], dataArr[1].substring(1,dataArr[1].length - 2).split(' ').join('+'));
            });
            break;
    }
}

liri(command, process.argv.slice(3).join('+'));

