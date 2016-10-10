module.exports.all = offlineListAll

function offlineListAll (sqlite) {
  console.log("-- Command : List all waiting actions.")

  sqlite.all(`SELECT * FROM Action ORDER BY date`).then((result) => {
    console.log(result)
  })
}
