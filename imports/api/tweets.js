import { Mongo } from 'meteor/mongo';
import Twitter from 'twitter';
import { Meteor } from 'meteor/meteor';
import apiai from 'apiai';
//var apiai = require('apiai');

export const Tweets = new Mongo.Collection("tweets");

//var geocode = '40.6772704,-73.987523,1mi';
var FLL_geocode = '26.0742392,-80.1527909,10mi';
var BCL_geocode = '40.676671,-73.987046,10mi';
var ATARASHIYA_geocode = '34.2688554,135.878034,50mi';

var last_responded_id;
var last_tweet_hash = new Object();


var config = require('../../config.js');
//make this an include file
var client = new Twitter({
  consumer_key: config.twitterapi.consumer_key,
  consumer_secret: config.twitterapi.consumer_secret,
  access_token_key: config.twitterapi.access_token_key,
  access_token_secret: config.twitterapi.access_token_secret
});


//let getLocalTweets = ( geocode ) => {
let getPersonTweets = (monitored_screen_name) => {
  return new Promise( ( resolve, reject ) => {
    var tweetSearchParams = {};
    tweetSearchParams = {screen_name: monitored_screen_name, count:'1', include_rts:false,exclude_replies:true};
    var last_tweet = {};
    client.get('statuses/user_timeline',tweetSearchParams, Meteor.bindEnvironment(function(error, tweets, response) {
      console.log("Getting most recent tweets",tweets[0].text);
      last_tweet.text = tweets[0].text;
      last_tweet.id = tweets[0].id_str;
      last_tweet.user_id = tweets[0].user.id;
      last_tweet.user_screen_name = tweets[0].user.screen_name;
      last_tweet.created_at = tweets[0].created_at; //created_at": "Tue Aug 28 21:16:23 +0000 2012"
      console.log('last tweet is (in the function)', last_tweet);
      resolve(last_tweet);
    }));
  });
};


//function getAPIAIresponse(last_tweet) {
let getAPIAIresponse = ( last_tweet ) => {
 return new Promise( ( resolve, reject ) => {
    var apiai_app = apiai(config.apiai.client_access_token);
    console.log('About to make a APIAI request');
    var request = apiai_app.textRequest(last_tweet, {
      sessionId: '1234567890'
    });
    request.on('response', function(response) {
        console.log('This is the API.AI reponse',response);
        console.log('The response is ', response.result.fulfillment.speech);
        resolve(response.result.fulfillment.speech);//return response;
    });
    request.on('error', function(error) {
      console.log("This is the APIAI error",error);
    });
    request.end();
 });
};


function postTweetReply(apiai_response,last_tweet_id,last_tweet_user_screen_name) {
  console.log("This is postTweetReply function");
  var status = "@";
  status += last_tweet_user_screen_name;
  status += " ";
  status += apiai_response;
  var tweetStatusParams = {};
  tweetStatusParams = {status: status, in_reply_to_status_id:last_tweet_id};

  client.post('statuses/update',tweetStatusParams, Meteor.bindEnvironment(function(error, tweet, response) {
    if(error) throw error;
    console.log("Posted was ",tweet);
    last_tweet_hash[last_tweet_user_screen_name] = last_tweet_id;
    last_responded_id = last_tweet_id;
    return tweet;
  }));
}


function processTweetReplies() {
    //var last_tweet = getPersonTweets(config.monitored_screen_name);
    for (let screen_name of config.monitored_screen_names) {
      console.log("checking...", screen_name);
      getPersonTweets(config.monitored_screen_name).then( ( last_tweet) => { 
      //if tweet is recent (within last 30 sec) && tweet has not been responded to previously
      //created_at {
      if ((last_tweet.id != last_responded_id) && (last_tweet.id != last_tweet_hash[screen_name])) {
        getAPIAIresponse(last_tweet.text).then( (apiai_response ) => {
          postTweetReply(apiai_response,last_tweet.id,last_tweet.user_screen_name);
        });
      } // end check of recent time && not previous reply
    });
  }
}






let getLocalTweets = ( geocode ) => {

  var returnedTweets=[];
  
  return new Promise( ( resolve, reject ) => {


    var tweetSearchParams= {};
  
    // make query an argument?
    tweetSearchParams = {q: '', geocode: geocode, count: '300'};

    client.get('search/tweets', tweetSearchParams, Meteor.bindEnvironment(function(error, tweets, response){
        if (!error) {
          console.log("Count of tweets collected " + tweets.statuses.length);
          for (var i=0; i < tweets.statuses.length; i++) {
            if(tweets.statuses[i].coordinates) {
              	
              // https://dev.twitter.com/overview/api/tweets	
              // Twitter API example
              //"coordinates":
              //{
              //    "coordinates":
              //    [
              //        -75.14310264,
              //        40.05701649
              //    ],
              //    "type":"Point"
              //}
                            
              
              
              
              
              //console.log("This tweet has coordinates");
              //console.log("This tweet's text is " + tweets.statuses[i].text);
              //console.log("This tweet's lat is " + tweets.statuses[i].coordinates.coordinates[1]);
              returnedTweets.push({
                text:tweets.statuses[i].text,
                longitude:tweets.statuses[i].coordinates.coordinates[0],
                latitude:tweets.statuses[i].coordinates.coordinates[1],
                type:'tweet',
                createdAt: new Date()
              });
            } //end if (tweets.statuses[i].coordinates exists

            if(tweets.statuses[i].place) {
              // https://dev.twitter.com/overview/api/tweets	
              // Twitter API example

              //"place":
              //{
              //    "attributes":{},
              //     "bounding_box":
              //    {
              //        "coordinates":
              //        [[
              //                [-77.119759,38.791645],
              //                [-76.909393,38.791645],
              //                [-76.909393,38.995548],
              //                [-77.119759,38.995548]
              //        ]],
              //        "type":"Polygon"
              //    },
              //     "country":"United States",
              //     "country_code":"US",
              //     "full_name":"Washington, DC",
              //     "id":"01fbe706f872cb32",
              //     "name":"Washington",
              //     "place_type":"city",
              //     "url": "http://api.twitter.com/1/geo/id/01fbe706f872cb32.json"
              //}
              
              
              console.log("This tweet has a place!!");
              //console.log(tweets.statuses[i]);
              console.log("This tweet's long is is ", tweets.statuses[i].place.bounding_box.coordinates[0][0][0]);
              console.log("This tweet's lat is is ", tweets.statuses[i].place.bounding_box.coordinates[0][2][1]);
              returnedTweets.push({
                text:tweets.statuses[i].text,
                longitude:tweets.statuses[i].place.bounding_box.coordinates[0][0][0], //if polyon do second late
                latitude:tweets.statuses[i].place.bounding_box.coordinates[0][2][1],
                place_name: tweets.statuses[i].place.name,
                place_type: tweets.statuses[i].place.place_type,
                type:'tweet',
                createdAt: new Date()
              });
            } //end if (tweets.statuses[i].places) exists         
            
            
            
            
          } //end for
        } // end if no error
    
        else {
          console.log(error);
        }
    
    console.log('tweets were returned');
    console.log('The amount (length) of returnedTweets in upper function is ' + returnedTweets.length);
    resolve(returnedTweets);
    
    }));

    //reject(console.log("FAILED!"));
  });
};




var id = 0;

if (Meteor.isServer) {
// This code only runs on the server

  Meteor.publish("moreTweets", function tweetsPublication(geocode) {  //myDate
    //var returnedTweets = getLocalTweets(BCL_geocode);
    geocode = geocode || BCL_geocode;
    console.log("On server. search geocode is", geocode);
    var self = this;
    Meteor.setInterval(function() {
      console.log("About to run processTweetReplies for the monitored tweets");
      processTweetReplies();
      console.log("About to run getLocalTweets for the geocode - ", geocode);
      getLocalTweets(geocode).then( ( returnedTweets) => { 
        console.log('Success');
        returnedTweets.forEach(function (tweet) {
          console.log("Adding...",tweet);
          self.added("tweets",id, tweet);
          id++;
        });
      });

      //self.added("tweets",id,{text:'test 3',type:'tweet',latitude:40.634671,longitude:-73.983046});
      //id++;
      
    }, 30000);

    
    return this.ready();
    
    //getLocalTweets(FLL_geocode);
    //getLocalTweets(ATARASHIYA_geocode);
  });
}



