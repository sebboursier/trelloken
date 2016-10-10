const inquirer = require('inquirer')

module.exports.dispatch = dispatch

var commander = {}
var trello = {}

function dispatch (t,c) {
  commander = c
  trello = t
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
    onlineListList(trello, boardName)
  } else if (commander.board) {
    console.log("-- Command : List Boards")
    onlineListBoard(trello)
  }
}