const inquirer = require('inquirer')

module.exports.dispatch = dispatch

var commander = {}
var sqlite = {}

function dispatch (s,c) {
  commander = c
  sqlite = s
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