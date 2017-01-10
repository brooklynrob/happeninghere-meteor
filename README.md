** Download and instsall meteor
# See https://www.meteor.com/install
curl https://install.meteor.com/ | sh

** Create a meteor app
meteor create --bare to create an empty app.  
meteor create --full to create a scaffolded app.


** Start a meteor app
meteor run --port 8080


** If you can meteor babel error, run...
meteor npm install --save babel-runtime

** If problems
meteor npm install --save meteor-node-stubs

** Install react components
meteor npm install --save react react-dom

** Go to mongo console through Meteor
meteor mongo

** mongo commands
show dbs                                                                #show databases
show collections                                                        #show collections
db.venues.find();                                                       #show all venues
db.venues.insertOne({name:"New Venue"});                                #insert one record
db.venues.updateOne({"name":"New Venue"},{$set:{"city":"New York"}});   #update one record

db.students.drop(); #drop students collection


        <button onClick={this.panToHome}>Go to Home</button>
        <button onClick={this.addMarker}>Add Home Marker</button>




    