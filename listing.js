const inquirer = require('inquirer')

module.exports.onlineListBoard = onlineListBoard
module.exports.onlineListList = onlineListList
module.exports.onlineListCard = onlineListCard

function onlineListBoard (trello) {
  trello.get("/1/members/me/boards", (err, data) => {
    if (err) throw err
    for (board in data) {
      console.log(data[board].name)
    }
  })
}

function onlineListList (trello, boardName) {
  if (!boardName) {
    inquirer.prompt([{
      type: "input",
      name: "boardName",
      message: "Link-board Name?"
    }]).then((answers) => {
      onlineListList(trello,answers.boardName)
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