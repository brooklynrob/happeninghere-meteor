import { Mongo } from 'meteor/mongo';
import Twitter from 'twitter';
import { Meteor } from 'meteor/meteor';
import apiai from 'apiai';

export const Tweets = new Mongo.Collection("tweets");

//var geocode = '40.6772704,-73.987523,1mi';
var FLL_geocode = '26.0742392,-80.1527909,10mi';
var BCL_geocode = '40.676671,-73.987046,10mi';
var ATARASHIYA_geocode = '34.2688554,135.878034,50mi';

var last_responded_id;
var last_tweet_hash = new Object();

var config = require('../../config.js');

var twitter_read_client = new Twitter({
  consumer_key: config.twitterapi.read.consumer_key,
  consumer_secret: config.twitterapi.read.consumer_secret,
  access_token_key: config.twitterapi.read.access_token_key,
  access_token_secret: config.twitterapi.read.access_token_secret
});

var twitter_write_client = new Twitter({
  consumer_key: config.twitterapi.write.consumer_key,
  consumer_secret: config.twitterapi.write.consumer_secret,
  access_token_key: config.twitterapi.write.access_token_key,
  access_token_secret: config.twitterapi.write.access_token_secret
});


//let getLocalTweets = ( geocode ) => {
let getWatchedPeopleTweets = (monitored_screen_name) => {
  return new Promise( ( resolve, reject ) => {
    var tweetSearchParams = {};
    tweetSearchParams = {screen_name: monitored_screen_name, count:'1', include_rts:false,exclude_replies:true};
    var last_tweet = {};
    twitter_read_client.get('statuses/user_timeline',tweetSearchParams, Meteor.bindEnvironment(function(error, tweets, response) {
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

let getRecentMentions = () => {
  //https://dev.twitter.com/rest/reference/get/statuses/mentions_timeline
  var mentionSearchParams = {count:'1'};
  var recent_mentions = [];
  return new Promise( ( resolve, reject ) => {
    twitter_write_client.get('statuses/mentions_timeline',mentionSearchParams, Meteor.bindEnvironment(function(error, tweets, response) {
      let i = 0;
      for (let mention of tweets) {
        recent_mentions[i] = {};
        recent_mentions[i].id = mention.id_str;       
        recent_mentions[i].text = mention.text;
        recent_mentions[i].screen_name = mention.user.screen_name;
        i++;
      }  
      console.log("Last 1 mentions to write client",recent_mentions);
      resolve(recent_mentions);
    }));
  });
};


//function getAPIAIresponse(last_tweet) {
let getAPIAIresponse = ( tweet ) => {
 return new Promise( ( resolve, reject ) => {
    var apiai_app = apiai(config.apiai.client_access_token);
    console.log('About to make a APIAI request');
    var request = apiai_app.textRequest(tweet, {
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


//function postTweetReply(tweet_to_send,last_tweet_id,last_tweet_user_screen_name) {
let postTweet = (tweet_to_send,last_tweet_id,last_tweet_user_screen_name) => {
  console.log("This is postTweetReply function");
  return new Promise( ( resolve, reject ) => {
    var tweetStatusParams = {};
    var tweet_to_post;
    if (last_tweet_id && last_tweet_user_screen_name) {
      tweet_to_post = ("@" + last_tweet_user_screen_name + " " + "TEST: " + tweet_to_send);
      tweetStatusParams = {status: tweet_to_post, in_reply_to_status_id:last_tweet_id};
    } else {
      tweet_to_post = ("TEST: " + tweet_to_send);
      tweetStatusParams = {status: tweet_to_post};
    }

     //commenting out the writing component
    twitter_write_client.post('statuses/update',tweetStatusParams, Meteor.bindEnvironment(function(error, tweet, response) {
      if(error) {
        //reject(error);
        throw error;
      }
      console.log("Tweet posted was ",tweet); 
      last_tweet_hash[last_tweet_user_screen_name] = last_tweet_id; //make this persitent in the database
      last_responded_id = last_tweet_id;
      resolve(tweet);
    })); 
  });
};

function processRecentMentions() {
  //var last_tweet = getPersonTweets(config.monitored_screen_name);
  getRecentMentions().then((recent_mentions) => {
    console.log("Recent mentions", recent_mentions);
    for (let mention of recent_mentions) {
      console.log("Process mention:", mention);
      //if tweet is recent (within last 30 sec) && tweet has not been responded to previously
      // add time check
      if ((mention.id != last_responded_id) && (mention.id != last_tweet_hash[mention.screen_name])) { //persist that in the database
        //var self = this;
        getAPIAIresponse(mention.text).then( (apiai_response ) => {
          //var tweet_to_send;
          //tweet_to_send = "@";
          //tweet_to_send += mention.screen_name;             
          //tweet_to_send += "Test:";
          //tweet_to_send += " ";
          //tweet_to_send += apiai_response;
          //console.log("self.mention.screen_name is ",self.mention.screen_name);
          //console.log("mention.screen_name is ",mention.screen_name);
          //console.log("self.mention.id is ",self.mention.id);
          //console.log("mention.id is ",mention.id);
          postTweet(apiai_response,mention.id,mention.screen_name);
        });
      } // end check of recent time && not previous reply
    }
  });
}


function processWatchedPeopleTweets() {
    //var last_tweet = getPersonTweets(config.monitored_screen_name);
    for (let screen_name of config.monitored_screen_names) {
      console.log("checking...", screen_name);
      getWatchedPeopleTweets(screen_name).then( ( last_tweet) => { 
      //if tweet is recent (within last 30 sec) && tweet has not been responded to previously
      // add time check
      if ((last_tweet.id != last_responded_id) && (last_tweet.id != last_tweet_hash[screen_name])) { //persist that in the database
        getAPIAIresponse(last_tweet.text).then( (apiai_response ) => {
          postTweet(apiai_response,last_tweet.id,last_tweet.user_screen_name);
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

    twitter_read_client.get('search/tweets', tweetSearchParams, Meteor.bindEnvironment(function(error, tweets, response){
        if (!error) {
          console.log("Count of tweets collected " + tweets.statuses.length);
          for (var i=0; i < tweets.statuses.length; i++) {
            if(tweets.statuses[i].coordinates) {
              returnedTweets.push({
                text:tweets.statuses[i].text,
                longitude:tweets.statuses[i].coordinates.coordinates[0],
                latitude:tweets.statuses[i].coordinates.coordinates[1],
                type:'tweet',
                createdAt: new Date()
              });
            } //end if (tweets.statuses[i].coordinates exists

            else if(tweets.statuses[i].place) {
              console.log("This tweet has a place!!");
              //console.log(tweets.statuses[i]);
              console.log("This tweet's long is is ", tweets.statuses[i].place.bounding_box.coordinates[0][0][0]);
              console.log("This tweet's lat is is ", tweets.statuses[i].place.bounding_box.coordinates[0][2][1]);
              // To do -- get more accurate center of polygone
              // http://stackoverflow.com/questions/3081021/how-to-get-the-center-of-a-polygon-in-google-maps-v3
              //center.x = x1 + ((x2 - x1) / 2);
              //center.y = y1 + ((y2 - y1) / 2);
              
              
              
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
    //console.log('tweets were returned');
    //console.log('The amount (length) of returnedTweets in upper function is ' + returnedTweets.length);
    resolve(returnedTweets);
    
    }));
    //reject(console.log("FAILED!"));
  });
};


if (Meteor.isServer) {
  Meteor.setInterval(function() {
    //console.log("About to run processTweetReplies for the monitored tweets");
    //processWatchedPeopleTweets(); //this is the function to process tweet replies

    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth()+1)  + "/" 
      + currentdate.getFullYear() + " @ "  
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();
    var time_reply = "Current GMT is";
    time_reply += datetime;
    
    //console.log("About to reply with", time_reply);
    //postTweetReply(time_reply);
    
    processRecentMentions();
  }, 600000); //every 10 minutes
}


if (Meteor.isServer) {
// This code only runs on the server
  Meteor.publish("moreTweets", function tweetsPublication(geocode) {  //myDate
    geocode = geocode || BCL_geocode;
    console.log("On server. search geocode is", geocode);
    var self = this;
    Meteor.setInterval(function() {
      var id = 0;
      console.log("About to run getLocalTweets for the geocode - ", geocode);
      getLocalTweets(geocode).then( ( returnedTweets) => { 
        console.log('Success');
        returnedTweets.forEach(function (tweet) {
          console.log("Adding...",tweet);
          self.added("tweets",id, tweet);
          id++;
        });
      });
    }, 120000); //every 2 minutes

    return this.ready();
  });
}