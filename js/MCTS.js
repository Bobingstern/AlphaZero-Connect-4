
EPS = 1e-8;
let CALL_AVOID = 0
class MCTS {

  constructor(game, nnet, args) {
    this.game = game;
    this.nnet = nnet;
    this.args = args;
    this.Qsa = {};  // stores Q values for s,a (as defined in the paper)
    this.Nsa = {};  // stores #times edge s,a was visited
    this.Ns = {};  // stores #times board s was visited
    this.Ps = {};  // stores initial policy (returned by neural net)
    this.Es = {};  // stores game.getGameEnded ended for board s
    this.Vs = {};  // stores game.getValidMoves for board s
  }

  // This function performs numMCTSSims simulations of MCTS starting from
  // canonicalBoard.
  // Returns:
  //     probs: a policy vector where the probability of the ith action is
  //            proportional to Nsa[(s,a)]**(1./temp)
  getActionProb(canonicalBoard, temp) {
    if (temp == undefined) {
      temp = 1
    }
    for (let i = 0; i < this.args.numMCTSSims; i++) {
      this.search(canonicalBoard);
    }
    let s = this.game.stringRepresentation(canonicalBoard);
    let counts = [];
    for (let a = 0; a < this.game.getActionSize(); a++) {
      counts.push(this.Nsa.hasOwnProperty([s, a]) ? this.Nsa[[s, a]] : 0);
    }
    
    // let tem = []
    // let S = 0
    // for (let x of counts) {
    //   tem.push(x ** (1 / temp))
    //   S += x ** (1 / temp)
    // }
    // let PP = []
    // for (let x of tem) {
    //   PP.push(x / S)
    // }
    // return PP
    let bestAs = counts.reduce((acc, cur, idx, src) => cur == Math.max(...counts) ? acc.concat(idx) : acc, []);
    let bestA = bestAs[Math.floor(Math.random() * bestAs.length)];

    let probs = new Array(counts.length).fill(0);
    probs[bestA] = 1;
    return probs

  }

  // This function performs one iteration of MCTS. It is recursively called
  // till a leaf node is found. The action chosen at each node is one that
  // has the maximum upper confidence bound as in the paper.
  // Once a leaf node is found, the neural network is called to return an
  // initial policy P and a value v for the state. This value is propagated
  // up the search path. In case the leaf node is a terminal state, the
  // outcome is propagated up the search path. The values of Ns, Nsa, Qsa are
  // updated.
  // NOTE: the return values are the negative of the value of the current
  // state. This is done since v is in [-1,1] and if v is the value of a
  // state for the current player, then its value is -v for the other player.
  // Returns:
  //     v: the negative of the value of the current canonicalBoard
  search(canonicalBoard) {
    ++CALL_AVOID
    if (CALL_AVOID % 1000 == 0) {

      CALL_AVOID = 0
    }
    let s = this.game.stringRepresentation(canonicalBoard);

    if (!this.Es.hasOwnProperty(s)) {
      this.Es[s] = this.game.getGameEnded(canonicalBoard, 1);
    }
    if (this.Es[s] != 0) {
      // terminal node
      return -this.Es[s];
    }
    if (!this.Ps.hasOwnProperty(s)) {
      // leaf node
      let prediction = this.game.predict(this.nnet, canonicalBoard);

      this.Ps[s] = prediction[0].arraySync()[0];
      let v = prediction[1].arraySync()[0][0];

      let valids = this.game.getValidMoves(canonicalBoard, 1);

      // for (let i = 0; i < this.Ps[s].length; i++)
      //   this.Ps[s][i] = Math.abs(this.Ps[s][i] * valids[i])

      //console.log(this.Ps[s])
      this.Ps[s] = this.Ps[s].map((prob, index) => valids[index] ? prob : 0);  // masking invalid moves
      //console.log(this.Ps[s])
      let sum_Ps_s = this.Ps[s].reduce((acc, cur) => acc + cur);

      if (sum_Ps_s > 0) {
        this.Ps[s] = this.Ps[s].map((p) => p / sum_Ps_s);

      }

      let OP = true
      for (let i = 0; i < valids.length; i++) {
        if (valids[i] != 0) {
          OP = false
        }
      }
      if (OP) {
        //console.log(this.Es[s])
      }
      this.Vs[s] = valids;
      this.Ns[s] = 0;
      return -v;
    }

    let valids = this.Vs[s];
    let cur_best = Number.NEGATIVE_INFINITY;
    let best_act = -1;

    // pick the action with the highest upper confidence bound
    for (let a = 0; a < this.game.getActionSize(); a++) {
      if (valids[a] == 1) {
        let ucb;
        if (this.Qsa.hasOwnProperty([s, a])) {
          ucb = this.Qsa[[s, a]] + this.args.cpuct * this.Ps[s][a] * Math.sqrt(this.Ns[s]) / (1 + this.Nsa[[s, a]]);
        } else {
          ucb = this.args.cpuct * this.Ps[s][a] * Math.sqrt(this.Ns[s] + EPS);
        }
        if (ucb > cur_best) {
          cur_best = ucb;
          best_act = a;
        }
      }
    }

    let a = best_act;
    let next_s, next_player;
    [next_s, next_player] = this.game.getNextState(canonicalBoard, 1, a);
    next_s = this.game.getCanonicalForm(next_s, next_player);
    let v = this.search(next_s);

    if (this.Qsa.hasOwnProperty([s, a])) {
      this.Qsa[[s, a]] = (this.Nsa[[s, a]] * this.Qsa[[s, a]] + v) / (this.Nsa[[s, a]] + 1);
      this.Nsa[[s, a]]++;
    } else {
      this.Qsa[[s, a]] = v;
      this.Nsa[[s, a]] = 1;
    }

    this.Ns[s]++;
    return -v;
  }
}