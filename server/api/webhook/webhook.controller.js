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
BOT_CONTROLLER.hears(['Get Started'], 'facebook_postback', function (bot, message) {
  request(`https://graph.facebook.com/v2.6/${message.user}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${process.env.ACCESS_TOKEN}`,
    function(err, resp, user) {
      let userObj = JSON.parse(user);
      console.log(user);
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
  }, [
    {
      pattern: 'About Clean Air Act',
      callback: (response, convo) => {
        clearAirAct(response, convo)
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
        usefulInfo(response, convo);
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

const clearAirAct = (response, convo) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: 'Philippine Clean Air Act',
          subtitle: 'About clean air act',
          image_url: 'https://s3-ap-southeast-1.amazonaws.com/denr-swm/AQI.png',
          buttons: [{
            type:"web_url",
            url: "http://air.emb.gov.ph/?page_id=39",
            title: "READ THIS LAW"
          }, {
            type: "postback",
            title: "OTHER COUNTRIES",
            payload: "Other Countries"
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
      pattern: 'Other Countries',
      callback: (response, convo) => {
        otherCountries(response, convo);
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

const otherCountries = (response, convo) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: 'Other Air Quality Related Laws and Guides',
          buttons: [{
            type: "web_url",
            url: "https://www3.epa.gov/airnow/aqi-technical-assistance-document-may2016.pdf",
            title: "US EPA"
          }, {
            type: "web_url",
            url: "http://english.mep.gov.cn/Resources/standards/Air_Environment/",
            title: "CHINA"
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
      default: true,
      callback: (response, convo) => {
        convo.say('Please Select One');
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
      subtitle: `${value.concern_level}, AQI: ${Math.floor(value.highest_pollutant_value)} (${value.highest_pollutant}) As of ${new Date(value.updated_at).toLocaleString()}`,
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
        showDetailedStations(response, convo, value, stations);
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
const showDetailedStations = (response, convo, info, stations) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: info.station.station_name,
          subtitle: `${info.station.address} Status: \"${info.concern_level}\", AQI VALUE: ${info.aqi_pm25.toFixed(2)}(PM2.5) As of ${new Date(info.updated_at).toDateString()}`,
          image_url: info.station.station_pics[0].pic_url || 'http://binaryoptionexpert.com/wp-content/uploads/2015/01/not_available.jpg',
          buttons: [{
            type: "postback",
            title: `GO BACK TO ${info.station.region} LIST`,
            payload: info.station.region
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
      pattern: info.station.region,
      callback: (response, convo) => {
        showStations(response, convo, stations);
        convo.next();
      }
    },
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

const usefulInfo = (response, convo) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: 'Please select useful information',
          buttons: [{
            type: "postback",
            title: "LIST OF AIR POLLUTANTS",
            payload: "List of Air Pollutants"
          }, {
            type: "postback",
            title: "HEALTH LEVEL CONCERN",
            payload: "Health Level Concern"
          }, {
            type: "postback",
            title: "LINK TO OTHER APPS",
            payload: "Link to Other Apps"
          }],
        }]
      }
    }
  }, [
    {
      pattern: 'List of Air Pollutants',
      callback: (response, convo) => {
        pollutantList(response, convo);
        convo.next();
      }
    }, {
      pattern: 'Health Level Concern',
      callback: (response, convo) => {
        healthLevelConcern(response, convo);
        convo.next();
      }
    }, {
      default: true,
      pattern: 'Link to Other Apps',
      callback: (response, convo) => {
        linkToOtherApps(response, convo);
        convo.next();
      }
    }
  ]);
};

const pollutantList = (response, convo) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "PM 2.5",
          subtitle: "Particular Matter 2.5",
          image_url: "https://s3-ap-southeast-1.amazonaws.com/denr-swm/PM2.5.png",
          buttons: [{
            type: "web_url",
            url: "https://airnow.gov/index.cfm?action=aqibasics.particle",
            title: "MORE DETAILS"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }, {
          title: "PM 10",
          subtitle: "Particular Matter 10",
          image_url: "https://s3-ap-southeast-1.amazonaws.com/denr-swm/PM10.png",
          buttons: [{
            type: "web_url",
            url: "http://www.npi.gov.au/resource/particulate-matter-pm10-and-pm25",
            title: "MORE DETAILS"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }, {
          title: "Ozone (03)",
          subtitle: "Ozone",
          image_url: "https://s3-ap-southeast-1.amazonaws.com/denr-swm/ozoneform.gif",
          buttons: [{
            type: "web_url",
            url: "https://www.airnow.gov/index.cfm?action=aqibasics.ozone",
            title: "MORE DETAILS"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }]
      }
    }
  },
  [
    {
      pattern: 'Go Useful Information',
      callback: (response, convo) => {
        usefulInfo(response, convo);
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

const healthLevelConcern = (response, convo) => {
  convo.say({
    attachment:{
      type: "image",
      payload:{
        url: "https://s3-ap-southeast-1.amazonaws.com/denr-swm/AQI.png"
      }
    }
  });

  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Please Select One",
          buttons: [{
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }]
      }
    }
  }, [
    {
      pattern: 'Go Useful Information',
      callback: (response, convo) => {
        usefulInfo(response, convo);
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

const linkToOtherApps = (response, convo) => {
  convo.ask({
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Download on App Store",
          subtitle: "Mobile App(iOS)",
          image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLV0tTEMD8t_kdAwSdk4zSpPKNm5GuWe3Hc9HUI4nMCLmS2Gy-gg",
          buttons: [{
            type: "web_url",
            url: "https://itunes.apple.com/ph/app/philippines-air-quality-index/id1228202074?mt=8",
            title: "DOWNLOAD THE APP"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }, {
          title: "Download on Play Store",
          subtitle: "Mobile App (Android)",
          image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIROOBGYhvDXTw0MgkVR7vEtqCL9ohlkTqcCSgCjUDOWgtEv_LQ",
          buttons: [{
            type: "web_url",
            url: "https://play.google.com/store/apps/details?id=denr.com.aqm&hl=en",
            title: "DOWNLOAD THE APP"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }, {
          title: "Web Application",
          subtitle: "Mobile Web",
          image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKaysm1mS_uhADkoT8vBZgH5OI3AAT-sfGMlWxD6Y01_X4CS-5Uw",
          buttons: [{
            type: "web_url",
            url: " http://denr-dashboard.herokuapp.com",
            title: "GO TO MOBILE WEB"
          }, {
            type: "postback",
            title: "GO USEFUL INFORMATION",
            payload: "Go Useful Information"
          }, {
            type: "postback",
            title: "GO TO MAIN MENU",
            payload: "Go To Main Menu"
          }]
        }]
      }
    }
  }, [
    {
      pattern: 'Go Useful Information',
      callback: (response, convo) => {
        usefulInfo(response, convo);
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
