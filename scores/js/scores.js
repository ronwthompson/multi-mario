const baseURL = 'http://52.15.42.111:8081/highscores'
let allData

document.addEventListener("DOMContentLoaded", () => {
  axios.get(`${baseURL}/scores`)
    .then(result => getScores(result))
})

function reloadScores(){
    axios.get(`${baseURL}/scores`)
    .then(result => getScores(result))
}

function searchByName(){
    let name = document.getElementById('nameSearch').value
    let htmlToInsert = ''
    let found = false
    for (let i = 0; i < allData.length; i++){
        if (allData[i].name == name){
            found = true
            htmlToInsert += '<tr>'
            htmlToInsert += `<td>${allData[i].name}</td>`
            htmlToInsert += `<td>${allData[i].total_points_earned}</td>`
            htmlToInsert += `<td>${allData[i].highest_points_one_run}</td>`
            htmlToInsert += `<td>${allData[i].coins_collected}</td>`
            htmlToInsert += `<td>${allData[i].levels_completed}</td>`
            htmlToInsert += `<td>${allData[i].times_jumped}</td>`
            htmlToInsert += '</tr>'
        }
    }
    if (found){
        document.getElementsByTagName('tbody')[0].innerHTML = htmlToInsert
    } else {
        alert('Name not found!')
    }
}

function getScores(result){
    let htmlToInsert = ''
    allData = result.data.data
    allData.sort((a,b) => {
        return a.total_points_earned + b.total_points_earned
    })
    for (let i = 0; i < allData.length; i++){
        htmlToInsert += '<tr>'
        htmlToInsert += `<td>${allData[i].name}</td>`
        htmlToInsert += `<td>${allData[i].total_points_earned}</td>`
        htmlToInsert += `<td>${allData[i].highest_points_one_run}</td>`
        htmlToInsert += `<td>${allData[i].coins_collected}</td>`
        htmlToInsert += `<td>${allData[i].levels_completed}</td>`
        htmlToInsert += `<td>${allData[i].times_jumped}</td>`
        htmlToInsert += '</tr>'
    }
    document.getElementsByTagName('tbody')[0].innerHTML = htmlToInsert
}