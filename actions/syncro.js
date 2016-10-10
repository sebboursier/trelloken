const adding = require('./adding.js');

module.exports.push = push

var actions = []
var i = -1
var trello = {}

function push(t, commander, sqlite) {

  console.log(`-- Command : Push offline datas.`)

  trello = t

  sqlite.open(`${__dirname}\\..\\trelloken.sqlite`).then((result) => {
    return sqlite.all(`SELECT * FROM Action ORDER BY date`)
  }).then((result) => {
    actions = result
    boucleTreatment()
  }).catch(err => {
      console.error(err)
  })

}

function boucleTreatment() {
    i++
    if(i < actions.length) {
      if (actions[i].board == null) {
        console.log(`- Push a board : "${actions[i].value}"`)
        adding.board(trello,actions[i].value,boucleTreatment)
      } else if (actions[i].list == null) {
        console.log(`- Push a list : "${actions[i].value}" in board "${actions[i].board}"`)
        adding.list(trello,actions[i].board,actions[i].value,boucleTreatment)
      } else {
        console.log(`- Push a card : "${actions[i].value}" in list "${actions[i].list}" inboard "${actions[i].board}"`)
        adding.card(trello,actions[i].board,actions[i].list,actions[i].value,boucleTreatment)
      }
    }
}
