import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data';
import axios from 'axios';

//import {withGoogleMap} from "react-google-maps";
//import {withGoogleMap, GoogleMap} from "react-google-maps";
//import {GoogleMapsLoader} from "google-maps";


const HOME_POSITION = {
  //40.6793399,-73.975184
  //  lat: 40.6793399,
  lat: 40.6794399,
  lng: -73.975184
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

var types= ["venue","pollsite","citibike","liquor_license_applicant"];
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
    //var myObject = JSON.parse(myjsonstring);
    //$.getJSON("../../api/v1/venues/search", parameters)
    

    //var lat = Number(place.venue.latitude);
    //var lng = Number(place.venue.longitude);
    //var lat=40.6795851;
    //var lng=-73.9771885;
    

    //initial myLatLng
    var myLatLng = {lat:HOME_POSITION.lat, lng:HOME_POSITION.lng};
    
    myLatLng = place || myLatLng;
    
    //var image = '../../assets/' + place.venue.venue_type + '-40x40.png'
    //example: https://event-tickets-tracker-runderwood5.cs50.io/assets/pollsite-40x40.png
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        //title: place.venue.name,
        title: "home",
        icon: 'https://event-tickets-tracker-runderwood5.cs50.io/assets/pollsite-40x40.png'
    });
    
    
  }
  
  updateMap() {
  //update(types) {
    //adapted from https://daveceddia.com/ajax-requests-in-react/
    //https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0
    
    var url = 'https://event-tickets-tracker-runderwood5.cs50.io/api/v1/venues/search?types=venue%7Cpollsite%7Ccitibike%7Cliquor_license_applicant&location=40.7159%2C-73.98609999999996&radius=1000.0';
    
    axios.get(url)
      .then(res => {
        const json_data = res.data.map(obj => obj.data);
        console.log(json_data);
        console.log(res.data);
      
        //this.setState({ posts });
      });
    }
    
    //parse JSON into 
    
  //DidMount
  componentDidMount() {
    this.map = new google.maps.Map(this.refs.map, options);
    this.updateMap();
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
