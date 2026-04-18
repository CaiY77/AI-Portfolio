/* ─────────────────────────────────────────
   TIC TAC TOE  (tictactoe.html)
───────────────────────────────────────── */
if (document.getElementById('board') && document.querySelector('.cell[data-i]')) {
  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  let board, current, over;
  let scores = { X: 0, O: 0, tie: 0 };

  const cells   = document.querySelectorAll('.cell');
  const statusEl = document.getElementById('status');
  const scoreX   = document.getElementById('score-x');
  const scoreO   = document.getElementById('score-o');
  const scoreTie = document.getElementById('score-tie');

  function init() {
    board   = Array(9).fill('');
    current = 'X';
    over    = false;
    cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
    setStatus();
  }

  function setStatus(msg) {
    if (msg) {
      statusEl.textContent = msg;
    } else {
      statusEl.style.color = current === 'X' ? '#f55' : '#5af';
      statusEl.textContent = `PLAYER ${current}'S TURN`;
    }
  }

  function checkWin() {
    for (const [a, b, c] of WINS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return [a, b, c];
    }
    return null;
  }

  function handleClick(e) {
    const i = +e.currentTarget.dataset.i;
    if (over || board[i]) return;

    board[i] = current;
    e.currentTarget.textContent = current;
    e.currentTarget.classList.add('taken', current.toLowerCase());

    const winLine = checkWin();
    if (winLine) {
      over = true;
      winLine.forEach(idx => cells[idx].classList.add('win-cell'));
      scores[current]++;
      updateScores();
      statusEl.style.color = current === 'X' ? '#f55' : '#5af';
      statusEl.textContent = `PLAYER ${current} WINS!`;
      return;
    }

    if (board.every(v => v)) {
      over = true;
      scores.tie++;
      updateScores();
      statusEl.style.color = '#aaa';
      statusEl.textContent = "IT'S A TIE!";
      return;
    }

    current = current === 'X' ? 'O' : 'X';
    setStatus();
  }

  function updateScores() {
    scoreX.textContent   = scores.X;
    scoreO.textContent   = scores.O;
    scoreTie.textContent = scores.tie;
  }

  cells.forEach(c => c.addEventListener('click', handleClick));
  document.getElementById('reset-btn').addEventListener('click', init);
  init();
}


/* ─────────────────────────────────────────
   CONNECT 4  (connect4.html)
───────────────────────────────────────── */
if (document.getElementById('arrows')) {
  const ROWS = 6, COLS = 7;
  let grid, current, over;
  let scores = { 1: 0, 2: 0 };

  const boardEl  = document.getElementById('board');
  const arrowsEl = document.getElementById('arrows');
  const statusEl = document.getElementById('status');
  const scoreP1  = document.getElementById('score-p1');
  const scoreP2  = document.getElementById('score-p2');

  function init() {
    grid    = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    current = 1;
    over    = false;
    render();
    setStatus();
  }

  function render() {
    boardEl.innerHTML  = '';
    arrowsEl.innerHTML = '';

    for (let c = 0; c < COLS; c++) {
      const arrow = document.createElement('div');
      arrow.className   = 'drop-arrow';
      arrow.textContent = '▼';
      arrow.dataset.col = c;
      arrow.addEventListener('click', () => drop(c));
      arrow.addEventListener('mouseenter', () => { if (!over) arrow.classList.add(`p${current}-hover`); });
      arrow.addEventListener('mouseleave', () => arrow.classList.remove('p1-hover', 'p2-hover'));
      arrowsEl.appendChild(arrow);
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (grid[r][c]) cell.classList.add(`p${grid[r][c]}`);
        cell.dataset.r = r;
        cell.dataset.c = c;
        boardEl.appendChild(cell);
      }
    }
  }

  function drop(col) {
    if (over) return;
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!grid[r][col]) { row = r; break; }
    }
    if (row === -1) return;

    grid[row][col] = current;
    const win = checkWin(row, col);
    render();

    if (win) {
      over = true;
      win.forEach(([r, c]) => boardEl.children[r * COLS + c].classList.add('win-cell'));
      scores[current]++;
      updateScores();
      statusEl.style.color   = current === 1 ? '#f55' : '#ff0';
      statusEl.textContent   = `PLAYER ${current} WINS!`;
      return;
    }

    if (grid[0].every(v => v)) {
      over = true;
      statusEl.style.color = '#aaa';
      statusEl.textContent = "IT'S A DRAW!";
      return;
    }

    current = current === 1 ? 2 : 1;
    setStatus();
  }

  function checkWin(row, col) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of dirs) {
      const line = [[row, col]];
      for (const sign of [1, -1]) {
        let r = row + dr * sign, c = col + dc * sign;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === current) {
          line.push([r, c]);
          r += dr * sign;
          c += dc * sign;
        }
      }
      if (line.length >= 4) return line;
    }
    return null;
  }

  function setStatus() {
    statusEl.style.color = current === 1 ? '#f55' : '#ff0';
    statusEl.textContent = `PLAYER ${current}'S TURN`;
  }

  function updateScores() {
    scoreP1.textContent = scores[1];
    scoreP2.textContent = scores[2];
  }

  document.getElementById('reset-btn').addEventListener('click', init);
  init();
}


/* ─────────────────────────────────────────
   DOTS & BOXES  (dotsandboxes.html)
───────────────────────────────────────── */
if (document.getElementById('canvas')) {
  const GRID     = 5;
  const CELL     = 80;
  const PAD      = 40;
  const DOT_R    = 6;
  const LINE_HIT = 14;

  const COLORS   = { 1: '#f55', 2: '#5af' };
  const BOX_FILL = { 1: 'rgba(255,85,85,0.25)', 2: 'rgba(85,170,255,0.25)' };

  const canvas   = document.getElementById('canvas');
  const ctx      = canvas.getContext('2d');
  const statusEl = document.getElementById('status');
  const scoreP1El = document.getElementById('score-p1');
  const scoreP2El = document.getElementById('score-p2');

  let hLines, vLines, boxes, current, over, scores, hoverLine;

  const W = PAD * 2 + CELL * (GRID - 1);
  canvas.width  = W;
  canvas.height = W;

  function init() {
    hLines    = Array.from({ length: GRID },     () => Array(GRID - 1).fill(0));
    vLines    = Array.from({ length: GRID - 1 }, () => Array(GRID).fill(0));
    boxes     = Array.from({ length: GRID - 1 }, () => Array(GRID - 1).fill(0));
    current   = 1;
    over      = false;
    hoverLine = null;
    scores    = { 1: 0, 2: 0 };
    updateScores();
    setStatus();
    draw();
  }

  function dotPos(r, c) { return { x: PAD + c * CELL, y: PAD + r * CELL }; }

  function draw() {
    ctx.clearRect(0, 0, W, W);

    for (let r = 0; r < GRID - 1; r++) {
      for (let c = 0; c < GRID - 1; c++) {
        if (boxes[r][c]) {
          const p = dotPos(r, c);
          ctx.fillStyle = BOX_FILL[boxes[r][c]];
          ctx.fillRect(p.x, p.y, CELL, CELL);
          ctx.fillStyle = COLORS[boxes[r][c]];
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`P${boxes[r][c]}`, p.x + CELL / 2, p.y + CELL / 2);
        }
      }
    }

    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID - 1; c++)
        drawLine(dotPos(r, c), dotPos(r, c + 1), hLines[r][c], isHover('h', r, c));

    for (let r = 0; r < GRID - 1; r++)
      for (let c = 0; c < GRID; c++)
        drawLine(dotPos(r, c), dotPos(r + 1, c), vLines[r][c], isHover('v', r, c));

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const p = dotPos(r, c);
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle   = '#0ff';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }
    }
  }

  function isHover(type, r, c) {
    return hoverLine && hoverLine.type === type && hoverLine.r === r && hoverLine.c === c;
  }

  function drawLine(p1, p2, owner, hover) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineWidth = owner ? 5 : 3;
    if (owner) {
      ctx.strokeStyle = COLORS[owner];
      ctx.shadowColor = COLORS[owner];
      ctx.shadowBlur  = 10;
    } else if (hover && !over) {
      ctx.strokeStyle = COLORS[current] + 'aa';
      ctx.shadowColor = COLORS[current];
      ctx.shadowBlur  = 8;
    } else {
      ctx.strokeStyle = '#223';
      ctx.shadowBlur  = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function getLineAt(mx, my) {
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID - 1; c++) {
        const p1 = dotPos(r, c), p2 = dotPos(r, c + 1);
        if (Math.abs(my - p1.y) < LINE_HIT && mx > p1.x + DOT_R && mx < p2.x - DOT_R)
          return { type: 'h', r, c };
      }
    for (let r = 0; r < GRID - 1; r++)
      for (let c = 0; c < GRID; c++) {
        const p1 = dotPos(r, c), p2 = dotPos(r + 1, c);
        if (Math.abs(mx - p1.x) < LINE_HIT && my > p1.y + DOT_R && my < p2.y - DOT_R)
          return { type: 'v', r, c };
      }
    return null;
  }

  function claimLine(line) {
    if (line.type === 'h') {
      if (hLines[line.r][line.c]) return false;
      hLines[line.r][line.c] = current;
    } else {
      if (vLines[line.r][line.c]) return false;
      vLines[line.r][line.c] = current;
    }
    return true;
  }

  function checkBoxes() {
    let scored = 0;
    for (let r = 0; r < GRID - 1; r++)
      for (let c = 0; c < GRID - 1; c++)
        if (!boxes[r][c]) {
          if (hLines[r][c] && hLines[r+1][c] && vLines[r][c] && vLines[r][c+1]) {
            boxes[r][c] = current;
            scores[current]++;
            scored++;
          }
        }
    return scored;
  }

  function totalLines() {
    let claimed = 0;
    hLines.forEach(row => row.forEach(v => { if (v) claimed++; }));
    vLines.forEach(row => row.forEach(v => { if (v) claimed++; }));
    return { claimed, total: GRID * (GRID - 1) * 2 };
  }

  function handleClick(e) {
    if (over) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const line = getLineAt(mx, my);
    if (!line || !claimLine(line)) return;

    const scored = checkBoxes();
    updateScores();

    const { claimed, total } = totalLines();
    if (claimed === total) {
      over = true;
      const winner = scores[1] > scores[2] ? 1 : scores[2] > scores[1] ? 2 : 0;
      statusEl.style.color = winner ? COLORS[winner] : '#aaa';
      statusEl.textContent = winner ? `PLAYER ${winner} WINS!` : "IT'S A TIE!";
      hoverLine = null;
      draw();
      return;
    }

    if (scored === 0) current = current === 1 ? 2 : 1;
    setStatus();
    draw();
  }

  function handleMouseMove(e) {
    if (over) return;
    const rect = canvas.getBoundingClientRect();
    hoverLine = getLineAt(
      (e.clientX - rect.left) * (canvas.width  / rect.width),
      (e.clientY - rect.top)  * (canvas.height / rect.height)
    );
    draw();
  }

  function handleMouseLeave() { hoverLine = null; draw(); }

  function setStatus() {
    statusEl.style.color = COLORS[current];
    statusEl.textContent = `PLAYER ${current}'S TURN`;
  }

  function updateScores() {
    scoreP1El.textContent = scores[1];
    scoreP2El.textContent = scores[2];
  }

  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  document.getElementById('reset-btn').addEventListener('click', init);
  init();
}
