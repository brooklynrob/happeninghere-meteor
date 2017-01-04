import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data';
import axios from 'axios';

//import {withGoogleMap} from "react-google-maps";
//import {withGoogleMap, GoogleMap} from "react-google-maps";
//import {GoogleMapsLoader} from "google-maps";

//subways --> https://data.cityofnewyork.us/api/views/he7q-3hwy/rows.json
//Dallas incidents (no lat long) --> https://www.dallasopendata.com/api/views/9fxf-t2tr/rows.json?accessType=DOWNLOAD

/*global updateMap */

const HOME_POSITION = {
  //40.6793399,-73.975184
  //  lat: 40.6793399,
  lat: 40.6794399,
  //lng: -73.975184
  lng: -73.977184
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
    // center: {lat: 40.7159, lng: -73.9861}
    // center: {lat: 40.7159, lng: -73.9861}, 
    center: BCL_POSITION,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    maxZoom: 20,
    panControl: true,
    styles: styles,
    zoom: 16,
    zoomControl: true
};

//following code adapted from http://codepen.io/thomastuts/pen/GZXgzZ/?editors=0010
class GoogleMapApp extends React.Component {
  constructor() {
    super();
    this.panToArcDeTriomphe = this.panToArcDeTriomphe.bind(this);
    this.panToAtarashiya = this.panToAtarashiya.bind(this);
    this.panToBCL = this.panToBCL.bind(this);
    this.panToHome = this.panToHome.bind(this);
    this.addMarker=this.addMarker.bind(this);
    this.updateMap=this.updateMap.bind(this);
    this.removeMarkers=this.removeMarkers.bind(this);
    this.configureMap=this.configureMap.bind(this);
  }

  panToArcDeTriomphe() {
    console.log(this)
    this.map.panTo(ARC_DE_TRIOMPHE_POSITION);
  }
  
  panToAtarashiya() {
    console.log(this)
    this.map.panTo(ATARASHIYA_POSITION);
  }
  
  panToBCL() {
    console.log(this)
    this.map.panTo(BCL_POSITION);
  }
  
  panToHome() {
    console.log(this)
    this.map.panTo(HOME_POSITION);
  }
  
  //addMarker(place) {
  addMarker(place) {
    //console.log("This place is " + place);
    var lat = Number(place.venue.latitude);
    var lng = Number(place.venue.longitude);
    var myLatLng = {lat:lat, lng:lng};
    //initial myLatLng
    //var myLatLng = {lat:HOME_POSITION.lat, lng:HOME_POSITION.lng};

    //var image = '../../assets/' + place.venue.venue_type + '-40x40.png'
    //example: https://event-tickets-tracker-runderwood5.cs50.io/assets/pollsite-40x40.png
    
    var image = baseHHApiUrl + 'assets/' + place.venue.venue_type + '-40x40.png';
    
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        //title: place.venue.name,
        title: place.venue.name,
        icon: image
    });
    
    // Push Marker Into Array
    markers.push(marker);
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
  
  
  
  
  updateMap(types) {
    // get map's bounds
    var locationCenter = this.map.getCenter();
    var latitude = locationCenter.lat();
    var longitude = locationCenter.lng();
    var searchLocation = latitude+","+longitude;
    
    
    //types = types || ["all"];
    var typesString = allTypes.join("|");
    console.log("typesString is " + typesString);

    //https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0

    // get places within bounds (asynchronously)
    var parameters = {
        types:typesString,
        location:searchLocation,
        radius:'1000.0'
    };
    console.log(parameters);
    
    //    $.getJSON("../../api/v1/venues/search", parameters)
  
    //update(types) {
      //adapted from https://daveceddia.com/ajax-requests-in-react/
      //https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0
    
    var searchUrl = baseHHApiUrl + 'api/v1/venues/search';
    console.log(searchUrl);
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
          this.addMarker(res.data[i]);
          // Add handling such that only markers are added for venues and events
        }
      });
    }
    

  configureMap() {
    this.map.addListener('dragend', this.updateMap);
    this.map.addListener('zoom_changed', this.updateMap);
    this.map.addListener('dragstart', this.removeMarkers);
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
        <button onClick={this.panToHome}>Go to Home</button>
        <button onClick={this.addMarker}>Add Home Marker</button>
        <div ref="map" style={mapStyle}>I should be a map!</div>
      </div>
    );
  }
}

export default createContainer(() => {
  return {
  };

}, GoogleMapApp);
