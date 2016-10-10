const inquirer = require('inquirer')

module.exports.board = onlineAddBoard
module.exports.list = onlineAddList
module.exports.card = onlineAddCard

function onlineAddBoard (trello, boardName, callback = null) {
  console.log("-- Command : Add a board.")

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
      if(callback != null) callback()
    })
  }
}

function onlineAddList (trello, boardName, listName, callback = null) {
  console.log("-- Command : Add a list.")

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
            if(callback != null) callback()
          })
          find = true;
          break
        }
      }
      if(!find) {
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
        if(callback != null) callback()
      }
    })
  }
}

function onlineAddCard (trello, boardName, listName, cardName, callback = null) {
  console.log("-- Command : Add a card.")
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
                  if(callback != null) callback()
                })
                break
              }
            }
            if(!listFind) {
              console.log(`There are no list named as "${listName}" in the board "${boardName}"`)
              console.log(`Please check "trelloken -b ${boardName} -Ll" for the available lists`)
              if(callback != null) callback()
            }
          })
          break
        }
      }
      if(!boardFind) {
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
        if(callback != null) callback()
      }
    })
  }
}
