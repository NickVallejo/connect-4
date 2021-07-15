const pickUserField = document.querySelector('.log-wrap input[type="text"]')
const pickUserSubmit = document.querySelector('.log-wrap .pickUserBtn')
const xp = document.getElementById('player-points').getContext('2d')
const jsPoints = document.querySelector('.js-points')
const userHeader = document.querySelector('.user-header')
const pointHeader = document.querySelector('.points-header')

if(pickUserSubmit){
    pickUserSubmit.addEventListener('click', submitUser)
}

function submitUser(){
    if(!pickUserField.value){return}

    console.log('INPUT: ', pickUserField.value)
    const post = new XMLHttpRequest();
    post.open('POST', '/api/username', true)
    post.setRequestHeader("Content-Type", "application/json")
    post.onload = () => {
        const res = JSON.parse(post.responseText)
        console.log(res)
        if(res){
            switch(res.type){
                case 'err':
                    notice()
                    break;
                case 'succ':
                    newUserInit(res.user)
                    break;
            }
        }
    }
    post.send(JSON.stringify({username: pickUserField.value}))
}

function notice(){
    return
}

function newUserInit(user){
    console.log('ping')
    const noAuth = document.querySelector('.noauth-wrap')
    const auth = document.querySelector('.auth-wrap')

    pointHeader.insertAdjacentText('beforeend', user.points + ' Points')
    userHeader.insertAdjacentText('afterbegin', user.username + ':')
    jsPoints.insertAdjacentText('beforeend', user.points)
    xpInit()

    noAuth.style.display = 'none'
    auth.style.display = 'block'
}

function xpInit(){
    console.log('XPINIT FIRED')
    const points = jsPoints.innerText

    var gradient = xp.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#9c528b');   
    gradient.addColorStop(1, 'blue');

    const config = {
        datasets: [{
            label: 'Points',
            data: [points, 100 - points],
            backgroundColor: [gradient, '#242422'],
            borderWidth: 0,
        }]
    }

    const myXp = new Chart(xp, {
        type: 'doughnut',
        data: config,
        options: {
            cutout: '99%'
        }
    })
}

function userExec(){
    jsPoints.innerText ? xpInit() : ''
}

function playerWin(){
    const post = new XMLHttpRequest()
    post.open('POST', '/api/win', true)
    post.setRequestHeader("Content-Type", "application/json")
    post.onload = () => {
        if(post.status == 200){
            const res = JSON.parse(post.responseText)
            jsPoints.innerText = res.points
            pointHeader.innerText = res.points + ' Points'
        }
        
    }
    post.send(JSON.stringify({pointsWon: 50}))

}

userExec();

// xpInit(500)