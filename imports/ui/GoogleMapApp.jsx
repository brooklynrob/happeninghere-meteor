import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import axios from 'axios';
import autoLink from 'autolink.js';

import { Tweets } from '../api/tweets.js';
import Tweet from './Tweet.jsx';


const HOME_POSITION = {
  lat: 40.6794399,
  lng: -73.977184
}

const SAN_FRAN_POSITION = {
  lat: 37.75864768667355,
  lng: -122.43520807885744
}

// Kyoto, Japan
const KYOTO_POSITION = {
  lat: 35.0061653,
  lng: 135.7259305
}

// Fort Lauderdale
const FLL_POSITION = {
  //26.0742392,-80.1527909
  //  lat: 40.6793399,
  lat: 26.0742392,
  //lng: -73.975184
  lng: -80.1527909
}

const BCL_POSITION = {
  lat: 40.676671,
  lng: -73.987046
};

const ATARASHIYA_POSITION = {
  lat: 34.2688554,
  lng: 135.878034
};

const ARC_DE_TRIOMPHE_POSITION = {
  lat: 48.873947,
  lng: 2.295038
};

const EIFFEL_TOWER_POSITION = {
  lat: 48.858608,
  lng: 2.294471
};

var searchGeocode;

const baseHHApiUrl = 'https://event-tickets-tracker-runderwood5.cs50.io/';

var allTypes= ["venue","pollsite","citibike","liquor_license_applicant"];
var event_types = ["sports","theater","festival","music","general"]
var incident_types = ["crash"];

// markers for map
var markers = [];
var incident_markers = [];
var info = new google.maps.InfoWindow();

var styles = [
  // hide Google's labels
  {
      featureType: "all",
      elementType: "labels",
      stylers: [
          {visibility: "on"}
      ]
  },

  // hide roads
  {
      featureType: "road",
      elementType: "geometry",
      stylers: [
          {visibility: "on"}
      ]
  }

];

var options = {
    center: BCL_POSITION,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    maxZoom: 20,
    panControl: true,
    styles: styles,
    zoom: 14,
    zoomControl: true
};





//following code adapted from http://codepen.io/thomastuts/pen/GZXgzZ/?editors=0010
class GoogleMapApp extends React.Component {
  constructor() {
    super();
    this.panToArcDeTriomphe = this.panToArcDeTriomphe.bind(this);
    this.panToAtarashiya = this.panToAtarashiya.bind(this);
    this.panToSanFran = this.panToSanFran.bind(this);
    this.panToBCL = this.panToBCL.bind(this);
    this.panToFLL = this.panToFLL.bind(this);
    this.panToKyoto = this.panToKyoto.bind(this);
    this.panToHome = this.panToHome.bind(this);
    this.addMarker=this.addMarker.bind(this);
    this.updateMap=this.updateMap.bind(this);
    this.showInfo=this.showInfo.bind(this);
    this.removeMarkers=this.removeMarkers.bind(this);
    this.configureMap=this.configureMap.bind(this);
    this.updateMapTweets=this.updateMapTweets.bind(this);
    this.updateCenter=this.updateCenter.bind(this);
    this.renderTweets=this.renderTweets.bind(this);
  }
  
  renderTweets() {
    return this.props.tweets.map((tweet) => (
      <Tweet key={tweet._id} tweet={tweet} />
    ));
  }
  
  panToArcDeTriomphe() {
    this.map.panTo(ARC_DE_TRIOMPHE_POSITION);
  }
  
  panToSanFran() {
    this.map.panTo(SAN_FRAN_POSITION);
  }
  
  panToKyoto() {
    this.map.panTo(KYOTO_POSITION);
  }
  
  
  panToAtarashiya() {
    this.map.panTo(ATARASHIYA_POSITION);
  }
  
  panToBCL() {
    this.map.panTo(BCL_POSITION);
    this.updateMaps;
  }
  
  panToFLL() {
    this.map.panTo(FLL_POSITION);
    this.updateMaps;
  }
  
  panToHome() {
    this.map.panTo(HOME_POSITION);
    this.updateMaps;
  }


  showInfo(marker, content) {
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined") {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
    }
    
    else {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(this.map, marker);
  }


  addMarker(place) { 
    var lat = Number(place.latitude);
    var lng = Number(place.longitude);
    var myLatLng = {lat:lat, lng:lng};
    //initial myLatLng
    //var myLatLng = {lat:HOME_POSITION.lat, lng:HOME_POSITION.lng};

    //var image = '../../assets/' + place.venue.venue_type + '-40x40.png'
    //example: https://event-tickets-tracker-runderwood5.cs50.io/assets/pollsite-40x40.png
    

    
    if (place.type == 'tweet') {
      var image = 'images/twitter-sm.png'; 
      place.name = place.text; //replace this hack later
    } else {
      var image = baseHHApiUrl + 'assets/' + place.venue_type + '-40x40.png';
    }
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        type: place.type,
        title: place.name, //fix this later
        icon: image
    });
    
    // Push Marker Into Array
    markers.push(marker);
    
    //Info windows
    var content;
    
    if (!place.place_name) {
      content = place.name; //it's either an actual place or a tweet that did not have a place assocated
    } else { //it's a tweet and a tweet with a place name
      content = place.name;
      content += "<br>";
      content += "tweeted from:";
      content += "<br>";
      content += place.place_name; //in a tweet for now the place.name is the tweet itself
    }

      
    
    
    
    content += "<br>";
    
    // See autoLink usage at https://www.npmjs.com/package/autolink.js
    
    content = autoLink(content, {
      // default options: 
      email: true,
      image: true,
      // \n to <br/> 
      br: true
    })

    var self = this;
    google.maps.event.addListener(marker, "click", function (e) { self.showInfo(marker, content); });
    

  }
  
  
  removeMarkers() {
    // derived from https://developers.google.com/maps/documentation/javascript/examples/marker-remove
    for (var i = 0; i < markers.length; i++)
    {
        //hack for now
        if (markers[i].type != 'tweet') { //don't delete tweets ... hack for now
          markers[i].setMap(null);
          markers[i] = null;
        }
    }
    
    markers = [];
  }
  
  updateCenter() {
    var bounds = this.map.getBounds();
    var center = bounds.getCenter();
    var currLat = center.lat();
    var currLon = center.lng();
    searchGeocode = currLat + "," + currLon + "," + "3mi";
    Meteor.subscribe( 'tweets', searchGeocode);
  }
  
  updateMapTweets() {
    this.updateCenter();
  
    //See http://stackoverflow.com/questions/35312951/uncaught-typeerror-cannot-read-property-x-of-undefined-common-js
    var self = this;
    var currTweets = Tweets.find({}).fetch();
    currTweets.forEach(function(tweet){
      console.log("Tweet to add!",tweet.text);
      self.addMarker(tweet);
    });
  }
  
  
  updateMap(types) {
    // get map's bounds
    var locationCenter = this.map.getCenter();
    var latitude = locationCenter.lat();
    var longitude = locationCenter.lng();
    var searchLocation = latitude+","+longitude;
    var typesString = allTypes.join("|");     //types = types || ["all"];

    //https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0
    // get places within bounds (asynchronously)
    var parameters = {
        types:typesString,
        location:searchLocation,
        radius:'3000.0' //made this based on the map
    };

    var searchUrl = baseHHApiUrl + 'api/v1/venues/search';
    //var url = searchUrl + 'api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0';
    
    axios.get(searchUrl, {
      params: parameters
    })
      .then(res => {
        //const json_data = res.data.map(obj => obj.data);
        //console.log(json_data);
        //console.log("res.data is " + res.data);
        for (var i = 0; i < res.data.length; i++) {
          //console.log(res.data[i]);
          this.addMarker(res.data[i].venue);
          // Add handling such that only markers are added for venues and events
        }
        this.updateMapTweets();
      });
    }
    

  configureMap() {
    this.map.addListener('dragend', this.updateMap);
    this.map.addListener('zoom_changed', this.updateMap);
    this.map.addListener('dragstart', this.removeMarkers);
    var self = this;
    setInterval(function() {
      console.log("Time to update!");
      self.updateCenter();
      self.updateMapTweets(); 
    }, 10000);
  }
    
  //DidMount
  componentDidMount() {
    this.map = new google.maps.Map(this.refs.map, options);
    this.updateMap(); //updateMap (i.e., put inital set of marker on)
    // configure UI once Google Map is idle (i.e., loaded) 
    google.maps.event.addListenerOnce(this.map, "idle", this.configureMap);
  }
  
  
  render() {
    const mapStyle = {
      width: 1100,
      height: 700,
      border: '1px solid black'
    };

    return (
      <div>
        <div ref="map" style={mapStyle}>I should be a map!</div>
        

        
        <div id="bottomrow">
          <button onClick={this.panToArcDeTriomphe}>Go to Arc De Triomphe</button>
          <button onClick={this.panToKyoto}>Go to Kyoto</button>
          <button onClick={this.panToAtarashiya}>Go to a cool Ryokan in Japan</button>
          <button onClick={this.panToSanFran}>Go to San Fran</button>
          <button onClick={this.panToBCL}>Go to Brooklyn</button>
        </div>
        
        <header>
          <h2>Local area tweets</h2>
          <p>
            {this.renderTweets()}
          </p>
        </header>
      </div>
    );
  }
}

GoogleMapApp.propTypes = {
  //tweetsReady: PropTypes.bool.isRequired,
  tweets: PropTypes.array.isRequired,
};


export default createContainer(() => {
    var geocode = searchGeocode  || '40.777671,-73.999046,5mi';
    //console.log("In createContainer. searchGeocode is", geocode);
    var tweetHandler = Meteor.subscribe("moreTweets",geocode);
    //console.log("Tweets are",Tweets.find());

  return {
    //tweetsReady: tweetHandler.ready(),
    //tweets: tweetHandler.find({}).fetch(),
    tweets: Tweets.find({}).fetch(),
  };

}, GoogleMapApp);