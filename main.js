'use strict';

var twitter = require('twitter');
var client = new twitter( {
    consumer_key:        process.env.NODE_TWITTER_CONSUMER_KEY,
    consumer_secret:     process.env.NODE_TWITTER_CONSUMER_SECRET,
    access_token_key:    process.env.NODE_TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.NODE_TWITTER_ACCESS_TOKEN_SECRET
} );

var request = new require('request');
const urlRegex = require('url-regex');

var stream = client.stream('user', {with : 'followings'});
stream.on('data', function(event) {
    var media = event.entities.media;
    var url = event.entities.urls[0];
    if(event.lang == 'ja' && url && url.expanded_url && !(
        /instagram.com|twitter.com|twitpic.com|ift.tt|swarmapp.com|nico.ms|pixiv.net|bit.ly|this.kiji.is|nhknews.jp|fb.me|tenki.jp|j.mp|melonbooks|ask.fm/.test(url.expanded_url)
    )){
        console.log('------')

        var options = {
            uri: process.env.NODE_TWEET_SHARE_ENDPOINT,
            method: 'POST',
            json: {
                "url": url.expanded_url,
                "text": event.text.replace(/RT \@[A-z|a-z|0-9|\-|\_]+\:\ /,'').replace(urlRegex(),''),
                "created_at": event.created_at,
                "timestamp" : parseInt( Date.now() / 1000 ),
                "expired_at" : parseInt( Date.now() / 1000 ) + 7200
            }
        };
	
	console.log(options)

        request(options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                      console.log(body) // Print the shortened url.
              }
        });
        
    }
});
 
stream.on('error', function(error) {
      throw error;
});
