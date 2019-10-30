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
                let output = '';
                output += 'Events for ' + artist.replace('+', ' ') + ':' + '\n';
                output += '---------------------------------------------------' + '\n';
                for(let i = 0; i < 10; i++) {
                    output += 'Venue:             ' + response[i].venue.name + '\n';
                    let location = response[i].venue.city;
                    let region = response[i].venue.region;
                    if (region != '') {
                        location += ', ' + region;
                    }
                    location += ', ' + response[i].venue.country;
                    output += 'Venue Location:    ' + location + '\n';
                    output += 'Date of the event: ' + moment(response[i].datetime).format('MM/DD/YYYY') + '\n';
                    output += '---------------------------------------------------' + '\n';
                }
                console.log(output);
                fs.appendFile('output.txt', output + '\n\n', function(error) {
                    if (error) {
                        console.log(err);
                    } else {
                        console.log("Content Added!");
                    }
                });
            }).catch(function(error) {
                console.log(error)
            });
            break;
        case 'spotify-this-song':
            if (!input) {
                spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
                    .then(function(data) {
                        let output = '';
                        output += 'Artist:       ' + data.artists[0].name + '\n';
                        output += 'Song Name:    ' + data.name + '\n';
                        output += 'Preview Link: ' + data.preview_url + '\n';
                        output += 'Album:        ' + data.album.name + '\n';
                        console.log(output);
                        fs.appendFile('output.txt', output + '\n\n', function(error) {
                            if (error) {
                              console.log(err);
                            } else {
                              console.log("Content Added!");
                            }
                        });
                    })
                    .catch(function(err) {
                        console.error('Error occurred: ' + err); 
                    });
            } else {
                spotify.search({ type: 'track', query: input, limit: 10}, function(error, data) {
                    if (error) {
                        return console.log('Error occurred: ' + error);
                    }
                    let output = '';
                    output += 'Songs found for song name: ' + input.split('+').join(' ') + '\n';
                    for (let i = 0; i < 10; i ++) { 
                        output += '---------------------------------------------------' + '\n';
                        output += 'Artist:       ' + data.tracks.items[i].artists[0].name + '\n';
                        output += 'Song Name:    ' + data.tracks.items[i].name + '\n';
                        let preview = data.tracks.items[i].preview_url;
                        if (preview !== null) {
                            output += 'Preview Link: ' + preview + '\n';
                        } else {
                            output += 'Preview Link: No Preview Link Available' + '\n';
                        }
                        output += 'Album:        ' + data.tracks.items[i].album.name + '\n';
                    }
                    output += '---------------------------------------------------' + '\n';
                    console.log(output);
                    fs.appendFile('output.txt', output + '\n\n', function(error) {
                        if (error) {
                            console.log(err);
                        } else {
                            console.log("Content Added!");
                        }
                    });
                }); 
            }
            break;
        case 'movie-this':
            if (!input) { 
                input = 'Mr.+Nobody'
            }
            axiosCall(input).then(data => {
                let output = '';
                output += 'Title:                  ' + data.Title + '\n';
                output += 'Release Year:           ' + data.Year + '\n';
                output += 'IMDB Rating:            ' + data.imdbRating + '\n';
                output += 'Rotton Tomatoes Rating: ' + data.Ratings[1].Value + '\n';
                output += 'Country Produced In:    ' + data.Country + '\n';
                output += 'Language/s:             ' + data.Language + '\n';
                output += 'Plot:                   ' + data.Plot + '\n';
                output += 'Actors:                 ' + data.Actors + '\n';
                console.log(output);
                fs.appendFile('output.txt', output + '\n\n', function(error) {
                    if (error) {
                        console.log(err);
                    } else {
                        console.log("Content Added!");
                    }
                });
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

fs.appendFile('output.txt', (command + ' ' + process.argv.slice(3).join(' ') + '\n'), function(error) {
    if (error) {
      console.log(err);
    } else {
      console.log("Content Added!");
    }
});
liri(command, process.argv.slice(3).join('+'));


