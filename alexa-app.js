var https = require('https');

exports.handler = (event, context) => {

    try {

        if (event.session.new) {
            // New Session
            console.log("NEW SESSION")
        }

        switch (event.request.type) {

            case "LaunchRequest":
                // Launch Request
                console.log(`LAUNCH REQUEST`)
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true),
                        {}
                    )
                )
                break;

            case "IntentRequest":
                // Intent Request
                console.log(`INTENT REQUEST`)

                switch(event.request.intent.name) {
                    case "GetHousesForSale":
                        var location = event.request.intent.slots.location.value;
                        var endpoint = "https://tiny-cow-77.localtunnel.me/v1/adverts/" + location;
                        var body = "";
                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => { body += chunk })
                            response.on('end', () => {
                                var data = JSON.parse(body)
                                
                                if (location == undefined) {
                                    context.succeed(
                                        generateResponse(
                                            buildSpeechletResponse('Sorry, I don\'t know that location', true),
                                            {}
                                        )
                                    )
                                } else {
                                    if (data.length == 0) {
                                        context.succeed(
                                            generateResponse(
                                                buildSpeechletResponse('I didn\'t find any house for sale in ' + location, true),
                                                {}
                                            )
                                        )
                                    } else {
                                        context.succeed(
                                            generateResponse(
                                                buildSpeechletResponse('I found ' + data.length + ' houses in ' + location, true),
                                                {}
                                            )
                                        )
                                }   
                                }
                            })
                        })
                        break;

                    default:
                        throw "Invalid intent"
                }

                break;

            case "SessionEndedRequest":
                // Session Ended Request
                console.log(`SESSION ENDED REQUEST`)
                break;

            default:
                context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

        }

    } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
function buildSpeechletResponse (outputText, shouldEndSession) {

    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    }

}

function generateResponse (speechletResponse, sessionAttributes) {

    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }

}
