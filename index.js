#!/usr/bin/env node

console.log("----- TrelLoken -----");

const open = require('open')
const fs = require('fs')
const node_trello = require('node-trello')
const sqlite = require('sqlite')

const commander = require('./commander.js').commander
const online = require('./online.js')
const offline = require('./offline.js')

const apiKey = '1d7adb1591ed5a5738c39e6fa1118378'

if(commander.getToken) {
  console.log("-- Command : Get Token")
  console.log('Continue to be redirected in your default browser in order to get your Token secret for Trello.')
  console.log('Please follow the instructions of the opened url. Then, type the following command to register :')
  console.log('"trelloken -s TOKEN", where TOKEN is the token you have generated in the browser.')
  inquirer.prompt([{
    type: "confirm",
    name: "confirm",
    message: "Open the browser?"
  }]).then((answers) => {
    if(answers.confirm) {
      open(`https://trello.com/1/connect?key=${apiKey}&name=trelloken&response_type=token&scope=read,write`)
    } else {
      console.log("Okay, but remember you can't use TrelLoken ONLINE mode as this isn't done.")
    }
  })
} else if (commander.setToken) {
  console.log("-- Command : Set Token")
  fs.writeFile(`${__dirname}\\token`, commander.setToken, (err) => {
    if (err) throw err
    console.log("Token set.")
  })
} else if (commander.offline) {
  console.log(`-- OFFLINE Mode`)
  sqlite.open(`${__dirname}\\trelloken.sqlite`).then((result) => {
    return sqlite.run(`CREATE TABLE IF NOT EXISTS Action (board, list, value, date)`)
  }).then((result) => {
    offline.dispatch(sqlite, commander)
  }).catch(err => console.error(err))
} else {
  console.log(`-- ONLINE Mode`)
    fs.readFile(`${__dirname}\\token`, 'utf8', (err, data) => {
      if(typeof data == `undefined`) {
        console.log(`You don't set your token!`)
        console.log(`Please run "trelloken -g"`)
      } else {
        var trello = new node_trello(apiKey, data)
        if(commander.push) {
          push(trello)
        } else {
          online.dispatch(trello, commander)
        }
      }
    })
}
// OPTIONS FUNCTION
function push(trello) {
  console.log(`-- Command : Push offline datas`)
  sqlite.open(`${__dirname}\\trelloken.sqlite`).then((result) => {
    return sqlite.all(`SELECT * FROM Action ORDER BY date`)
  }).then((actions) => {
    for (action in actions) {
      if (actions[action].board == null) {
        console.log(`- Push a board : "${actions[action].value}"`)
        onlineAddBoard(trello,actions[action].value)
      } else if (actions[action].list == null) {
        console.log(`- Push a list : "${actions[action].value}" in board "${actions[action].board}"`)
        onlineAddList(trello,actions[action].board,actions[action].value)
      } else {
        console.log(`- Push a card : "${actions[action].value}" in list "${actions[action].list}" inboard "${actions[action].board}"`)
        onlineAddCard(trello,actions[action].board,actions[action].list,actions[action].value)
      }
    }
  }).catch(err => console.error(err))
}