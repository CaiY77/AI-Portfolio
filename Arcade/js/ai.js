/* ─────────────────────────────────────────
   TIC TAC TOE VS AI  (tictactoe-ai.html)
───────────────────────────────────────── */
if (document.querySelector('.cell[data-i]')) {
  const WINS  = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const HUMAN = 'X';
  const AI    = 'O';

  let board, over, aiThinking, difficulty;
  let scores = { you: 0, ai: 0, tie: 0 };

  difficulty = 'medium';

  const cells    = document.querySelectorAll('.cell');
  const statusEl = document.getElementById('status');

  function setDiff(d) {
    difficulty = d;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.d === d));
    init();
  }

  function init() {
    board      = Array(9).fill('');
    over       = false;
    aiThinking = false;
    cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
    statusEl.style.color = '#f55';
    statusEl.textContent = 'YOUR TURN';
  }

  function getWinLine(b) {
    for (const [a, bx, c] of WINS) {
      if (b[a] && b[a] === b[bx] && b[a] === b[c]) return [a, bx, c];
    }
    return null;
  }

  // Minimax — maximises for AI ('O'), minimises for HUMAN ('X')
  function minimax(b, isMaximizing, depth) {
    const win = getWinLine(b);
    if (win) return isMaximizing ? -10 + depth : 10 - depth;
    if (b.every(v => v)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = AI;    best = Math.max(best, minimax(b, false, depth + 1)); b[i] = ''; }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) { b[i] = HUMAN; best = Math.min(best, minimax(b, true,  depth + 1)); b[i] = ''; }
      }
      return best;
    }
  }

  function bestMove() {
    let best = -Infinity, move = -1;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = AI;
        const score = minimax(board, false, 0);
        board[i] = '';
        if (score > best) { best = score; move = i; }
      }
    }
    return move;
  }

  function randomMove() {
    const empty = board.map((v, i) => v ? null : i).filter(i => i !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Scan for a move that immediately wins or blocks for the given player
  function findCritical(player) {
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = player;
        const wins = getWinLine(board);
        board[i] = '';
        if (wins) return i;
      }
    }
    return -1;
  }

  function chooseMove() {
    if (difficulty === 'easy') {
      return Math.random() < 0.8 ? randomMove() : bestMove();
    }
    if (difficulty === 'medium') {
      const win   = findCritical(AI);    if (win   !== -1) return win;
      const block = findCritical(HUMAN); if (block !== -1) return block;
      return Math.random() < 0.5 ? randomMove() : bestMove();
    }
    return bestMove(); // hard — unbeatable
  }

  function placeToken(i, player) {
    board[i] = player;
    cells[i].textContent = player;
    cells[i].classList.add('taken', player.toLowerCase());
  }

  function checkEnd(mover) {
    const winLine = getWinLine(board);
    if (winLine) {
      over = true;
      winLine.forEach(idx => cells[idx].classList.add('win-cell'));
      if (mover === HUMAN) {
        scores.you++;
        statusEl.style.color = '#f55';
        statusEl.textContent = 'YOU WIN!';
      } else {
        scores.ai++;
        statusEl.style.color = '#f0f';
        statusEl.textContent = 'AI WINS!';
      }
      updateScores();
      return true;
    }
    if (board.every(v => v)) {
      over = true;
      scores.tie++;
      statusEl.style.color = '#aaa';
      statusEl.textContent = "IT'S A TIE!";
      updateScores();
      return true;
    }
    return false;
  }

  function handleClick(e) {
    const i = +e.currentTarget.dataset.i;
    if (over || board[i] || aiThinking) return;

    placeToken(i, HUMAN);
    if (checkEnd(HUMAN)) return;

    aiThinking = true;
    statusEl.style.color = '#f0f';
    statusEl.textContent = 'AI THINKING...';
    cells.forEach(c => c.classList.add('thinking'));

    setTimeout(() => {
      cells.forEach(c => c.classList.remove('thinking'));
      placeToken(chooseMove(), AI);
      aiThinking = false;
      if (!checkEnd(AI)) {
        statusEl.style.color = '#f55';
        statusEl.textContent = 'YOUR TURN';
      }
    }, 400);
  }

  function updateScores() {
    document.getElementById('score-you').textContent = scores.you;
    document.getElementById('score-ai').textContent  = scores.ai;
    document.getElementById('score-tie').textContent = scores.tie;
  }

  // Expose setDiff globally so the inline onclick buttons can call it
  window.setDiff = setDiff;

  cells.forEach(c => c.addEventListener('click', handleClick));
  document.getElementById('reset-btn').addEventListener('click', init);
  init();
}
