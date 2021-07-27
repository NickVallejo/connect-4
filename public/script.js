 
const pickUserField = document.querySelector('.log-wrap input[type="text"]')
const pickUserSubmit = document.querySelector('.log-wrap .pickUserBtn')
const xp = document.getElementById('player-points').getContext('2d')
const jsPoints = document.querySelector('.js-points')
const userHeader = document.querySelector('.user-header')
const pointHeader = document.querySelector('.points-header')
const ctXp = document.querySelector('.ct-xp')
const ctGoal = document.querySelector('.ct-goal')
const invBtn = document.querySelectorAll('.inv-btn')
const invLink = document.querySelector('.inv-link')
let myXp

invBtn.forEach(btn => {
    btn.addEventListener('click', createInvite)
})
const socket = io("http://localhost:3100/")

//event listener for username submission button
if (pickUserSubmit) {
    pickUserSubmit.addEventListener('click', submitUser)
}

function createInvite(){
    console.log('ping!')
    const req = new XMLHttpRequest()
    req.open('GET', '/api/new-room')
    req.onload = () => {
        const res = JSON.parse(req.responseText)
        invLink.innerHTML = `<a href="http://localhost:3200/${res.roomUrl}">http://localhost:3200/${res.roomUrl}</a>`
    }
    req.send()
}

//Submits username to db: returns err if err, fires newUserInit if a succ
function submitUser() {
    if (!pickUserField.value) { return }

    console.log('INPUT: ', pickUserField.value)
    const post = new XMLHttpRequest();
    post.open('POST', '/api/username', true)
    post.setRequestHeader("Content-Type", "application/json")
    post.onload = () => {
        const res = JSON.parse(post.responseText)
        console.log(res)
        if (res) {
            switch (res.type) {
                case 'err':
                    notice()
                    break;
                case 'succ':
                    newUserInit(res.user)
                    break;
            }
        }
    }
    post.send(JSON.stringify({ username: pickUserField.value }))
}



//returns a notice 
function notice() {
    return
}

//Fills in the username and points field in the top right corner
function newUserInit(user) {
    console.log('ping')
    const noAuth = document.querySelector('.noauth-wrap')
    const auth = document.querySelector('.auth-wrap')

    pointHeader.insertAdjacentText('beforeend', user.points + ' Points')
    userHeader.insertAdjacentText('afterbegin', user.username + ':')
    jsPoints.insertAdjacentText('beforeend', user.points)

    noAuth.style.display = 'none'
    auth.style.display = 'block'
}

//modifies the xp chart on a win after the database is updated
function playerWin(winState) {
    const pointsRes = 50
    const post = new XMLHttpRequest()

    console.log(winState)

    post.open('POST', '/api/win', true)
    post.setRequestHeader("Content-Type", "application/json")
    post.onload = () => {
        if (post.status == 200) {
            const res = JSON.parse(post.responseText)
            pointHeader.innerText = res.points + ' Points'
            ctXp.innerText = res.points
            console.log(res.newGoal, pointsRes, res.goal)

            switch(winState){
                case true:
                    myXp.data.datasets[0].data[0] = res.points == 1500 ?
                    1500 : myXp.data.datasets[0].data[0] + pointsRes;     
                    break;
                case false:
                    myXp.data.datasets[0].data[0] = res.points == 0 ? 
                    0 : myXp.data.datasets[0].data[0] - pointsRes       
                    break;  
            }

            if (!res.newGoal) {
                switch(winState){
                    case true:
                        myXp.data.datasets[0].data[1] = myXp.data.datasets[0].data[0] + pointsRes >= 1500 ?
                        0 : myXp.data.datasets[0].data[1] - pointsRes
                        console.log(myXp.data.datasets)
                        break;
                    case false:
                        if(myXp.data.datasets[0].data[0] - pointsRes <= 0){
                            myXp.data.datasets[0].data[1] = res.goal
                            console.log('less than 0, making ' + res.goal)

                        } else{
                            console.log('greater than 0. Adding ' + pointsRes)
                            myXp.data.datasets[0].data[1] += pointsRes
                        }
                    // myXp.data.datasets[0].data[1] = myXp.data.datasets[0].data[0] - pointsRes <= 0 ?
                    // res.goal : myXp.data.datasets[0].data[1] + pointsRes
                    break
                }
            } else {
                myXp.data.datasets[0].data[1] = res.newGoal - res.points
                ctGoal.innerText = res.newGoal
                celly()
            }
            myXp.update()
        }

    }
    post.send(JSON.stringify({ pointsRes, winState }))

}

//initializes the xp chart on load
// if you're a registered user, it loads your points, otherwise it loads 0 points
function pointSetter(points, goal) {

    var gradient = xp.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#9c528b');
    gradient.addColorStop(1, 'blue');

    const config = {
        datasets: [{
            label: 'Points',
            data: [points, goal - points],
            backgroundColor: [gradient, '#242422'],
            borderWidth: 0,
        }]
    }

    myXp = new Chart(xp, {
        type: 'doughnut',
        data: config,
        options: {
            cutout: '99%'
        }
    })

    console.log(myXp.data.datasets)
}

function celly() {
    alert('You have gone up a rank bracket!')
}