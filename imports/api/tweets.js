import { Mongo } from 'meteor/mongo';
import Twitter from 'twitter';
import { Meteor } from 'meteor/meteor';
//import Fibers from 'fibers';

export const Tweets = new Mongo.Collection("tweets");

//var geocode = '40.6772704,-73.987523,1mi';
var FLL_geocode = '26.0742392,-80.1527909,10mi';
var BCL_geocode = '40.676671,-73.987046,10mi';
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



