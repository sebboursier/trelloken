#!/usr/bin/env node

console.log("----- TrelLoken -----");

const commander = require('commander')
const inquirer = require('inquirer')
const open = require('open')
const fs = require('fs')
const node_trello = require('node-trello')

const apiKey = '1d7adb1591ed5a5738c39e6fa1118378'

commander.version('1.0.0')
  .option('-g, --getToken', 'Get the token user by your default browser')
  .option('-s, --setToken [token]', 'Set the user token')
  .option('-o, --offline', 'To post data offline')
  .option('-s, --syncro', 'To syncro datas set offline on Trello')
  .option('-l, --list', 'Action of listing')
  .option('-b, --board [board]', 'Action on a board')
  .on('--help', function(){
    console.log('  Examples:')
    console.log('')
    console.log('    $ trelloken -lb')
    console.log('        This will list all your boards')
    console.log('')
  })

commander.parse(process.argv)

if(commander.getToken) {
  console.log("-- Command : Get Token")
  console.log('Continue to be redirected in your default browser in order to get your Token secret for Trello.')
  console.log('Please follow the instructions of the opened url. Then, type the following command to register :')
  console.log('"trelloken -s TOKEN", where TOKEN is the token you have generated in the browser.')
  inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Open the browser?"
    }
  ]).then((answers) => {
    if(answers.confirm) {
      open(`https://trello.com/1/connect?key=${apiKey}&name=trelloken&response_type=token`)
    } else {
      console.log("Okay, but remember you can't use TrelLoken as this isn't done.")
    }
  })
} else if (commander.setToken) {
  console.log("-- Command : Set Token")
  fs.writeFile(`${__dirname}\\token`, commander.setToken, (err) => {
    if (err) throw err
    console.log("Token set.")
  })
} else if (commander.offline) {
    console.log("OFFLINE")
} else {
    fs.readFile(`${__dirname}\\token`, 'utf8', (err, data) => {
      var trello = new node_trello(apiKey, data)
      online(trello)
    })
}

function online(trello) {
  if (commander.board && commander.list) {
    console.log("-- Command : List Boards")
    trello.get("/1/members/me/boards", (err, data) => {
      if (err) throw err
      for (board in data) {
        console.log(data[board].name)
      }
    })
  }
}
