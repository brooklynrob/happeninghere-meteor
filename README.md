## Meteor Use
* Download and install meteor
    * See https://www.meteor.com/install
    ** Command: `curl https://install.meteor.com/ | sh`

### Creating a meteor app
* Creating an app
    * `meteor create --bare` to create an empty app.  
    * `meteor create --full` to create a scaffolded app.

### Start a meteor app
* Running `meteor run --port 8080`


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




    