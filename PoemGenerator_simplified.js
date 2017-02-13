/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
 var http = require('http');
 var selected_option = '4';

 

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("GetPoem" === intentName) {
        retreivePoem(intent, session, callback); 
    }else if ("AMAZON.YesIntent" === intentName) {
        retreivePoem(intent, session, callback);
    }else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Poem Generator. " +
        "Please give me a topic.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please give me a topic by saying, " +
        "write me a poem about mountains";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Thank you for trying the Peom Generator Application. Have a nice day!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;
    

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

var url = function(poemTopic){
  //generate a random number for id within range (min,max)
  var min = 0;
  var max = 10000;
  var id = Math.floor(Math.random() * (max - min + 1)) + min;
  //modify the poemTopic to fit the API i.e. replace spaces with underscore
  var updatedPoemTopic = poemTopic.split(" ").join("_");
  return 'http://vivaldi.isi.edu:8080/api/poem_check?topic=' + updatedPoemTopic + '&k=1&model=0&id=' + id + '&nline=' + selected_option + '&encourage_words=&disencourage_words=&enc_weight=0&cword=-5&reps=0&allit=0&topical=1&wordlen=0';
};

var getJson = function(poemTopic, callback){
  http.get(url(poemTopic), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      console.log('RESULT'+result);
      callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};


function confirm(intent, session, callback){
    var cardTitle = intent.slots.Topic.value;
    var poemTopicSlot = intent.slots.Topic;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (poemTopicSlot) {
        sessionAttributes = createPoemTopicAttributes(poemTopicSlot.value);
        speechOutput = "You said " + poemTopicSlot.value + ", right?" ;
    } else{
        speechOutput = "I'm not sure what the topic is. Please try again";

    }
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function retreivePoem(intent, session, callback){
    var cardTitle = "";
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var poemTopic;

    if (session.attributes) {

        poemTopic = session.attributes.topic;
        cardTitle = poemTopic;
        http.get(url(poemTopic), function(res){
            var body = '';

            res.on('data', function(data){
              body += data;
            });

            res.on('end', function(){
              var result = JSON.parse(body);
              var cleanResult = result.poem;
              cleanResult = cleanResult.replace(/<br\/\/>/g , "");
              speechOutput = cleanResult;
              callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            });
            
            

          }).on('error', function(e){
            console.log('Error: ' + e);
          });
        
    } else {
        speechOutput = "I'm not sure what the poem topic is. Please try again";
        repromptText = "I'm not sure what the poem topic is. You can tell me your " +
            "poem's topic by saying, write me a poem about mountains.";

        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}


function createPoemTopicAttributes(poemTopic) {
    return {
        topic: poemTopic
    };
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "A Poem About " + title,
            content:  output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}