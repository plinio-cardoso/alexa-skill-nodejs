var https = require('https');

exports.handler = (event, context) => {
    try {
        switch (event.request.type) {

            case 'LaunchRequest':
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true),
                        {}
                    )
                );
                break;

            case 'IntentRequest':
                switch(event.request.intent.name) {
                    case 'SearchProperties':
                        let location = event.request.intent.slots.location.value;
                        let search_type = event.request.intent.slots.search_type.value;
                        let property_type = event.request.intent.slots.property_type.value;
                        let endpoint = 'https://modern-mouse-73.localtunnel.me/v1/adverts/search/' + search_type + '/' + location;
                        let body = '';

                        if (location == undefined) {
                            context.succeed(
                                generateResponse(
                                    buildSpeechletResponse('Sorry, I don\'t know that location', true),
                                    {}
                                )
                            );

                            break;
                        }

                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => { body += chunk });

                            response.on('end', () => {
                                var data = JSON.parse(body);
                                if (data.length == 0) {
                                    console.log(data);
                                    context.succeed(
                                        generateResponse(
                                            buildSpeechletResponse('I didn\'t find any ' + property_type + ' for ' + search_type + ' in ' + location, true),
                                            {}
                                        )
                                    )
                                } else {
                                    let message = '';
                                    let i;

                                    for (i = 0; i < data.length; i++) {
                                        message += 'In ' + data[i].address + " for " + data[i].price + ' euro, ';
                                    }

                                    context.succeed(
                                        generateResponse(
                                            buildSpeechletResponse('I found ' + data.length + ' ' + property_type + ' in ' + location + ' for ' + search_type + '. ' + message, true),
                                            {}
                                        )
                                    )

                                }
                            })
                        });
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

};
/*
function formatResponse(data, location, context) {
    var message = '';

    var i;
    for (i = 0; i < data.length; i++) {
        //console.log(data[i]);
        message += data[i].address + ", ";
    }

    context.succeed(
        generateResponse(
            buildSpeechletResponse('I found ' + data.length + ' houses in ' + location + ' ' + message, true),
            {}
        )
    )
}*/

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
