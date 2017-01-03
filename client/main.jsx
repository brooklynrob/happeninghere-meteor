import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
import GoogleMapApp from '../imports/ui/GoogleMapApp.jsx';
 
Meteor.startup(() => {
    render(<App />, document.getElementById('render-target'));
    render(<GoogleMapApp />, document.getElementById('map-target'));
});