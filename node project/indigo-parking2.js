var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');


app.get('/', function(req, res){
  res.sendfile('websock.html');
});



//indigo parking data transfer
var webSocketUrl = "wss://api.artik.cloud/v1.1/websocket?ack=true";
var device_id = "9ca8c783a698424bb78b8caca31020a3"; // Indigo parking DEVICE ID
var device_token = "a9a8e78e74064f979d65c486afd306c1"; //Indigo parking DEVICE TOKEN
// import websocket module


var WebSocket = require('ws');
var isWebSocketReady = false;
var data="";
var ws = null;
// import serialport module
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0');

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});

//  errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

var parking_state=0;// variable to check for parking state_gate
// this is for demo purpose only


/**
 * Gets the current time in millis
 */
function getTimeMillis(){
    return parseInt(Date.now().toString());
}

/**
 * Create a /websocket connection and setup GPIO pin
 */
function start() {
    //Create the WebSocket connection
    isWebSocketReady = false;
    ws = new WebSocket(webSocketUrl);
    ws.on('open', function() {
        console.log("WebSocket connection is open ....");
    // after creating connection you have to register with your Authorization information
        register();
    });
    ws.on('message', function(data) {
      //this loop is called whenever the client sends some message
         handleRcvMsg(data); //data is received to the function handleRcvMsg()
    });
    ws.on('close', function() {
        console.log("WebSocket connection is closed ....");

    });      
    
}

/**
 * Sends a register message to /websocket endpoint
 */
//Client will only work when device gets registered from here
function register(){
    console.log("Registering device on the WebSocket connection");
    try{
        var registerMessage = '{"type":"register", "sdid":"'+device_id+'", "Authorization":"bearer '+device_token+'", "cid":"'+getTimeMillis()+'"}';
        console.log('Sending register message ' + registerMessage + '\n');
        ws.send(registerMessage, {mask: true});
        isWebSocketReady = true;
    }
    catch (e) {
        console.error('Failed to register messages. Error in registering message: ' + e.toString());
    }    
}


//data after receiving is sent here for processing
function handleRcvMsg(msg){
    var msgObj = JSON.parse(msg);
    if (msgObj.type != "action") return; //Early return;

    var actions = msgObj.data.actions;
    var actionName = actions[0].name; //assume that there is only one action in actions
    console.log("The received action is " + actionName);
  
    //you must know your registered actions in order to perform accordinlgy
    // we will not receive any action in our case
    if (actionName.toLowerCase() == "parking_state") 
    { 
       // your code here 
    }
    else {
         //this loop executes if some unregistered action is received
         //so you must register every action in cloud
        console.log('Do nothing since receiving unrecognized action ' + actionName);
        return;
    }
   
}



/**
 * Send one message to ARTIK Cloud
 */
//This function is responsible for sending commands to cloud
if(JSON.stringify(data)==7 || JSON.stringify(data)==8){
function sendStateToArtikCloud(data){
var stringdata = JSON.stringify(data);
    	try{
        ts = ', "ts": '+getTimeMillis();
        var data = {
            "indigolot": stringdata
//setting the parking value from argument to our cloud variable "parking"
//we will get the value from arduino
            };
        var payload = '{"sdid":"'+device_id+'"'+ts+', "data": '+stringdata+', "cid":"'+getTimeMillis()+'"}';
        console.log('Sending payload ' + payload + '\n');
        ws.send(payload, {mask: true});
    } catch (e) {
        console.error('Error in sending a message: ' + e.toString() +'\n');
    }    
}
}


function exitClosePins() {
    
        console.log('Exit and destroy all pins!');
        process.exit();
    
}


start();
//exectes every time when data is received from arduino (30sec programmed delay from arduino)
port.on("open", function () {
    port.on('data', function(data) {

            console.log("Serial port received data:" + data);
			if(data>5 && data<=13){
			//if (typeof data != "undefined") {
			console.log("the object is true");
			io.once('connection', function(socket){
			var state= "Parked";
				socket.emit('nextpage',state);
			});
}else if(data>27)
{
io.once('connection', function(socket){
console.log("Vacant");
var state2="Vacant";
socket.emit('nextpage2',state2);})}
            
            sendStateToArtikCloud(data);
           
    });
});


process.on('SIGINT', exitClosePins);
http.listen(1337, '192.168.43.8', function(){
console.log('listening on localhost:192.168.43.8:1337');} );
