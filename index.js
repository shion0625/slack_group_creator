'use strict';

require('dotenv').config();

const http = require('http');
const {RTMClient, WebClient} = require("@slack/client");
const rtm = new RTMClient(process.env.USERTOKEN);
const webClient = new WebClient(process.env.TOKEN);
const webClient2 = new WebClient(process.env.USERTOKEN);

rtm.on('message', (event) => {
  if (!('text' in event)){
    return;
  }
  const msg = event.text;
  if (msg.match(/^!create_group/g)) {
    const args = msg.split(/\s/g);
    if (validate(args[1])){
      create(event, args[1]);
    } else {
      sendMessage(event.channel, event.ts, "Cannot use other special symbol than - and _ ");
    }
  }
})

const validate = (msg) => {
  return !msg.match(/[^a-z0-9_-]/gi)
}

const create = (event, msg)  => {
    webClient.groups.create({
      name: msg
    })
    .then(res => {
      webClient.groups.invite({
        user:event.user,
        channel: res.id
      })
      .catch(err => console.log(err));
    })
    .catch(err => {
      sendMessage(event.channel, event.ts, err.data.error);
    })
}

const sendMessage = (ch, ts, text) => {
  webClient2.chat.postMessage({
    channel: ch,
    username: 'testing bot',
    icon_emoji: ':smile:',
    thread_ts: ts,
    text
  }).catch(err => console.log(err))
}

rtm.start();

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('testign');
  res.end();
}).listen(3000, '0.0.0.0', ()=>  console.log("this listening in port 3000"))