import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import axios from 'axios';
import autoLink from 'autolink.js'

import { Tweets } from '../api/tweets.js';
import Tweet from './Tweet.jsx';


const HOME_POSITION = {
  //40.6793399,-73.975184
  //  lat: 40.6793399,
  lat: 40.6794399,
  //lng: -73.975184
  lng: -73.977184
}

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
    this.panToBCL = this.panToBCL.bind(this);
    this.panToFLL = this.panToFLL.bind(this);
    this.panToHome = this.panToHome.bind(this);
    this.addMarker=this.addMarker.bind(this);
    this.updateMap=this.updateMap.bind(this);
    this.showInfo=this.showInfo.bind(this);
    this.removeMarkers=this.removeMarkers.bind(this);
    this.configureMap=this.configureMap.bind(this);
    this.updateMapTweets=this.updateMapTweets.bind(this);
    this.renderTweets=this.renderTweets.bind(this);
  }
  
  renderTweets() {


    return this.props.tweets.map((tweet) => (
      //<Tweet lat={tweet.lat} lng={tweet.lng} msg={tweet.text} />
  

      <Tweet key={tweet._id} tweet={tweet} />
    ));
  }
  
  panToArcDeTriomphe() {
    //console.log(this)
    this.map.panTo(ARC_DE_TRIOMPHE_POSITION);
  }
  
  panToAtarashiya() {
    //console.log(this)
    this.map.panTo(ATARASHIYA_POSITION);
  }
  
  panToBCL() {
    //console.log(this)
    this.map.panTo(BCL_POSITION);
    this.updateMaps;
  }
  
  panToFLL() {
    //console.log(this)
    this.map.panTo(FLL_POSITION);
    this.updateMaps;
  }
  
  panToHome() {
    console.log(this);
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



  
  //addMarker(place) {
  addMarker(place) {
    //console.log("This place is " + place);
    var lat = Number(place.latitude);
    var lng = Number(place.longitude);
    var myLatLng = {lat:lat, lng:lng};
    //initial myLatLng
    //var myLatLng = {lat:HOME_POSITION.lat, lng:HOME_POSITION.lng};

    //var image = '../../assets/' + place.venue.venue_type + '-40x40.png'
    //example: https://event-tickets-tracker-runderwood5.cs50.io/assets/pollsite-40x40.png
    

    
    if (place.type == 'tweet') {
      var image = 'images/twitter-sm.png'; 
      place.name = place.text;
    } else {
      var image = baseHHApiUrl + 'assets/' + place.venue_type + '-40x40.png';
    }
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        //title: place.venue.name,
        title: place.name,
        icon: image
    });
    
    // Push Marker Into Array
    markers.push(marker);
    
    //Info windows
    
    var content = place.name;
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
        markers[i].setMap(null);
        markers[i] = null;
    }
    
    markers = [];
  }
  
  updateMapTweets() {
    //See http://stackoverflow.com/questions/35312951/uncaught-typeerror-cannot-read-property-x-of-undefined-common-js
    //console.log("tweets are",Tweets.find({}).fetch());
    var self = this;
    var currTweets = Tweets.find({}).fetch();
    currTweets.forEach(function(tweet){
      console.log(tweet);
      self.addMarker(tweet);
    });
  }
  
  
  
  updateMap(types) {
    // get map's bounds
    var locationCenter = this.map.getCenter();
    var latitude = locationCenter.lat();
    var longitude = locationCenter.lng();
    var searchLocation = latitude+","+longitude;
    
    
    //types = types || ["all"];
    var typesString = allTypes.join("|");
    //console.log("typesString is " + typesString);

    //https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0

    // get places within bounds (asynchronously)
    var parameters = {
        types:typesString,
        location:searchLocation,
        radius:'1000.0'
    };

    var searchUrl = baseHHApiUrl + 'api/v1/venues/search';
    //console.log(searchUrl);
    var url = searchUrl + 'api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0';
    
    axios.get(searchUrl, {
      params: {
        types:typesString,
        location:searchLocation,
        radius:'1000.0'
      }
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
      self.updateMapTweets(); // Similar to what you've got
    }, 10000);
    
    
    
  }
    
  //DidMount
  componentDidMount() {
    this.map = new google.maps.Map(this.refs.map, options);
    //updateMap (i.e., put inital set of marker on)
    
    this.updateMap();
    // configure UI once Google Map is idle (i.e., loaded) 
    google.maps.event.addListenerOnce(this.map, "idle", this.configureMap);
  }
  
  
  render() {
    const mapStyle = {
      width: 800,
      height: 500,
      border: '1px solid black'
    };

    return (
      <div>
        <button onClick={this.panToArcDeTriomphe}>Go to Arc De Triomphe</button>
        <button onClick={this.panToAtarashiya}>Go to Atarashiya</button>
        <button onClick={this.panToBCL}>Go to BCL</button>
        <button onClick={this.panToFLL}>Go to FLL</button>

        <div ref="map" style={mapStyle}>I should be a map!</div>
        <div className="container">
          <header>
            <h2>Local area tweets</h2>
            <p>
              {this.renderTweets()}
            </p>
          </header>
        </div>

          
      </div>
    );
  }
}

GoogleMapApp.propTypes = {
  //tweetsReady: PropTypes.bool.isRequired,
  tweets: PropTypes.array.isRequired,
};


export default createContainer(() => {
    var tweetHandler = Meteor.subscribe("moreTweets");
    console.log("Tweets are",Tweets.find());

  return {
    //tweetsReady: tweetHandler.ready(),
    //tweets: tweetHandler.find({}).fetch(),
    tweets: Tweets.find({}).fetch(),
  };

}, GoogleMapApp);