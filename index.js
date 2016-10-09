#!/usr/bin/env node

console.log("----- TrelLoken -----");

const commander = require('commander')
const inquirer = require('inquirer')
const open = require('open')
const fs = require('fs')
const node_trello = require('node-trello')
const sqlite = require('sqlite')

const apiKey = '1d7adb1591ed5a5738c39e6fa1118378'

commander.version('1.0.0')
  .option('-G, --getToken', 'Get the token user by your default browser')
  .option('-S, --setToken [TOKEN]', 'Set the user token')
  .option('-o, --offline', 'To post data offline')
  .option('-P, --push', 'To syncro datas set offline on Trello')
  .option('-L, --listing', 'Action of listing')
  .option('-A, --adding', 'Action of adding')
  .option('-M, --moving', 'Action of moving (for a card ONLY)')
  .option('-t, --to [DESTINATION_LIST_NAME]', 'a destination list (for moving)')
  .option('-b, --board [BOARD_NAME]', 'Action on a board')
  .option('-l, --list [LIST_NAME]', 'Action on a list')
  .option('-c, --card [CARD_NAME]', 'Action on a card')
  .on('--help', function(){
    console.log('  Examples:')
    console.log('')
    console.log('   # Listing Online')
    console.log('')
    console.log('    $ trelloken -Lb')
    console.log('        This will list all your boards')
    console.log('')
    console.log('    $ trelloken -b [BOARD_NAME] -Ll')
    console.log('        This will list all your lists of an existing board.')
    console.log('')
    console.log('    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Lc')
    console.log('        This will list all your card of your existing list of your existing board.')
    console.log('')
    console.log('   # Adding Online')
    console.log('')
    console.log('    $ trelloken -Ab [BOARD_NAME]')
    console.log('        This will add a board.')
    console.log('')
    console.log('    $ trelloken -b [BOARD_NAME] -Al [LIST_NAME]')
    console.log('        This will add a list in a board.')
    console.log('')
    console.log('    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Ac [CARD_NAME]')
    console.log('        This will add a card in a list in a board.')
    console.log('')
    console.log('   # Moving Online')
    console.log('')
    console.log('    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Mc [CARD_NAME] -t [DESTINATION_LIST_NAME]')
    console.log('        This will add a card in a list in a board.')
    console.log('')
    console.log('  Notes:')
    console.log('')
    console.log('    If your parameter contain space, write it between quote : "some board"')
    console.log('')
    console.log('    You can specify [parameters] in the command, otherwise there will be asked')
    console.log('')
  })
commander.parse(process.argv)
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
    offline()
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
          online(trello)
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
function offline () {
  if (commander.adding && commander.board && commander.list && commander.card) {
    console.log("-- Command : Add a card")
    let boardName, listName, cardName
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
    return offlineAddCard(boardName, listName, cardName)
  } else if (commander.adding && commander.board && commander.list) {
    console.log("-- Command : Add a list")
    let boardName, listName
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
    return offlineAddList(boardName, listName)
  } else if (commander.adding && commander.board) {
    console.log("-- Command : Add a board")
    let boardName
    if(typeof commander.board == `boolean`) {
      boardName = false
    } else {
      boardName = commander.board
    }
    return offlineAddBoard(boardName)
  } else if (commander.listing) {
    return sqlite.all(`SELECT * FROM Action ORDER BY date`).then((result) => {
      console.log("Waiting :",result)
    })
  }
}
function offlineAddBoard (boardName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "New board name?"
    }]).then((answers) => {
      offlineAddBoard(answers.boardName)
    })
  } else {
    return sqlite.run(`INSERT INTO Action (value, date) VALUES (?, ?)`, boardName, (new Date()).getTime()).then((result) => {
      console.log(`Success! Your board has been created in OFFLINE Mode.`)
      console.log(`Name : ${boardName}`)
    })
  }
}
function offlineAddList (boardName, listName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board name?"
    }]).then((answers) => {
      offlineAddList(answers.boardName, listName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "New list name?"
    }]).then((answers) => {
      offlineAddList(boardName, answers.listName)
    })
  } else {
    return sqlite.run(`INSERT INTO Action (board, value, date) VALUES (?, ?, ?)`, boardName, listName, (new Date()).getTime()).then((result) => {
      console.log(`Success! Your list has been created in OFFLINE Mode.`)
      console.log(`Name : ${listName}`)
      console.log(`Linked board : ${boardName}`)
    })
  }
}
function offlineAddCard (boardName, listName, cardName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board name?"
    }]).then((answers) => {
      offlineAddCard(answers.boardName, listName, cardName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "Link-list name?"
    }]).then((answers) => {
      offlineAddCard(boardName, answers.listName, cardName)
    })
  } else if (!cardName) {
    inquirer.prompt([{
      type: "input",
      name: "cardName",
      message: "New card name?"
    }]).then((answers) => {
      offlineAddCard(boardName, listName, answers.cardName)
    })
  } else {
    return sqlite.run(`INSERT INTO Action (board, list, value, date) VALUES (?, ?, ?, ?)`, boardName, listName, cardName, (new Date()).getTime()).then((result) => {
      console.log(`Success! Your card has been created in OFFLINE Mode.`)
      console.log(`Name : ${cardName}`)
      console.log(`Linked List : ${listName}`)
      console.log(`Linked board : ${boardName}`)
    })
  }
}
function online (trello) {
  if (commander.listing && commander.adding) {
    console.log(`You can't use both "-L" and "-A" options`);
  } else if (commander.listing) {
    onlineListing(trello)
  } else if (commander.adding) {
    onlineAdding(trello)
  } else if (commander.moving) {
    onlineMoving(trello)
  }
}
function onlineMoving (trello) {
  console.log("-- Command : Move a card")
  let boardName, listName, cardName, toListName
  if(typeof commander.board == 'boolean') {
    boardName = false
  } else {
    boardName = commander.board
  }
  if(typeof commander.list == 'boolean') {
    listName = false
  } else {
    listName = commander.list
  }
  if(typeof commander.card == 'boolean') {
    cardName = false
  } else {
    cardName = commander.card
  }
  if(typeof commander.to == 'boolean') {
    toListName = false
  } else {
    toListName = commander.to
  }
  onlineMovingCard(trello, boardName, listName, cardName, toListName)
}
function onlineMovingCard (trello, boardName, listName, cardName, toListName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineMovingCard(trello,answers.boardName, listName, cardName, toListName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "Link-list Name?"
    }]).then((answers) => {
      onlineMovingCard(trello, boardName, answers.listName, cardName, toListName)
    })
  } else if (!cardName) {
    inquirer.prompt([{
      type: "input",
      name: "cardName",
      message: "Card Name?"
    }]).then((answers) => {
      onlineMovingCard(trello, boardName, listName, answers.cardName, toListName)
    })
  } else if (!toListName) {
    inquirer.prompt([{
      type: "input",
      name: "cardName",
      message: "List which the card must go?"
    }]).then((answers) => {
      onlineMovingCard(trello, boardName, listName, cardName, answers.toListName)
    })
  } else {
    trello.get("/1/members/me/boards", (err, boards) => {
      if (err) throw err
      let boardFind = false
      for (board in boards) {
        if (boards[board].name == boardName) {
          boardFind = true
          trello.get(`/1/boards/${boards[board].id}/lists`, (err, lists) => {
            if (err) throw err
            let fromListFindId = false, toListFindId = false
            for (list in lists) {
              if (lists[list].name == listName) {
                fromListFindId = lists[list].id
              } else if (lists[list].name == toListName) {
                toListFindId = lists[list].id
              }
            }
            if (!fromListFindId) {
              console.log(`There are no list named as "${listName}" in the board "${boardName}"`)
              console.log(`Please check "trelloken -b ${boardName} -Ll" for the available lists`)
            } else if (!toListName) {
              console.log(`There are no list named as "${toListName}" in the board "${boardName}"`)
              console.log(`Please check "trelloken -b ${boardName} -Ll" for the available lists`)
            } else {
              trello.get(`/1/lists/${fromListFindId}/cards`, (err, cards) => {
                if (err) throw err
                let CardFind = false
                for (card in cards) {
                  if (cards[card].name === cardName) {
                    CardFind = true
                    trello.put(`/1/cards/${cards[card].id}/idList`, { value: toListFindId }, (err, cardMoved) => {
                      if (err) throw err
                      console.log(`Success! Your card has been moved.`)
                      console.log(`Name : ${cardMoved.name}`)
                      console.log(`Previous list : ${listName}`)
                      console.log(`Actual list : ${toListName}`)
                      console.log(`Access Card Url : ${cardMoved.url}`)
                    })
                    break
                  }
                }
                if(!CardFind) {
                  console.log(`There are no card named as "${cardName}" in the list "${listName}" of the board "${boardName}"`)
                  console.log(`Please check "trelloken -b ${boardName} -l ${listName} -Lc" for the available cards`)
                }
              })
            }
          })
          break
        }
      }
      if (!boardFind) {
        console.log(`There are no board named as "${commander.board}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
function onlineAdding (trello) {
  if (commander.board && commander.list && commander.card) {
    console.log("-- Command : Add a card")
    let boardName, listName, cardName
    if(typeof commander.board == 'boolean') {
      boardName = false
    } else {
      boardName = commander.board
    }
    if(typeof commander.list == 'boolean') {
      listName = false
    } else {
      listName = commander.list
    }
    if(typeof commander.card == 'boolean') {
      cardName = false
    } else {
      cardName = commander.card
    }
    onlineAddCard(trello, boardName, listName, cardName)
  } else if (commander.board && commander.list) {
    console.log("-- Command : Add a list")
    let boardName, listName
    if(typeof commander.board == 'boolean') {
      boardName = false
    } else {
      boardName = commander.board
    }
    if(typeof commander.list == 'boolean') {
      listName = false
    } else {
      listName = commander.list
    }
    onlineAddList(trello, boardName, listName)
  } else if (commander.board) {
    console.log("-- Command : Add a board")
    let boardName
    if(typeof commander.board == 'boolean') {
      boardName = false
    } else {
      boardName = commander.board
    }
    onlineAddBoard(trello, boardName)
  }
}
function onlineAddBoard (trello, boardName) {
  if(!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "name",
      message: "New board Name?"
    }]).then((answers) => {
      onlineAddBoard(trello,answers.name)
    })
  } else {
    trello.post("/1/boards", { name: boardName} , (err,newBoard) => {
      if (err) throw err
      console.log(`Success! Your board has been created.`)
      console.log(`Name : ${newBoard.name}`)
      console.log(`Id : ${newBoard.id}`)
      console.log(`Access Url : ${newBoard.url}`)
    })
  }
}
function onlineAddList (trello, boardName, listName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineAddList(trello,answers.boardName, listName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "New list Name?"
    }]).then((answers) => {
      onlineAddList(trello, boardName, answers.listName)
    })
  } else {
    trello.get("/1/members/me/boards", (err, data) => {
      if (err) throw err
      let find = false;
      for (board in data) {
        if (data[board].name == boardName) {
          trello.post("/1/lists", { name: listName, idBoard: data[board].id} , (err,newList) => {
            if (err) throw err
            console.log(`Success! Your list has been created.`)
            console.log(`Name : ${newList.name}`)
            console.log(`Id : ${newList.id}`)
            console.log(`Access Board Url : ${data[board].url}`)
          })
          find = true;
          break
        }
      }
      if(!find) {
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
function onlineAddCard (trello, boardName, listName, cardName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineAddCard(trello,answers.boardName, listName, cardName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "Link-list Name?"
    }]).then((answers) => {
      onlineAddCard(trello, boardName, answers.listName, cardName)
    })
  } else if (!cardName) {
    inquirer.prompt([{
      type: "input",
      name: "cardName",
      message: "New card Name?"
    }]).then((answers) => {
      onlineAddCard(trello, boardName, listName, answers.cardName)
    })
  } else {
    trello.get("/1/members/me/boards", (err, boards) => {
      if (err) throw err
      let boardFind = false
      for (board in boards) {
        if (boards[board].name == boardName) {
          boardFind = true;
          trello.get(`/1/boards/${boards[board].id}/lists`, (err, lists) => {
            if (err) throw err
            let listFind = false
            for (list in lists) {
              if (lists[list].name == listName) {
                listFind = true
                trello.post(`/1/cards`, { name: cardName, idList: lists[list].id }, (err, newCard) => {
                  if (err) throw err
                  console.log(`Success! Your card has been created.`)
                  console.log(`Name : ${newCard.name}`)
                  console.log(`Id : ${newCard.id}`)
                  console.log(`Access Card Url : ${newCard.url}`)
                })
                break
              }
            }
            if(!listFind) {
              console.log(`There are no list named as "${listName}" in the board "${boardName}"`)
              console.log(`Please check "trelloken -b ${boardName} -Ll" for the available lists`)
            }
          })
          break
        }
      }
      if(!boardFind) {
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
function onlineListing (trello) {
  if (commander.board && commander.list && commander.card) {
    console.log("-- Command : List Cards of a list of a board")
    let boardName, listName
    if(typeof commander.board == 'boolean') {
      boardName = false
    } else {
      boardName = commander.board
    }
    if(typeof commander.list == 'boolean') {
      listName = false
    } else {
      listName = commander.list
    }
    onlineListCard(trello, boardName, listName)
  } else if (commander.board && commander.list) {
    console.log("-- Command : List Columns of a board")
    let boardName
    if(typeof commander.board == 'boolean') {
      boardName = false
    } else {
      boardName = commander.board
    }
    onlineListCard(trello, boardName)
  } else if (commander.board) {
    console.log("-- Command : List Boards")
    onlineListBoard(trello)
  }
}
function onlineListBoard (trello) {
  trello.get("/1/members/me/boards", (err, data) => {
    if (err) throw err
    for (board in data) {
      console.log(data[board].name)
    }
  })
}
function onlineListCard (trello, boardName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineListCard(trello,answers.boardName)
    })
  } else {
    trello.get("/1/members/me/boards", (err, data) => {
      if (err) throw err
      let find = false;
      for (board in data) {
        if (data[board].name == boardName) {
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
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
function onlineListCard (trello, boardName, listName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineListCard(trello,answers.boardName, listName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "Link-list Name?"
    }]).then((answers) => {
      onlineListCard(trello, boardName, answers.listName)
    })
  } else {
    trello.get("/1/members/me/boards", (err, boards) => {
      if (err) throw err
      let boardFind = false
      for (board in boards) {
        if (boards[board].name == boardName) {
          boardFind = true;
          trello.get(`/1/boards/${boards[board].id}/lists`, (err, lists) => {
            if (err) throw err
            let listFind = false;
            for (list in lists) {
              if (lists[list].name == listName) {
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
              console.log(`There are no list named as "${listName}" in the board "${boardName}"`)
              console.log(`Please check "trelloken -b ${boardName} -Ll" for the available lists`)
            }
          })
          break
        }
      }
      if(!boardFind) {
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
