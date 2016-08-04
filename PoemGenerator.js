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
 var options = ['2'];
 var selected_option = '2';
 var good_to_go = false;
 

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
        confirm(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        
        if(good_to_go === false){
            selected_option = options[options.length-1]
            options = ['2','4','14'];
            ask_topic(callback);
        }
        else{
            good_to_go = false;
            options = ['2'];
            retreivePoem(intent, session, callback);
        }

    } else if ("AMAZON.NoIntent" === intentName) {
        good_to_go = false;
        getOption(callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
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
    options = ['2'];
    var speechOutput = "Welcome to the Poem Generator. " +
        "Would you like me to generate a two line poem?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function ask_topic(callback){

    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Please tell me a topic and I will generate a poem for you";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please give me a topic by saying, " +
        "generate a love poem";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function getOption(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var n;
    var speechOutput;
    if (options.length === 1){
        speechOutput =  "Would you like me to generate a four line poem?";
        options[1] = '4';
    }
    else if (options.length === 2){
        speechOutput =  "Would you like me to generate a fourteen line poem?";
        options[2] = '14';
    }

    else{
        options = ['2'];
        getWelcomeResponse(callback);
    }
    
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "";
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
  return 'http://cage.isi.edu:8080/api/poem_short?id=2&topic='+encodeURIComponent(poemTopic)+'&k=1&model=0&nline='+selected_option;
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
        good_to_go = true;
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

        poemTopic = session.attributes.poemstopic;
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
              options = ['2'];
              good_to_go = false;
              callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            });
            
            

          }).on('error', function(e){
            console.log('Error: ' + e);
          });
        
    } else {
        speechOutput = "I'm not sure what the poem topic is. Please try again";
        repromptText = "I'm not sure what the poem topic is. You can tell me your " +
            "poem's topic by saying, get me a love poem";

        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}


function createPoemTopicAttributes(poemTopic) {
    return {
        poemstopic: poemTopic
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
