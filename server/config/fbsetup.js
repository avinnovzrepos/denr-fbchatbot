/* eslint-disable brace-style */
/* eslint-disable camelcase */
import request from 'request';

module.exports = function (controller) {
  // subscribe to page events
  request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.ACCESS_TOKEN,
    function (err, res, body) {
      if (err) {
        controller.log('Could not subscribe to page messages')
      }
      else {
        controller.log('Successfully subscribed to Facebook events:', body)
        console.log('Botkit can now receive messages')

        // start ticking to send conversation messages
        controller.startTicking()
      }
    })

  var url = 'https://graph.facebook.com/v2.11/me/thread_settings?access_token=' + process.env.ACCESS_TOKEN;

  // set up persistent menu
  var persistentMenu = {
    'setting_type' : 'call_to_actions',
    'thread_state' : 'existing_thread',
    'call_to_actions':[
      {
        'type': 'postback',
        'title': 'ABOUT CLEAN AIR ACT',
        'payload': 'About Clean Air Act',
      },
      {
        'type': 'postback',
        'title': 'CHECK AIR QUALITY INDEX',
        'payload': 'Check Air Quality Index',
      },
      {
        'type': 'postback',
        'title': 'USEFUL INFORMATION',
        'payload': 'Useful Information',
      }
    ]
  }

  request.post(url, {form: persistentMenu}, function (err, response, body) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('permanent menu added', body);
    }
  })

  // set up greetings
  var greetingForm = {
    'setting_type':'greeting',
    'greeting':{
      'text': `PH Air Quality Monitoring.`
    }
  }

  request.post(url, {form: greetingForm}, function (err, response, body) {
    if (err) {
      console.log(err)
    } else {
      console.log('greetings added', body)
    }
  })

  var gettingStarted = {
    "setting_type":"call_to_actions",
    "thread_state":"new_thread",    
    "call_to_actions":[
      {
        "payload":"Get Started"
      }
    ]
  }

  request.post(url, {form: gettingStarted}, function (err, response, body) {
    if (err) {
      console.log(err)
    } else {
      console.log('getting started added', body)
    }
  })
}

/* eslint-disable brace-style */
/* eslint-disable camelcase */