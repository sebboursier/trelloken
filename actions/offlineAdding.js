const inquirer = require('inquirer')

module.exports.board = offlineAddBoard
module.exports.list = offlineAddList
module.exports.card = offlineAddCard

function offlineAddBoard (sqlite, boardName) {
  console.log("-- Command : Add a board.")

  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "New board name?"
    }]).then((answers) => {
      offlineAddBoard(sqlite, answers.boardName)
    })
  } else {
    return sqlite.run(`INSERT INTO Action (value, date) VALUES (?, ?)`, boardName, (new Date()).getTime()).then((result) => {
      console.log(`Success! Your board has been created in OFFLINE Mode.`)
      console.log(`Name : ${boardName}`)
    })
  }
}

function offlineAddList (sqlite, boardName, listName) {
  console.log("-- Command : Add a list.")

  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board name?"
    }]).then((answers) => {
      offlineAddList(sqlite, answers.boardName, listName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "New list name?"
    }]).then((answers) => {
      offlineAddList(sqlite, boardName, answers.listName)
    })
  } else {
    return sqlite.run(`INSERT INTO Action (board, value, date) VALUES (?, ?, ?)`, boardName, listName, (new Date()).getTime()).then((result) => {
      console.log(`Success! Your list has been created in OFFLINE Mode.`)
      console.log(`Name : ${listName}`)
      console.log(`Linked board : ${boardName}`)
    })
  }
}

function offlineAddCard (sqlite, boardName, listName, cardName) {
  console.log("-- Command : Add a card.")

  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board name?"
    }]).then((answers) => {
      offlineAddCard(sqlite, answers.boardName, listName, cardName)
    })
  } else if (!listName) {
    inquirer.prompt([{
      type: "input",
      name: "listName",
      message: "Link-list name?"
    }]).then((answers) => {
      offlineAddCard(sqlite, boardName, answers.listName, cardName)
    })
  } else if (!cardName) {
    inquirer.prompt([{
      type: "input",
      name: "cardName",
      message: "New card name?"
    }]).then((answers) => {
      offlineAddCard(sqlite, boardName, listName, answers.cardName)
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
