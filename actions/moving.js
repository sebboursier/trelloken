const inquirer = require('inquirer')

module.exports.card = onlineMovingCard

function onlineMovingCard (trello, boardName, listName, cardName, toListName) {
  console.log("-- Command : Move a card to another list.")

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
      name: "toListName",
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
        console.log(`There are no board named as "${boardName}"`)
        console.log(`Please check "trelloken -Lb" for the available boards`)
      }
    })
  }
}
