
class Board{
  constructor(){
    this.height = 6
    this.width = 7
    this.win_length = 4

    this.pieces = []
    for (let i=0;i<this.height;i++){
      let temp = []
      for (let j=0;j<this.width;j++){
        temp.push(0)
      }
      this.pieces.push(temp)
    }
  }
  add_stone(column, player){
    for (let i=this.height-1;i>=0;i--){
      if (this.pieces[i][column] == 0){
        this.pieces[i][column] = player
        return true
      }
    }
    return false
  }
  get_valid_moves(){
    let valid = []
    for (let i=0;i<this.width;i++){
      valid.push(0)
    }
    for (let i=this.height-1;i>=0;i--){
      for (let j=0;j<this.width;j++){
        if (this.pieces[i][j] == 0){
          valid[j] = 1
        }
      }
    }
    return valid
  }
  chkLine(a,b,c,d) {
    // Check first cell non-zero and all cells match
    return ((a != 0) && (a ==b) && (a == c) && (a == d));
  }  

  chkWinner(bd) {
    // Check down
    let r, c
    for (r = 0; r < 3; r++)
        for (c = 0; c < 7; c++)
            if (this.chkLine(bd[r][c], bd[r+1][c], bd[r+2][c], bd[r+3][c]))
                return bd[r][c];

    // Check right
    for (r = 0; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (this.chkLine(bd[r][c], bd[r][c+1], bd[r][c+2], bd[r][c+3]))
                return bd[r][c];

    // Check down-right
    for (r = 0; r < 3; r++)
        for (c = 0; c < 4; c++)
            if (this.chkLine(bd[r][c], bd[r+1][c+1], bd[r+2][c+2], bd[r+3][c+3]))
                return bd[r][c];

    // Check down-left
    for (r = 3; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (this.chkLine(bd[r][c], bd[r-1][c+1], bd[r-2][c+2], bd[r-3][c+3]))
                return bd[r][c];

    return 0;
  }
  get_win_state(){
    let w = this.chkWinner(this.pieces)
    let full = true
    for (let i=0;i<this.height;i++){
      for (let j=0;j<this.width;j++){
        if (this.pieces[i][j] == 0){
          full = false
        }
      }
    }

    return [w != 0 || full, w == 0 ? undefined : w]
  }
  str(){
    return this.pieces.toString()
  }
  clone(board) {
    return [...board].map((x) => [...x]);
  }
}



