'use strict';   
    
var admin = require('firebase-admin');
var nodemailer = require('nodemailer');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var serverStartTime = Math.floor(new Date() / 1);

// using SendGrid's v3 Node.js Library 
// https://github.com/sendgrid/sendgrid-nodejs
const mail = require('@sendgrid/mail');
mail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'eeisaman@auburnschl.edu',
//   from: 'elhs_software.com',
//   subject: 'Sending with SendGrid is Fun',
//   text: 'Rockin the Node.js',
//   html: '<h1>Rockin the Node.js</h1>',
// };
//mail.send(msg); 

// Tell Socket.io to start accepting connections
// 1 - Keep a dictionary of all the players as key/value 
var players = {};
io.on('connection', function(socket){
    console.log("New player has connected with socket id:",socket.id);
    socket.on('new-player',function(state_data){ // Listen for new-player event on this client 
      console.log("New player has state:",state_data);
      // 2 - Add the new player to the dict
      players[socket.id] = state_data;
      // Send an update event
      io.emit('update-players',players);
    })
    
    socket.on('sendFBUID',function(data){
      socket.uid = data.uid;
      console.log(`Received player's Google Firebase UID of ${data.uid}`);
      sendThankYouToUser(data.uid);  
    });  
  
    socket.on('disconnect',function(){
      // 3- Delete from dict on disconnect
      delete players[socket.id];
      // Send an update event 
      io.emit('update-players',players);
    })
  // Multi-player data throughput
    socket.on('send-update',function(data){
      if(players[socket.id] == null) return;
      players[socket.id].x = data.x; 
      players[socket.id].y = data.y; 
      players[socket.id].angle = data.angle; 
      players[socket.id].currAnim = data.currAnim;
      players[socket.id].text = data.text;
      io.emit('update-players',players);
    })
  
})

// Configure the email transport using the default SMTP transport and a GMail account.
// See: https://nodemailer.com/
// For other types of transports (Amazon SES, Sendgrid...) see https://nodemailer.com/2-0-0-beta/setup-transporter/
// var mail = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true, // true for 465, false for other ports
//         auth: {
//             user: process.env.GMAIL_ADDRESS,
//             pass: process.env.GMAIL_PASSWORD
//         }
//     });     
// verify connection configuration  
// mail.verify(function(error, success) {
//    if (error) {
//         console.log(error);
//    } else {
//         console.log('Server is ready to take our messages');
//    }     
// });

// [START initialize]
// Initialize the app with a service account, granting admin privileges       
admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": process.env.PROJECT_ID,
    "clientEmail": process.env.CLIENT_EMAIL,
    "privateKey": process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }), 
  databaseURL: 'https://'+process.env.PROJECT_ID+'.firebaseio.com'
});
// [END initialize]
    
// Set our simple Express server to serve up our front-end files
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

// This function is not used. It remains as an example for Timestamp and multiple updates at once.
function updateNotification(uid, postId){
  var update = {};
  update['/posts/' + postId + '/lastNotificationTimestamp'] =
    admin.database.ServerValue.TIMESTAMP;
  update['/player-posts/' + uid + '/' + postId + '/lastNotificationTimestamp'] =
    admin.database.ServerValue.TIMESTAMP;
  admin.database().ref().update(update);
}
/**
 * Send a thank you email to the user with the given UID.
 */
// [START single_value_read]
function sendThankYouToUser(uid) {
  // Fetch the user's email.
  var userRef = admin.database().ref('/users/' + uid);
  console.log(`Firebase user reference obtained for ${uid}`);
  userRef.once('value').then(function(snapshot) {
    var email = snapshot.val().email;
    console.log(`User email is ${email}`);
    if (email) {
      sendThankYouEmail(email).then(function() {
      }, function(reason) { // Email send failure
            console.log(reason); // Error
      });
    } 
  }).catch(function(error) {
    console.log('Failed to obtain user data from Firebase:', error);
  });
}   
// [END single_value_read]
/**
 * Send the new star notification email to the given email.
 */  
function sendThankYouEmail(email) {
  console.log(`Attempting email to ${email}`);
  var mailOptions = {
    from: 'Gardner Industries <noreply@elhs.com>',
    to: email,
    subject: 'Welcome Aboard!',
    text: 'Our industry doesnt really do anything.',
    html: '<h1>Our Community Building base app</h1><p>designed to get developers started with user authenticated multiplayer applications.</p>'
  };
  return mail.send(mailOptions).then(function() {
    console.log('New thank you email sent to: ' + email);
  });
}
/**
 * Illustrates firebase-admin access to all of database.
 * Note: grabbing the entire database state should not
 * be done routinely. Database references should be made as
 * narrow as possible.
 */ 
// var rootRef = admin.database().ref('/');
// rootRef.once('value').then(function(d){
//   console.log(d.val());
// })
// .catch(function(e){console.log(e)});
// Listen for http requests
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});