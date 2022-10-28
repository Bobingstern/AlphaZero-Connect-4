
let MODEL
let game
let board
let player = 0
let mcts
let load_button
let init_player = 1
let who_first = 1
let selfP = false
let moves_total = 0
let wait_frame = false

function randomChoice(p) {
    let rnd = p.reduce( (a, b) => a + b ) * Math.random();
    return p.findIndex( a => (rnd -= a) < 0 );
}

function randomChoices(p, count) {
    return Array.from(Array(count), randomChoice.bind(null, p));
}

async function loadmodel() {
  MODEL = await tf.loadGraphModel("https://raw.githubusercontent.com/Bobingstern/AlphaZero-Connect-4/main/c4_modelFPU2_tfjs/model.json")
}
loadmodel()
function setup() {
  createCanvas(700, 600)
  document.getElementById("qu").value = 700
  game = new Connect4Game()
  board = game.getInitBoard()
  let numSim = 300
  load_button = createButton("Start Game (You move first)")
  load_button.mousePressed(function() { mcts = new MCTS(game, MODEL, { numMCTSSims: Number(document.getElementById("qu").value), cpuct: 1 }); player = init_player; document.getElementById("ll").innerText = "Started"})
  load_button.position(0,60)

  load_button = createButton("Start Game (AlphaZero move first)")
  load_button.mousePressed(function() {  who_first = -1;mcts = new MCTS(game, MODEL, { numMCTSSims: Number(document.getElementById("qu").value), cpuct: 1 }); player = -init_player; document.getElementById("ll").innerText = "Started"})
  load_button.position(200,60)

  load_button = createButton("Start Game (AlphaZero vs AlphaZero)")
  load_button.mousePressed(function() {  who_first = -1;selfP=true;mcts = new MCTS(game, MODEL, { numMCTSSims: Number(document.getElementById("qu").value), cpuct: 1 }); player = -init_player; document.getElementById("ll").innerText = "Started"})
  load_button.position(450,60)
}


function draw() {
  background(0, 0, 255)
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] == who_first) {
        fill(255, 0, 0)
      }
      else if (board[r][c] == -who_first) {
        fill(255, 255, 0)
      }
      else {
        fill(255)
      }
      circle(c * 100 + 50, r * 100 + 50, 100)
    }
  }

  if (player == -1 * init_player || selfP){
    if (wait_frame){
      console.log(game.getValidMoves(board))
      let p = mcts.getActionProb(game.getCanonicalForm(board, player))
      let m = p.indexOf(Math.max(...p))
      //console.log(p)
      if (moves_total < 1){
        //m = randomChoices(p)[0]
      }
      board = game.getNextState(board, player, m)[0]
      document.getElementById("bb").innerText = ""
      player *= -1
      moves_total++
      wait_frame = false
    }
    else{
      wait_frame = true
      document.getElementById("bb").innerText = "AI is thinking"
    }
  }

  let g = game.getGameEnded(board, 1)
  if (g == -1 || g == 1){
    selfP = false
    player = 0
    if (!selfP){
      if (g == 1){
        document.getElementById("ll").innerText = "You win!"
      }
      if (g == -1){
        document.getElementById("ll").innerText = "You Lose! (Unsurprisingly)"
      }
    }
  }
}

function mouseClicked() {
  if (mouseY > height || player == -1*init_player || player == 0 || mouseY < 0 || selfP){
    return
  }
  console.log(game.getValidMoves(board))
  let c = constrain(floor(mouseX / 100),0, 6)
  board = game.getNextState(board, player, c)[0]
  player *= -1
  moves_total ++
}
