var Botkit = require('./lib/Botkit.js');

var RECEIVEMESSAGEITERATIONS = '4';
var STARTEDTYPINGITERATIONS = '5';
var EMOTIONTHREASHOLD = 0.5;
var LASTMESSAGESENTTIMESTAMP = 0;
var LOGFILENAME = 'studylog.txt'
var request = require('./vars.js');
var SELFUSERID = request.SELFUSERID;
var emotionResults = [];
var startedTypingResults = [];

//code to write to file
fs = require('fs');

function write_file (text) {
    fs.appendFile(LOGFILENAME, text + "\n", function (err, data) {
      if (err) return console.log(err);
      console.log(data);
    });
}


var EMOTION_EMOTICON_HASH = {contempt:'contempt_purple', anger:'angry_purple', disgust:'disgust_purple',fear:'fearful_purple',happiness:'happy_purple', neutral:'neutral_face_purple', sadness:'sad_purple', surprise:'surprised_purple'}
//var EMOTION_EMOTICON_HASH = {contempt:'contempt_green', anger:'angry_green', disgust:'disgust_green',fear:'fearful_green',happiness:'happy_green', neutral:'neutral_face_green', sadness:'sad_green', surprise:'surprised_green'}



if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.env['token'] = request.token;
    //process.exit(1); //comment
    write_file(Date.now() + ", starting_session, "); 
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: false

});

var bot = controller.spawn({
    token: process.env.token
}).startRTM(); 


console.log('Env token '+process.env.token);
// not working
// console.log('Bot token '+bot.token);


var http = require('http');
var httpserver = require('http').createServer();
var ioserver = require('socket.io')(httpserver);

httpserver.listen(3001, function(){
    console.log('stub server listening on *:3001');
});



ioserver.on('connection', function(socket){
    write_file(Date.now() + ", emotion_client_connected"); 
	console.log('an emotion client connected');
	//stubsockets.add(socket);
	socket.on('emote', function(data) {
        //parse Json data
        if (data) {
            console.log('incoming emote all data *** ' + data);
            console.log('incoming emote *** ' + data.response);
            var emotionResponse = JSON.parse(data.response);
            if (data.response.code != "RateLimitExceeded" && emotionResponse[0] != undefined) {
                addEntry(data.time, data.channel, emotionResponse[0].scores, data.iterations); 
                console.log('added entry:: '+ 'timeStamp:'+ data.time + 'channel:' + data.channel + 'iterations:' + data.iterations + 'scores:' + emotionResponse[0].scores);
            } 
            else {
                console.log('RateLimitExceeded!!!')
                write_file(Date.now() + ", RateLimitExceeded"); 
            }

        }
	});

    
	socket.on('disconnect', function(){
		console.log('emotion client disconnected');
        write_file(Date.now() + ", emotion_client_disconnected"); 
		stubsockets.delete(socket);
	});

});


//handle failure
ioserver.on('connect_failed', function() {
    console.log('connection_failed on *&&& ***:3000');
});
		
function receivedMessageFromOther(ts, ch, text){
    console.log('**** &&&&& ***** sendMessage called');

    ioserver.emit('message', {time: ts, channel: ch, text: text, iterations: RECEIVEMESSAGEITERATIONS});
    console.log('emit: message');

};

function startedTyping(ts, ch){
    console.log('**** &&&&& ***** started typing');

    ioserver.emit('message', {time: ts, channel: ch, text: "", iterations: STARTEDTYPINGITERATIONS});
    console.log('emit: message');
};







controller.on('ambient', function(bot, message) {
	//console.log("On");
    
    console.log('In message_received' + ' ts:' + message.ts + ' channel:' + message.channel + ' type:' + message.type + ' text:' + message.text + ' user: ' + message.user);
    

	//bot.api.reactions.add({                   
	// 		timestamp: message.ts,
	// 		channel: message.channel,
	// 		name: 'grinning',
	// 	}, function(err, res) {
	// 		if (err) {
	// 			bot.botkit.log('Failed to add emoji reaction :(', err);
	// 		}
	// 	}); 
	
    if (message.user != SELFUSERID) {
        write_file(Date.now() + ", message_received, TS: " + message.ts + ", User: " + message.user + ", Text: " + message.text +", Channel: " + message.channel); 
        receivedMessageFromOther(message.ts, message.channel, message.text);
    } else {
        write_file(Date.now() + ", message_sent, TS: " + message.ts + ", User: " + message.user +", Text: " + message.text +", Channel: " + message.channel); 
        setSendEmotion(message.ts, message.channel, message.text);
    }
});

controller.on('message_received', function(bot, message) {
    //console.log("On");
    
    console.log('In message_received' + ' ts:' + message.ts + ' channel:' + message.channel + ' type:' + message.type + ' text:' + message.text + ' user: ' + message.user);
    

    // bot.api.reactions.add({
    //      timestamp: message.ts,
    //      channel: message.channel,
    //      name: 'grinning',
    //  }, function(err, res) {
    //      if (err) {
    //          bot.botkit.log('Failed to add emoji reaction :(', err);
    //      }
    //  });
    
    if (message.user == SELFUSERID && message.type == 'user_typing') {
    //    write_file(Date.now() + ", started_typing, " + message.ts +"," + message.channel); 
        startedTyping(Date.now(), message.channel);

        //track expression until the message is sent
    }
});


/*
controller.hears('ambient', function(bot, message) {
	//time = message.ts;
	//console.log(time);
	console.log('**** &&& **** ambient detected');
	//console.log(message.ts, message.channel);
	bot.api.reactions.add({
			timestamp: message.ts,
			channel: message.channel,
			name: 'grinning',
		}, function(err, res) {
			if (err) {
				bot.botkit.log('Failed to add emoji reaction :(', err);
			}
		});
});*/
//test code to call swift emotion detection

// function call_emotion(){
//     httpserver.listen(3001, function(){
//         console.log('stub server listening on *:3001');
//         setTimeout(function(){
//             sendMessage(Date.now(),"Ruhi");
//         }, 20000);

//         //add this code to the controller.hears(['emotion' ... after sendMessage
//         //wait for 10 miliseconds
//         setTimeout(function(){
//             var max = 0;
//             //check index for number of entries, average, pick dominant emotion score and respond with corresponding emoji
            
//             //reset the index of the gloabl scores array to 0
//         }, 10000);

//     });
// } 

//call_emotion();


//move all code below to the slack_bot


// TODO: call addEntry every time there is an emotion dataPoint in the controller handler
function addEntry(ts, ch, sc, it) //(timeStamp, channel, scores) 
{
    var indexFound = 0;
    var addedEntry = false;
    console.log('in addEntry function');
    
    write_file(Date.now() + ", received_emotion_scores, TS: " + ts +", CH: " + ch +", IT: " + it + ", SC: " + JSON.stringify(sc)); 

    //check if inputs are valid
    if(ts === undefined || ch == undefined || sc == undefined) {
        console.log('entry empty, not added');
        return;
    }

    if(it == RECEIVEMESSAGEITERATIONS) {

        //first check if we already have an entry with the same timeStamp & channel
        if(emotionResults.length>0){

            //indexFound = emotionResults.indexOf.timeStamp(ts);
            for (var i = 0; i < emotionResults.length; i++) {
            
                if (emotionResults[i].timeStamp == ts && emotionResults[i].channel == ch){
                    indexFound = i;
                    break;
                }
            }
           
            if (indexFound != -1) {

                emotionResults[indexFound].scores.push(sc);
                
                //increment the count emotion dataPoints
                emotionResults[indexFound].dataPoints ++;
                addedEntry = true;
                console.log('updated existing entry');
                console.log('entry:' + emotionResults[indexFound]);



                
                //If reached 10 data points, compute & send the emotion
                if (emotionResults[indexFound].dataPoints >= emotionResults[indexFound].iterations) {
                    
                    computeAndSendEmotion(emotionResults[indexFound]);
                    
                    //remove this result from the array, it is processed.
                    emotionResults.splice(indexFound, 1);
                }
            }
         }
         if (!addedEntry) {
            //add to the array, set dataPoints to 1
            var empty_scores = [];
            empty_scores.push(sc);

            emotionResults.push({
                timeStamp: ts,
                channel: ch,
                scores: empty_scores,
                iterations: it,
                dataPoints: 1        
            });
            console.log('added new entry');
            console.log('entry:' + emotionResults[indexFound].scores[0]);
        }
    } else if (it == STARTEDTYPINGITERATIONS) {

/*        //first check if we already have an entry with the same timeStamp & channel

        if(startedTypingResults.length>0){
            //indexFound = emotionResults.indexOf.timeStamp(ts);
            for (var i = 0; i < startedTypingResults.length; i++) {
                console.log('startedTypingResults timestamp: ' + startedTypingResults[i].timeStamp);
                console.log('last timestamp: ' + LASTMESSAGESENTTIMESTAMP);

                if (startedTypingResults[i].timeStamp < LASTMESSAGESENTTIMESTAMP){
                    console.log('removed from started typing results, timestamp: ' + startedTypingResults[i].timeStamp);
                    startedTypingResults.splice(i, 1);
               }
            }
        }*/


        startedTypingResults.push({
            timeStamp: ts,
            channel: ch,
            scores: sc,
            iterations: it   
        });
        
    }
    
}  

var emotionResults = [];


//ToDO: write this function
function computeAndSendEmotion(emotionEntry) {
    //TODO: pick max of running sum among the emotionEntry.scores.* 
    
    var emotions = {};
    emotions['contempt'] = [false];
    emotions['anger'] = [false];
    emotions['disgust'] = [false];
    emotions['fear'] = [false];
    emotions['happiness'] = [false];
    emotions['neutral'] = [false];
    emotions['sadness'] = [false];
    emotions['surprise'] = [false];

    for (i in emotionEntry.scores) {
        if (emotionEntry.scores[i].contempt >= EMOTIONTHREASHOLD) {
            emotions['contempt'] = [true];
        }
        if (emotionEntry.scores[i].anger >= EMOTIONTHREASHOLD) {
             emotions['anger'] = [true];
        }
        if (emotionEntry.scores[i].disgust >= EMOTIONTHREASHOLD) {
            emotions['disgust'] = [true];
        }
        if (emotionEntry.scores[i].fear >= EMOTIONTHREASHOLD) {
            emotions['fear'] = [true];
        }
        if (emotionEntry.scores[i].happiness >= EMOTIONTHREASHOLD) {
            emotions['happiness'] = [true];
        }
        if (emotionEntry.scores[i].neutral >= EMOTIONTHREASHOLD) {
            emotions['neutral'] = [true];
        }
        if (emotionEntry.scores[i].sadness >= EMOTIONTHREASHOLD) {
            emotions['sadness'] = [true];
        }
        if (emotionEntry.scores[i].surprise >= EMOTIONTHREASHOLD) {
            emotions['surprise'] = [true];
        }                                        
    }
       

    console.log('in computeAndSendEmotion function');
    console.log('emotion is ' + Object.keys(emotions));
    //TODO: send the dominant emotion to the emotionEntry.channel
    //if (dominantEmotion = 'happiness') {
  
    //}

    Object.keys(emotions).forEach(function (key) {
        if (emotions[key] == "true" && key != "neutral") {
            console.log('adding ' + key + ' value: ' + emotions[key]); 
            addReaction (emotionEntry.timeStamp, emotionEntry.channel, EMOTION_EMOTICON_HASH[key]);
        }

    })

    
}

//ToDO: write this function
function setSendEmotion(ts, ch, sc) {

    //first clean up previous results

    if(startedTypingResults.length>0){
        //indexFound = emotionResults.indexOf.timeStamp(ts);
        console.log("started typing results length: " + startedTypingResults.length )
        for (var i = 0; i < startedTypingResults.length; i++) {
            console.log('happiness_pre: ' + startedTypingResults[i].scores.happiness);

            console.log('count: ' + i);
            console.log('startedTypingResults timestamp: ' + startedTypingResults[i].timeStamp);
            console.log('last timestamp: ' + LASTMESSAGESENTTIMESTAMP);

            if (startedTypingResults[i].timeStamp < LASTMESSAGESENTTIMESTAMP){
                console.log('removed from started typing results, timestamp: ' + startedTypingResults[i].timeStamp);
                startedTypingResults.splice(i, 1);
                i = i-1;
           }
        }
    }
    //TODO: pick max of running sum among the emotionEntry.scores.* 
    
    var emotions = {};
    emotions['contempt'] = [false];
    emotions['anger'] = [false];
    emotions['disgust'] = [false];
    emotions['fear'] = [false];
    emotions['happiness'] = [false];
    emotions['neutral'] = [false];
    emotions['sadness'] = [false];
    emotions['surprise'] = [false];

    for (i in startedTypingResults) {
        if (startedTypingResults[i].scores.contempt >= EMOTIONTHREASHOLD) {
            emotions['contempt'] = [true];
        }
        if (startedTypingResults[i].scores.anger >= EMOTIONTHREASHOLD) {
             emotions['anger'] = [true];
        }
        if (startedTypingResults[i].scores.disgust >= EMOTIONTHREASHOLD) {
            emotions['disgust'] = [true];
        }
        if (startedTypingResults[i].scores.fear >= EMOTIONTHREASHOLD) {
            emotions['fear'] = [true];
        }
        if (startedTypingResults[i].scores.happiness >= EMOTIONTHREASHOLD) {
            emotions['happiness'] = [true];
        }
        if (startedTypingResults[i].scores.neutral >= EMOTIONTHREASHOLD) {
            emotions['neutral'] = [true];
        }
        if (startedTypingResults[i].scores.sadness >= EMOTIONTHREASHOLD) {
            emotions['sadness'] = [true];
        }
        if (startedTypingResults[i].scores.surprise >= EMOTIONTHREASHOLD) {
            emotions['surprise'] = [true];
        }                                        
    }
       

    console.log('in setSendEmotion function');
    //TODO: send the dominant emotion to the emotionEntry.channel
    //if (dominantEmotion = 'happiness') {
  
    //}

    Object.keys(emotions).forEach(function (key) {
        if (emotions[key] == "true" && key != "neutral") {
            console.log('adding ' + key + ' value: ' + emotions[key]); 
            addReaction (ts, ch, EMOTION_EMOTICON_HASH[key]);
        }
    })

    LASTMESSAGESENTTIMESTAMP = Date.now()

}

function addReaction(ts, ch, emoticon_name) {
    write_file(Date.now() + ", adding_reaction, TS: " + ts +", CH: " + ch +", Emoticon_name: " + emoticon_name); 
    bot.api.reactions.add({
            timestamp: ts,
            channel: ch,
            name: emoticon_name,
        }, function(err, res) {
            if (err) {
                bot.botkit.log('Failed to add emoji reaction :(', err);
            }
        
     });

}
