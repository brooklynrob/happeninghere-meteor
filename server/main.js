import { Meteor } from 'meteor/meteor';
import '../imports/api/tweets.js';
import '../imports/api/tasks.js';
import '../imports/api/venues.js';


Meteor.startup(() => {
  console.log("Server is starting!");
  // code to run on server at startup
});
