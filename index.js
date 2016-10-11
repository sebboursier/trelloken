#!/usr/bin/env node

console.log("----- TrelLoken -----");

// Initialisation des modules externes
const inquirer = require('inquirer')
const open = require('open')
const fs = require('fs')
const node_trello = require('node-trello')
const sqlite = require('sqlite')

// Initialisation des modules internes
const commander = require('./commander.js')
const offAdd = require('./actions/offlineAdding.js')
const onAdd = require('./actions/adding.js')
const offList = require('./actions/offlinelisting.js')
const onList = require('./actions/listing.js')
const onMove = require('./actions/moving.js')
const syncro = require('./actions/syncro.js')

// La clé API Trello de l'application (me la volez pas svp, mais je suis bien obligé de la mettre là)
const apiKey = '1d7adb1591ed5a5738c39e6fa1118378'

// On commence à dispatcher les routes des options

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

} else { // On passe au traitement des actions principal

  var boardName, listName, cardName, toListName

  // Cela va permettre de poser des question lorsque il manque des informations
  // Par exemple "trelloken -cA card1" => on doit ajouter une carte "card1", mais il manque des infos,
  // Elles seront donc demandé
  if(typeof commander.board == `boolean`) {
    boardName = false
  } else {
    boardName = commander.board
  }
  if(typeof commander.list == `boolean`) {
    listName = false
  } else {
    listName = commander.list
  }
  if(typeof commander.card == `boolean`) {
    cardName = false
  } else {
    cardName = commander.card
  }
  if(typeof commander.to == `boolean`) {
    toListName = false
  } else {
    toListName = commander.to
  }

  if(commander.offline) {
    console.log(`-- OFFLINE Mode`)

    sqlite.open(`${__dirname}\\trelloken.sqlite`).then((result) => {
      return sqlite.run(`CREATE TABLE IF NOT EXISTS Action (board, list, value, date)`)
    }).then((result) => {

      if(commander.listing) {
        offList.all(sqlite)
      } else if(commander.adding) {
        if (commander.card) {
          offAdd.card(sqlite, boardName, listName, cardName)
        } else if (commander.list) {
          offAdd.list(sqlite, boardName, listName)
        } else if (commander.board) {
          offAdd.board(sqlite, boardName)
        } else {
          console.log(`You have selected a invalid option for offline mode.`)
        }
      } else {
        console.log(`You have selected a invalid option for offline mode.`)
      }

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
          syncro.push(trello, commander, sqlite)
        } else if (commander.listing) {
          if (commander.card) {
            onList.card(trello, boardName, listName, cardName)
          } else if (commander.list) {
            onList.list(trello, boardName, listName)
          } else if (commander.board) {
            onList.board(trello, boardName)
          }
        } else if (commander.adding) {
          if (commander.card) {
            onAdd.card(trello, boardName, listName, cardName)
          } else if (commander.list) {
            onAdd.list(trello, boardName, listName)
          } else if (commander.board) {
            onAdd.board(trello, boardName)
          }
        } else if (commander.moving) {
          onMove.card(trello, boardName, listName, cardName, toListName)
        }

      }
    })

  }
}
