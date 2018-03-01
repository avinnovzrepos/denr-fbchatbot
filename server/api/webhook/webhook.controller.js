/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/webhook              ->  index
 */

'use strict';

import Botkit from 'botkit';
import request from 'request';
import axios from 'axios';

const BOT_CONTROLLER = Botkit.facebookbot({
  access_token: process.env.ACCESS_TOKEN,
  verify_token: process.env.VERIFY_TOKEN
 });

const bot = BOT_CONTROLLER.spawn({});

// SETUP
require('../../config/fbsetup')(BOT_CONTROLLER);

//this is triggered when a user clicks the send-to-messenger plugin
BOT_CONTROLLER.on('facebook_optin', function(bot, message) {
  bot.reply(message, 'Welcome to my app!');
});

// user said hello
BOT_CONTROLLER.hears(['hello'], 'message_received', function(bot, message) {
  bot.reply(message, 'Hey there.');
});

// Initial Process
BOT_CONTROLLER.hears(['Get Started'], 'message_received', function (bot, message) {
  request(`https://graph.facebook.com/v2.6/${message.user}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${process.env.ACCESS_TOKEN}`,
    function(err, resp, user) {
      let userObj = JSON.parse(user);
      bot.reply(message, `Hi ${userObj.first_name}. Let's get started.`);
      bot.startConversation(message, mainMenu);
  });
});

const mainMenu = (response, convo) => {
  convo.ask({
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'Please pick an option below to get going',
        buttons: [{
          title: 'ABOUT CLEAN AIR ACT',
          payload: 'About Clean Air Act',
          type: "postback"
        }, {
          title: 'CHECK AIR QUALITY INDEX',
          payload: 'Check Air Quality Index',
          type: "postback"
        }, {
          title: 'USEFUL INFORMATION',
          payload: 'Useful Information',
          type: "postback"
        }]
      }
    }
  },
  [
    {
      pattern: 'About Clean Air Act',
      callback: (response, convo) => {
        convo.say('TODO');
        convo.next();
      }
    },
    {
      pattern: 'Check Air Quality Index',
      callback: (response, convo) => {
        askRegion(response, convo);
        convo.next();
      }
    },
    {
      pattern: 'Useful Information',
      callback: (response, convo) => {
        convo.say('TODO');
        convo.next();
      }
    },
    {
      default: true,
      callback: (response, convo) => {
        mainMenu(response, convo);
        convo.next();
      }
    }
  ]);
};

const askRegion = (response, convo) => {
  let stations = [];

  getStations()
    .then((result) => {
      stations = result.data;
    })
    .catch(err => {
      console.log(err);
    });

  convo.ask({
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'NCR',
                payload: 'NCR',
                type: "postback"
              }, {
                title: 'REGION 1',
                payload: 'Region 1',
                type: "postback"
              }, {
                title: 'REGION 2',
                payload: 'Region 2',
                type: "postback"
              }
            ]
          },
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'REGION 3',
                payload: 'Region 3',
                type: "postback"
              }, {
                title: 'REGION 4A',
                payload: 'Region 4A',
                type: "postback"
              }, {
                title: 'REGION 4B',
                payload: 'Region 4B',
                type: "postback"
              }
            ]
          },
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'REGION 5',
                payload: 'Region 5',
                type: "postback"
              }, {
                title: 'REGION 6',
                payload: 'Region 6',
                type: "postback"
              }, {
                title: 'REGION 7',
                payload: 'Region 7',
                type: "postback"
              }
            ]
          },
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'REGION 8',
                payload: 'Region 8',
                type: "postback"
              }, {
                title: 'REGION 9',
                payload: 'Region 9',
                type: "postback"
              }, {
                title: 'REGION 10',
                payload: 'Region 10',
                type: "postback"
              }
            ]
          },
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'REGION 11',
                payload: 'Region 11',
                type: "postback"
              }, {
                title: 'REGION 12',
                payload: 'Region 12',
                type: "postback"
              }, {
                title: 'REGION 13',
                payload: 'Region 13',
                type: "postback"
              }
            ]
          },
          {
            title: "SWIPE LEFT/RIGHT FOR MORE OPTIONS",
            buttons: [
              {
                title: 'CAR',
                payload: 'CAR',
                type: "postback"
              }
            ]
          }
        ]
      }
    }
  },
  [
    {
      pattern: 'Go To Main Menu',
      callback: (response, convo) => {
        convo.say('TODO Go To Main Menu');
        convo.next();
      }
    },
    {
      default: true,
      callback: (response, convo) => {
        showStations(response, convo, stations[response.payload]);
        convo.next();
      }
    }
  ]);
};

const getStations = () => {
  return axios({
    url: 'http://54.255.149.40:9000/api/v1/readings/latest',
    headers: {
      Authorization: 'Basic YWRtaW5AYXZpbm5vdnouY29tOlBAc3N3MHJk'
    },
    transformResponse: data => groupBy(data, 'region')
  });
};

const showStations = (response, convo, stations) => {
  let stationsTemplate = [];
  let convoPattern = [];
  stations.map(value => {
    stationsTemplate.push({
      title: value.station.station_name,
      subtitle: `Status: \"${value.concern_level}\", AQI VALUE: ${value.aqi_pm25.toFixed(2)} (PM2.5) As of ${new Date(value.updated_at).toDateString()}`,
      image_url: `https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=${value.station.latitude},${value.station.longitude}.04&zoom=15&markers=${value.station.latitude},${value.station.longitude}`,
      item_url: `http:\/\/maps.apple.com\/maps?q=${value.station.latitude},${value.station.longitude}&z=16`,
      buttons: [{
        type: "postback",
        title: "SHOW DETAIL INFO",
        payload: value.station.station_name
      }, {
        type: "postback",
        title: "SELECT OTHER REGION",
        payload: "Select Other Region"
      }, {
        type: "postback",
        title: "GO TO MAIN MENU",
        payload: "Go To Main Menu"
      }],
    });
    convoPattern.push({
      pattern: value.station.station_name,
      callback: (response, convo) => {
        showDetailedStations(response, convo, value);
        convo.next();
      }
    });
  });

  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: stationsTemplate
      }
    }
  },
  [
    ...convoPattern,
    {
      pattern: 'Select Other Region',
      callback: (response, convo) => {
        askRegion(response, convo);
        convo.next();
      }
    },
    {
      default: true,
      callback: (response, convo) => {
        convo.say('Please Select One');
        mainMenu(response, convo);
        convo.next();
      }
    }
  ]);
};
//show details
const showDetailedStations = (response, convo, info) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: info.station.station_name,
          subtitle: `
                      ${info.station.address}
                      Status: \"${info.concern_level}\",
                      AQI VALUE: ${info.aqi_pm25.toFixed(2)}(PM2.5) As of ${new Date(info.updated_at).toDateString()}
                    `,
          image_url: `http://binaryoptionexpert.com/wp-content/uploads/2015/01/not_available.jpg`,
          buttons: [{
            type: "postback",
            title: `GO BACK TO ${info.station.region} LIST STATION`,
            payload: 'test'
          }, {
            type: "postback",
            title: "SELECT OTHER REGION",
            payload: "Select Other Region"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }],
        }]
      }
    }
  },
  [
    {
      pattern: 'Select Other Region',
      callback: (response, convo) => {
        askRegion(response, convo);
        convo.next();
      }
    },
    {
      default: true,
      callback: (response, convo) => {
        convo.say('Please Select One');
        mainMenu(response, convo);
        convo.next();
      }
    }
  ]);
}

const groupBy = (data, key) => {
  return JSON.parse(data).reduce(function(collectedData, eachData) {
    (collectedData[eachData.station[key]] = collectedData[eachData.station[key]] || []).push(eachData);
    return collectedData;
  }, {});
};

// Gets a list of Webhooks
export function index(req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
}

export function create(req, res) {
  BOT_CONTROLLER.handleWebhookPayload(req, res, bot);
  res.send('ok');
}
