

class Connect4Game {
  constructor() {
    this.width = 7
    this.height = 6
  }
  getInitBoard() {
    let b = new Board()
    return [...b.pieces]
  }
  getActionSize() {
    return this.width
  }
  getNextState(bo, player, action) {
    let b = new Board()
    b.pieces = b.clone(bo)
    b.add_stone(action, player)
    return [b.pieces, -player]
  }
  getValidMoves(board, player) {
    let b = new Board()
    b.pieces = [...board]
    return [...b.get_valid_moves()]
  }
  getGameEnded(board, player) {
    let b = new Board()
    b.pieces = [...board]
    let end_win = b.get_win_state()
    let is_ended = end_win[0]
    let winner = end_win[1]
    if (is_ended){
      if (winner == undefined){
        return 0.5
      }
      else if (winner == player){
        return 1
      }
      else if (winner == -player){
        return -1
      }
    }
    else{
      return 0
    }
  }
  getCanonicalForm(board, player){
    let B = new Board()
    let b = B.clone(board)
    for (let i=0;i<b.length;i++){
      for (let j=0;j<b[i].length;j++){
        b[i][j] *= player
      }
    }
    return b
  }
  stringRepresentation(board){
    let a = ""
    for (let i=0;i<board.length;i++){
      for (let j=0;j<board[i].length;j++){
        a += board[i][j]
      }
    }
    return a
  }
  predict(nnet, board){
    let b = tf.tensor(board)
    return nnet.predict(b)
  }
}