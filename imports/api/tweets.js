import { Mongo } from 'meteor/mongo';
import Twitter from 'twitter';
import { Meteor } from 'meteor/meteor';
//import Fibers from 'fibers';

export const Tweets = new Mongo.Collection("tweets");

//var geocode = '40.6772704,-73.987523,1mi';
var FLL_geocode = '26.0742392,-80.1527909,10mi';
var BCL_geocode = '40.676671,-73.987046,7mi';
var ATARASHIYA_geocode = '34.2688554,135.878034,50mi';



var config = require('../../config.js');
//make this an include file
var client = new Twitter({
  consumer_key: config.twitterapi.consumer_key,
  consumer_secret: config.twitterapi.consumer_secret,
  access_token_key: config.twitterapi.access_token_key,
  access_token_secret: config.twitterapi.access_token_secret
});


//function getLocalTweets(locationname,geocode) {

let getLocalTweets = ( geocode ) => {
//function getLocalTweets(geocode) {  
  var returnedTweets=[];
  return new Promise( ( resolve, reject ) => {


    var tweetSearchParams= {};
  
    // make query an argument?
    tweetSearchParams = {q: '', geocode: geocode, count: '300'};

    client.get('search/tweets', tweetSearchParams, Meteor.bindEnvironment(function(error, tweets, response){
      //console.log(tweets);
      //resolve(tweets);
        if (!error) {
          console.log("Count of tweets collected " + tweets.statuses.length);
          for (var i=0; i < tweets.statuses.length; i++) {
            if(tweets.statuses[i].coordinates) {
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
              /* Tweets.insert({
                text:tweets.statuses[i].text,
                longitude:tweets.statuses[i].coordinates.coordinates[0],
                latitude:tweets.statuses[i].coordinates.coordinates[1],
                type:'tweet',
                createdAt: new Date(),
              }); */
      
            } //end if (tweets.statuses[i].coordinates
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

  Meteor.publish("moreTweets", function tweetsPublication() {  //myDate
    //var returnedTweets = getLocalTweets(BCL_geocode);

    var self = this;
    Meteor.setInterval(function() {
      console.log("About to run getLocalTweets");
      getLocalTweets(BCL_geocode).then( ( returnedTweets) => { 
        console.log('Success');
        returnedTweets.forEach(function (tweet) {
          console.log("Adding...",tweet);
          self.added("tweets",id, tweet);
          id++;
        });
      });

      //self.added("tweets",id,{text:'test 3',type:'tweet',latitude:40.634671,longitude:-73.983046});
      //id++;
      
    }, 20000);
    
    return this.ready();
    
    //getLocalTweets(FLL_geocode);
    //getLocalTweets(ATARASHIYA_geocode);
  });
}



