document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var roundEl = document.getElementById('vf-round');
  var correctEl = document.getElementById('vf-correct');
  var wrongEl = document.getElementById('vf-wrong');
  var timerFill = document.getElementById('vf-timer-fill');
  var card = document.getElementById('vf-card');
  var statementEl = document.getElementById('vf-statement');
  var feedbackEl = document.getElementById('vf-feedback');
  var btnVrai = document.getElementById('btn-vrai');
  var btnFaux = document.getElementById('btn-faux');

  if (state.enigme1 && state.enigme1.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    showResult(state.enigme1.completed, 0);
    return;
  }

  var allStatements = [
    { text: "L'esthéticienne peut réaliser des soins du visage et des épilations.", answer: true },
    { text: "Le fleuriste travaille uniquement avec des fleurs artificielles.", answer: false },
    { text: "Le CAP Esthétique est le diplôme minimum pour exercer en salon.", answer: true },
    { text: "Un fleuriste doit connaître les saisons de floraison des plantes.", answer: true },
    { text: "La prothésiste ongulaire peut prescrire des médicaments pour les ongles.", answer: false },
    { text: "Le fleuriste événementiel crée des compositions pour les mariages et galas.", answer: true },
    { text: "En esthétique, il est interdit d'utiliser des produits cosmétiques bio.", answer: false },
    { text: "Le coiffeur peut aussi proposer des colorations et des permanentes.", answer: true },
    { text: "Le fleuriste n'a pas besoin de savoir gérer un stock de fleurs.", answer: false },
    { text: "Une esthéticienne peut se spécialiser en maquillage professionnel.", answer: true },
    { text: "Les fleuristes travaillent souvent debout et portent des charges lourdes.", answer: true },
    { text: "Un spa praticien ne fait que des massages relaxants.", answer: false },
    { text: "Le fleuriste funéraire réalise des gerbes et couronnes pour les deuils.", answer: true },
    { text: "L'esthéticienne n'a pas le droit de travailler à domicile.", answer: false },
    { text: "Un conseiller en image aide ses clients à trouver leur style.", answer: true },
    { text: "Les horaires en salon d'esthétique sont toujours de 9h à 17h.", answer: false }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var statements = shuffle(allStatements).slice(0, 5);
  var QUESTION_TIME = 7000;
  var current = 0;
  var correctCount = 0;
  var wrongCount = 0;
  var answered = false;
  var questionTimer = null;

  function updateStats() {
    if (roundEl) roundEl.textContent = '❓ ' + (current + 1) + ' / ' + statements.length;
    if (correctEl) correctEl.textContent = '✅ ' + correctCount;
    if (wrongEl) wrongEl.textContent = '❌ ' + wrongCount;
  }

  function startQuestion() {
    if (current >= statements.length) { endGame(); return; }
    answered = false;
    updateStats();
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'vf-feedback'; }
    card.classList.remove('flash-correct', 'flash-wrong');
    btnVrai.classList.remove('disabled');
    btnFaux.classList.remove('disabled');

    statementEl.textContent = statements[current].text;
    if (timerFill) { timerFill.style.width = '100%'; timerFill.classList.remove('danger'); }

    var start = Date.now();
    questionTimer = setInterval(function() {
      var elapsed = Date.now() - start;
      var pct = Math.max(0, 100 - (elapsed / QUESTION_TIME * 100));
      if (timerFill) {
        timerFill.style.width = pct + '%';
        if (pct < 30) timerFill.classList.add('danger');
      }
      if (elapsed >= QUESTION_TIME) {
        clearInterval(questionTimer);
        if (!answered) handleTimeout();
      }
    }, 50);
  }

  function handleAnswer(playerAnswer) {
    if (answered) return;
    answered = true;
    clearInterval(questionTimer);
    btnVrai.classList.add('disabled');
    btnFaux.classList.add('disabled');

    var correct = statements[current].answer === playerAnswer;
    if (correct) {
      correctCount++;
      card.classList.add('flash-correct');
      if (feedbackEl) { feedbackEl.textContent = '✅ Bonne réponse !'; feedbackEl.className = 'vf-feedback correct'; }
    } else {
      wrongCount++;
      card.classList.add('flash-wrong');
      if (navigator.vibrate) navigator.vibrate([50]); // Vibration d'erreur
      var bonneReponse = statements[current].answer ? 'VRAI' : 'FAUX';
      if (feedbackEl) { feedbackEl.textContent = '❌ Raté ! C\'était ' + bonneReponse; feedbackEl.className = 'vf-feedback wrong'; }
    }
    updateStats();
    setTimeout(function() { current++; startQuestion(); }, 1200);
  }

  function handleTimeout() {
    answered = true;
    wrongCount++;
    btnVrai.classList.add('disabled');
    btnFaux.classList.add('disabled');
    card.classList.add('flash-wrong');
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Vibration timeout
    var bonneReponse = statements[current].answer ? 'VRAI' : 'FAUX';
    if (feedbackEl) { feedbackEl.textContent = '⏰ Temps écoulé ! C\'était ' + bonneReponse; feedbackEl.className = 'vf-feedback wrong'; }
    updateStats();
    setTimeout(function() { current++; startQuestion(); }, 1200);
  }

  btnVrai.addEventListener('click', function() { handleAnswer(true); });
  btnFaux.addEventListener('click', function() { handleAnswer(false); });

  function endGame() {
    var success = correctCount >= 3;
    state.enigme1 = { completed: success };
    saveGameState(state);
    setTimeout(function() { if (gameArea) gameArea.classList.add('hidden'); showResult(success, correctCount); }, 300);
  }

  function showResult(success, score) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');
    if (resultScore) resultScore.textContent = score + ' / 5 bonnes réponses';
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff007f', '#00d4ff'] }); // Confettis !
      if (resultBox) resultBox.classList.add('success'); 
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'MIRANDA IMPRESSIONNÉE !';
      if (resultText) resultText.textContent = 'Tu connais bien les métiers. L\'intervenant pourra approfondir avec toi ! Accessoire débloqué !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); // Vibration échec lourd
      if (resultBox) { 
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; // Force le reflow CSS
        resultBox.classList.add('fail-effect', 'fail'); 
      }
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'MIRANDA EST DÉÇUE';
      if (resultText) resultText.textContent = 'Il fallait au moins 3 bonnes réponses. Pose tes questions à l\'intervenant ! Accessoire verrouillé.';
    }
  }

  updateStats();
  setTimeout(function() { startQuestion(); }, 800);
});