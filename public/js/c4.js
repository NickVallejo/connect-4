const c4Board = document.querySelector('.c4-board')
let c4Concat
let currentPlayer

function newGame() {
    const allCircs = document.querySelectorAll('[class^="circ-"]')

    allCircs.forEach(circ => {
        circ.style.backgroundColor = ''
    })

    c4 = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ]

    currentPlayer = 'R'
}

const winningArrays = [
    [0, 1, 2, 3],
    [41, 40, 39, 38],
    [7, 8, 9, 10],
    [34, 33, 32, 31],
    [14, 15, 16, 17],
    [27, 26, 25, 24],
    [21, 22, 23, 24],
    [20, 19, 18, 17],
    [28, 29, 30, 31],
    [13, 12, 11, 10],
    [35, 36, 37, 38],
    [6, 5, 4, 3],
    [0, 7, 14, 21],
    [41, 34, 27, 20],
    [1, 8, 15, 22],
    [40, 33, 26, 19],
    [2, 9, 16, 23],
    [39, 32, 25, 18],
    [3, 10, 17, 24],
    [38, 31, 24, 17],
    [4, 11, 18, 25],
    [37, 30, 23, 16],
    [5, 12, 19, 26],
    [36, 29, 22, 15],
    [6, 13, 20, 27],
    [35, 28, 21, 14],
    [0, 8, 16, 24],
    [41, 33, 25, 17],
    [7, 15, 23, 31],
    [34, 26, 18, 10],
    [14, 22, 30, 38],
    [27, 19, 11, 3],
    [35, 29, 23, 17],
    [6, 12, 18, 24],
    [28, 22, 16, 10],
    [13, 19, 25, 31],
    [21, 15, 9, 3],
    [20, 26, 32, 38],
    [36, 30, 24, 18],
    [5, 11, 17, 23],
    [37, 31, 25, 19],
    [4, 10, 16, 22],
    [2, 10, 18, 26],
    [39, 31, 23, 15],
    [1, 9, 17, 25],
    [40, 32, 24, 16],
    [9, 17, 25, 33],
    [8, 16, 24, 32],
    [11, 17, 23, 29],
    [12, 18, 24, 30],
    [1, 2, 3, 4],
    [5, 4, 3, 2],
    [8, 9, 10, 11],
    [12, 11, 10, 9],
    [15, 16, 17, 18],
    [19, 18, 17, 16],
    [22, 23, 24, 25],
    [26, 25, 24, 23],
    [29, 30, 31, 32],
    [33, 32, 31, 30],
    [36, 37, 38, 39],
    [40, 39, 38, 37],
    [7, 14, 21, 28],
    [8, 15, 22, 29],
    [9, 16, 23, 30],
    [10, 17, 24, 31],
    [11, 18, 25, 32],
    [12, 19, 26, 33],
    [13, 20, 27, 34],
]


c4Board.addEventListener('click', (e) => {
    e.stopPropagation();
    const row = e.target.parentNode.className.substr(4)
    const col = e.target.className.substr(5)
    let foundOne = false

    if (row == 0) {
        console.log(`row ${row} and column ${col}`)

        for (i = 0; i < c4.length; i++) {
            console.log(`i: ${i}`)
            if (c4[i][col] == 'R' || c4[i][col] == 'B') {
                fillCirc(i - 1, col)
                foundOne = true
                break
            }
        }

        if (!foundOne) {
            fillCirc(5, col)
        }

        checkWin(currentPlayer);
    }
})

function fillCirc(row, col) {
    if (row < 0) {
        alert('nope')
        return
    }

    let color = currentPlayer == 'R' ? 'red' : 'blue'

    c4[row][col] = currentPlayer
    const coloredCirc = document.querySelector(`.row-${row} .circ-${col}`)
    coloredCirc.style.backgroundColor = color
    checkWin(currentPlayer, color);
    endTurn(currentPlayer)
    console.log('C4', c4)
}

function endTurn() {
    currentPlayer = currentPlayer == 'R' ? 'B' : 'R'
}

function checkWin(player, color) {
    let c4Concat = c4[0].concat(c4[1], c4[2], c4[3], c4[4], c4[5])
    console.log('CONTAT ARRAY', c4Concat)

    winningArrays.forEach(array => {

        if (c4Concat[array[0]] == player &&
            c4Concat[array[1]] == player &&
            c4Concat[array[2]] == player &&
            c4Concat[array[3]] == player) {
            setTimeout(() => {
                alert(`${color} Player Wins!`)
                console.log('color ' + color)
                if (color == 'red') {
                    playerWin()
                }
                newGame()
                return
            }, 200)
        }
    })

    const tie = c4Concat.every(el => el == 'R' || el == 'B')

    if (tie) {
        alert(`It's a tie. You both suck.`)
        newGame()
    }

    return
}

newGame();