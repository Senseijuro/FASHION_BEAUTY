document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked = document.getElementById('locked');
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var gridEl = document.getElementById('pz-grid');
  var targetGridEl = document.getElementById('pz-target-grid');
  var roundEl = document.getElementById('pz-round');
  var movesEl = document.getElementById('pz-moves');
  var statusEl = document.getElementById('pz-status');

  // 1. BYPASS
  if (!state.enigme1 || state.enigme1.completed === null) { 
    if (locked) locked.classList.remove('hidden'); 
    if (gameArea) gameArea.classList.add('hidden'); 
    return; 
  }
  if (state.quiz && state.quiz.completed !== null) { 
    if (gameArea) gameArea.classList.add('hidden'); 
    if (locked) locked.classList.add('hidden'); 
    // On repasse le score sauvegardé s'il existe
    showResult(state.quiz.completed, state.quiz.score || 0); 
    return; 
  }
  if (locked) locked.classList.add('hidden');

  // 2. CACHER LE JEU AU DÉMARRAGE
  if (gameArea) gameArea.classList.add('hidden');

  // 3. AFFICHER LE TUTORIEL
  Tutorial.show({
    icon: '🧩',
    title: 'RANGEMENT BACKSTAGE',
    subtitle: 'ÉPREUVE 2',
    description: 'Remets les accessoires en ordre avant que le défilé ne commence !',
    steps: [
      { icon: '🖼️', text: 'Observe bien le modèle "Cible" affiché en haut.' },
      { icon: '👆', text: 'Clique sur les cases autour de l\'espace vide pour les déplacer.' },
      { icon: '✨', text: 'Reconstruis le plateau pour qu\'il soit identique au modèle.' }
    ],
    buttonText: 'C\'EST PARTI !',
    theme: 'cyan'
  }).then(function() {
    if (window.globalTimer) globalTimer.start();
    if (gameArea) gameArea.classList.remove('hidden');
    initGame();
  });

  // 4. FONCTION GLOBALE DU JEU
  function initGame() {
    var allPuzzles = [
      ['💄', '💅', '✂️', '🪮', '🧴', '💆', '🌸', '🪞', ''],
      ['🌹', '🌷', '💐', '🌻', '🪻', '🌺', '🎀', '🌿', ''],
      ['👁️', '💋', '🧖', '🪷', '🧹', '💎', '🌼', '🧤', '']
    ];
    var puzzles = [allPuzzles[Math.floor(Math.random() * allPuzzles.length)]];

    var puzzlesWon = 0;
    var totalMoves = 0;
    var moves = 0;
    var board = [];
    var solution = [];
    var emptyIdx = 8;
    var gameOver = false;

    function updateStats() {
      if (roundEl) roundEl.textContent = '🧩 Puzzle';
      if (movesEl) movesEl.textContent = '🔄 ' + moves + ' coups';
      if (statusEl) statusEl.textContent = gameOver ? '🏁 Terminé' : '⏳ En cours';
    }

    function showTarget() {
      targetGridEl.innerHTML = '';
      solution.forEach(function(emoji) {
        var c = document.createElement('div');
        c.className = 'pz-target-cell';
        c.textContent = emoji || '⬜';
        targetGridEl.appendChild(c);
      });
    }

    function getNeighbors(idx) {
      var row = Math.floor(idx / 3); var col = idx % 3;
      var n = [];
      if (row > 0) n.push(idx - 3);
      if (row < 2) n.push(idx + 3);
      if (col > 0) n.push(idx - 1);
      if (col < 2) n.push(idx + 1);
      return n;
    }

    function shuffleBoard() {
      var arr = solution.slice();
      var empty = arr.indexOf('');
      var prev = -1;
      var numMoves = 60 + Math.floor(Math.random() * 21);
      for (var m = 0; m < numMoves; m++) {
        var neighbors = getNeighbors(empty).filter(function(n) { return n !== prev; });
        var pick = neighbors[Math.floor(Math.random() * neighbors.length)];
        arr[empty] = arr[pick];
        arr[pick] = '';
        prev = empty;
        empty = pick;
      }
      if (arraysEqual(arr, solution)) {
        var nb = getNeighbors(empty);
        var p = nb[0];
        arr[empty] = arr[p]; arr[p] = ''; empty = p;
      }
      return arr;
    }

    function arraysEqual(a, b) {
      for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
      return true;
    }

    function renderBoard() {
      gridEl.innerHTML = '';
      board.forEach(function(emoji, idx) {
        var el = document.createElement('div');
        el.className = 'pz-cell';
        if (emoji === '') {
          el.classList.add('empty');
        } else {
          el.textContent = emoji;
          if (emoji === solution[idx]) el.classList.add('correct');
          el.addEventListener('click', function() { handleClick(idx); });
        }
        gridEl.appendChild(el);
      });
    }

    function handleClick(idx) {
      if (gameOver) return;
      var neighbors = getNeighbors(emptyIdx);
      if (neighbors.indexOf(idx) === -1) {
        if (navigator.vibrate) navigator.vibrate([50]); 
        return;
      }

      board[emptyIdx] = board[idx];
      board[idx] = '';
      emptyIdx = idx;
      moves++;
      totalMoves++;
      updateStats();
      renderBoard();

      if (arraysEqual(board, solution)) {
        gameOver = true;
        puzzlesWon++;
        if (statusEl) statusEl.textContent = '✅ Résolu !';
        gridEl.querySelectorAll('.pz-cell').forEach(function(c) { c.classList.add('solved'); });
        setTimeout(function() { endGame(); }, 1000);
      }
    }

    function startPuzzle() {
      solution = puzzles[0].slice();
      board = shuffleBoard();
      emptyIdx = board.indexOf('');
      moves = 0;
      gameOver = false;
      updateStats();
      showTarget();
      renderBoard();
    }

    function skipPuzzle() {
      if (gameOver) return;
      totalMoves += moves;
      gameOver = true;
      endGame();
    }

    function endGame() {
      var success = puzzlesWon >= 1;
      // On sauvegarde totalMoves dans le state pour pouvoir le récupérer plus tard
      state.quiz = { completed: success, score: totalMoves };
      saveGameState(state);
      // On transmet totalMoves à la fonction showResult
      setTimeout(function() { if (gameArea) gameArea.classList.add('hidden'); showResult(success, totalMoves); }, 400);
    }

    var skipBtn = document.getElementById('btn-skip-puzzle');
    if (skipBtn) {
      var newSkipBtn = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
      newSkipBtn.addEventListener('click', function() {
        if (confirm('Passer ce puzzle ? Il sera compté comme échoué.')) skipPuzzle();
      });
    }

    updateStats();
    setTimeout(function() { startPuzzle(); }, 800);
  }

  // 5. FONCTION SHOWRESULT HORS DE INITGAME
  // On utilise le paramètre 'score' transmis par endGame (qui correspond à totalMoves)
  function showResult(success, score) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');
    
    // Le crash venait d'ici ! Maintenant on utilise la variable "score" passée en paramètre
    if (resultScore) {
       resultScore.textContent = score > 0 ? score + ' coups au total' : 'Puzzle passé';
    }
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff007f', '#00d4ff'] }); 
      
      if (resultBox) { 
        resultBox.classList.remove('success-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('success-effect');
        resultBox.classList.add('success'); 
      }
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'BACKSTAGE EN ORDRE !';
      if (resultText) resultText.textContent = 'Tu as l\'œil et la logique — le backstage est prêt pour le défilé ! Accessoire débloqué !';
    
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); 
      
      if (resultBox) { 
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect'); 
        resultBox.classList.add('fail'); 
      }
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'BACKSTAGE EN DÉSORDRE';
      if (resultText) resultText.textContent = 'Tu as abandonné le puzzle. Accessoire verrouillé.';
    }
  }
});