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
  .option('-p, --push', 'To syncro datas set offline on Trello')
  .option('-L, --listing', 'Action of listing')
  .option('-A, --adding', 'Action of adding')
  .option('-b, --board [board]', 'Action on a board')
  .option('-l, --list [column]', 'Action on a list')
  .option('-c, --card', 'Action on a card')
  .on('--help', function(){
    console.log('  Examples:')
    console.log('')
    console.log('    $ trelloken -Lb')
    console.log('        This will list all your boards')
    console.log('')
    console.log('    $ trelloken -b BOARD_NAME -Ll')
    console.log('        This will list all your lists of your existing board BOARD_NAME')
    console.log('')
    console.log('    $ trelloken -b BOARD_NAME -l LIST_NAME -Lc')
    console.log('        This will list all your card of your existing list LIST_NAME of your existing board BOARD_NAME')
    console.log('')
    console.log('  Notes:')
    console.log('')
    console.log('    If your parameter contain space, write it between quote : "some board"')
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
      open(`https://trello.com/1/connect?key=${apiKey}&name=trelloken&response_type=token&scope=read,write`)
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
      if(typeof data == 'undefined') {
        console.log("You don't set your token!")
        console.log('Please run "trelloken -g"')
      } else {
        var trello = new node_trello(apiKey, data)
        online(trello)
      }
    })
}

// OPTIONS FUNCTION

function online (trello) {
  if (commander.listing && commander.adding) {
    console.log(`You can't use both "-L" and "-A" options`);
  } else if (commander.listing) {
    onlineListing(trello)
  } else if (commander.adding) {
    onlineAdding(trello)
  }
}

function onlineAdding (trello) {

  if (commander.board && commander.list) {
    console.log("-- Command : Add a list")
    // TODO
  } else if (commander.board) {

    console.log("-- Command : Add a board")

    if(typeof commander.board == 'boolean') {
      inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Board Name?"
        }
      ]).then((answers) => {
        onlineAddBoard(trello,answers.name)
      })
    } else {
      onlineAddBoard(trello,commander.board)
    }

    function onlineAddBoard (trello, boardName) {
      trello.post("/1/boards", { name: boardName} , (err,newBoard) => {
        if (err) throw err
        console.log(`Success! Your board has been created.`)
        console.log(`Name : ${newBoard.name}`)
        console.log(`Id : ${newBoard.id}`)
        console.log(`Access Url : ${newBoard.url}`)
      })
    }

  }
}

function onlineListing (trello) {
  if (commander.board && commander.list && commander.card) {

    console.log("-- Command : List Columns of a board")

    trello.get("/1/members/me/boards", (err, boards) => {
      if (err) throw err
      let boardFind = false
      for (board in boards) {
        if (boards[board].name == commander.board) {
          let boardId = boards[board].id
          boardFind = true;
          trello.get(`/1/boards/${boardId}/lists`, (err, lists) => {
            if (err) throw err
            let listFind = false;
            for (list in lists) {
              if (lists[list].name == commander.list) {
                listFind = true;
                trello.get(`/1/lists/${lists[list].id}/cards`, (err, cards) => {
                  if (err) throw err
                  for (card in cards) {
                    console.log(cards[card].name)
                  }
                })
                break
              }
            }
            if(!listFind) {
              console.log(`There are no list named as "${commander.list}" in the board "${commander.board}"`)
              console.log(`Please check "trelloken -b ${commander.board} -Ll" for the available lists`)
            }
          })
          break
        }
      }
      if(!boardFind) {
        console.log(`There are no board named as "${commander.board}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })

  } else if (commander.board && commander.list) {

    console.log("-- Command : List Columns of a board")

    trello.get("/1/members/me/boards", (err, data) => {
      if (err) throw err
      let find = false;
      for (board in data) {
        if (data[board].name == commander.board) {
          trello.get(`/1/boards/${data[board].id}/lists`, (err, data) => {
            if (err) throw err
            for (list in data) {
              console.log(data[list].name)
            }
          })
          find = true;
          break
        }
      }
      if(!find) {
        console.log(`There are no board named as "${commander.board}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })

  } else if (commander.board) {

    console.log("-- Command : List Boards")

    trello.get("/1/members/me/boards", (err, data) => {
      if (err) throw err
      for (board in data) {
        console.log(data[board].name)
      }
    })
  }
}
