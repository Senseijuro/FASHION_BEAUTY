document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked = document.getElementById('locked');
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var roundEl = document.getElementById('mm-round');
  var correctEl = document.getElementById('mm-correct');
  var wrongEl = document.getElementById('mm-wrong');
  var card = document.getElementById('mm-card');
  var phraseEl = document.getElementById('mm-phrase');
  var feedbackEl = document.getElementById('mm-feedback');
  var choicesEl = document.getElementById('mm-choices');

  if (!state.quiz || state.quiz.completed === null) { if (locked) locked.classList.remove('hidden'); if (gameArea) gameArea.classList.add('hidden'); return; }
  if (state.enigma && state.enigma.completed !== null) { if (gameArea) gameArea.classList.add('hidden'); if (locked) locked.classList.add('hidden'); showResult(state.enigma.completed, 0); return; }
  if (locked) locked.classList.add('hidden');

  var allQuestions = [
    {
      before: "L'esthéticienne réalise des soins du",
      answer: "visage",
      after: "et du corps pour embellir la peau.",
      choices: ["visage", "moteur", "jardin", "réseau"]
    },
    {
      before: "Le fleuriste compose des",
      answer: "bouquets",
      after: "adaptés à chaque occasion et saison.",
      choices: ["bouquets", "circuits", "rapports", "plâtres"]
    },
    {
      before: "La prothésiste ongulaire pose du gel ou de la",
      answer: "résine",
      after: "sur les ongles de ses clientes.",
      choices: ["résine", "colle", "peinture", "mousse"]
    },
    {
      before: "Le coiffeur utilise des",
      answer: "ciseaux",
      after: "et un séchoir pour réaliser une coupe.",
      choices: ["ciseaux", "pinceaux", "scalpels", "tournevis"]
    },
    {
      before: "Le fleuriste événementiel décore les salles de",
      answer: "réception",
      after: "avec des compositions florales.",
      choices: ["réception", "sport", "classe", "chirurgie"]
    },
    {
      before: "En esthétique, le soin du visage commence par un",
      answer: "démaquillage",
      after: "pour nettoyer la peau en profondeur.",
      choices: ["démaquillage", "bandage", "ponçage", "lavage auto"]
    },
    {
      before: "Le fleuriste doit conserver ses fleurs dans un endroit",
      answer: "frais",
      after: "pour prolonger leur durée de vie.",
      choices: ["frais", "chaud", "sombre", "bruyant"]
    },
    {
      before: "Le CAP Esthétique permet de travailler en",
      answer: "institut",
      after: "de beauté, en spa ou à domicile.",
      choices: ["institut", "usine", "tribunal", "garage"]
    },
    {
      before: "La maquilleuse professionnelle travaille souvent dans le milieu du",
      answer: "spectacle",
      after: "pour les défilés, films et shootings.",
      choices: ["spectacle", "bâtiment", "transport", "jardinage"]
    },
    {
      before: "Le fleuriste utilise un",
      answer: "sécateur",
      after: "pour couper les tiges des fleurs.",
      choices: ["sécateur", "marteau", "stéthoscope", "scanner"]
    }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var questions = shuffle(allQuestions).slice(0, 5);
  var current = 0;
  var correctCount = 0;
  var wrongCount = 0;
  var answered = false;

  function updateStats() {
    if (roundEl) roundEl.textContent = '✏️ ' + (current + 1) + ' / ' + questions.length;
    if (correctEl) correctEl.textContent = '✅ ' + correctCount;
    if (wrongEl) wrongEl.textContent = '❌ ' + wrongCount;
  }

  function showQuestion() {
    if (current >= questions.length) { endGame(); return; }
    answered = false;
    updateStats();
    card.classList.remove('flash-correct', 'flash-wrong');
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'mm-feedback'; }

    var q = questions[current];
    phraseEl.innerHTML = q.before + ' <span class="mm-blank">???</span> ' + q.after;

    var shuffledChoices = shuffle(q.choices);
    choicesEl.innerHTML = '';
    shuffledChoices.forEach(function(choice) {
      var btn = document.createElement('div');
      btn.className = 'mm-choice';
      btn.textContent = choice;
      btn.addEventListener('click', function() { handleChoice(choice, btn); });
      choicesEl.appendChild(btn);
    });
  }

  function handleChoice(choice, btn) {
    if (answered) return;
    answered = true;

    var q = questions[current];
    var correct = choice === q.answer;

    choicesEl.querySelectorAll('.mm-choice').forEach(function(c) { c.classList.add('disabled'); });

    if (correct) {
      correctCount++;
      btn.classList.add('selected-correct');
      card.classList.add('flash-correct');
      phraseEl.innerHTML = q.before + ' <span class="mm-blank" style="border-color:var(--green);color:var(--green)">' + q.answer + '</span> ' + q.after;
      if (feedbackEl) { feedbackEl.textContent = '✅ Correct !'; feedbackEl.className = 'mm-feedback correct'; }
    } else {
      wrongCount++;
      if (navigator.vibrate) navigator.vibrate([50]); // Vibration d'erreur de choix
      btn.classList.add('selected-wrong');
      card.classList.add('flash-wrong');
      choicesEl.querySelectorAll('.mm-choice').forEach(function(c) {
        if (c.textContent === q.answer) c.classList.add('reveal');
      });
      phraseEl.innerHTML = q.before + ' <span class="mm-blank" style="border-color:var(--red);color:var(--red)">' + q.answer + '</span> ' + q.after;
      if (feedbackEl) { feedbackEl.textContent = '❌ C\'était « ' + q.answer + ' »'; feedbackEl.className = 'mm-feedback wrong'; }
    }
    updateStats();
    setTimeout(function() { current++; showQuestion(); }, 1300);
  }

  function endGame() {
    var success = correctCount >= 3;
    state.enigma = { completed: success };
    saveGameState(state);
    setTimeout(function() { if (gameArea) gameArea.classList.add('hidden'); showResult(success, correctCount); }, 300);
  }

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
    if (resultScore) resultScore.textContent = score + ' / 5 mots trouvés';
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff007f', '#00d4ff'] }); // Confettis !
      if (resultBox) resultBox.classList.add('success'); 
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'VOCABULAIRE MAÎTRISÉ !';
      if (resultText) resultText.textContent = 'Tu parles le langage des pros. L\'intervenant(e) va pouvoir approfondir les métiers avec toi ! Dernier accessoire débloqué !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); // Vibration d'échec
      if (resultBox) { 
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect', 'fail'); 
      }
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'VOCABULAIRE À REVOIR';
      if (resultText) resultText.textContent = 'Il fallait au moins 3 bonnes réponses. L\'intervenant(e) t\'expliquera tout ça ! Accessoire verrouillé.';
    }
  }

  updateStats();
  setTimeout(function() { showQuestion(); }, 800);
});