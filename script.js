// script.js - Vocabulary Quiz System (FINAL VERSION)

let allWords = [];
let selectedWords = [];
let resultsForDownload = [];

// Load words
async function loadWords() {
  const response = await fetch("word_bank.json");
  const data = await response.json();
  allWords = data.words;
}

// Random pick up to 25 words
function pickRandom25(words) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(25, shuffled.length));
}

// Start test
document.getElementById("startBtn").addEventListener("click", async () => {
  await loadWords();
  selectedWords = pickRandom25(allWords);
  resultsForDownload = [];

  const testArea = document.getElementById("testArea");
  testArea.innerHTML = "";

  selectedWords.forEach((obj, i) => {
    const row = document.createElement("div");
    row.className = "word-row";
    row.innerHTML = `
      <b>${i + 1}. ${obj.word}</b>
      <input type="text" id="answer-${i}" placeholder="輸入中文意思">
    `;
    testArea.appendChild(row);
  });

  testArea.classList.remove("hidden");
  document.getElementById("submitBtn").classList.remove("hidden");
  document.getElementById("downloadBtn").classList.add("hidden");
  document.getElementById("results").innerHTML = "";
  document.getElementById("resultTitle").classList.add("hidden");
});

// Submit + grading system (100 points total)
document.getElementById("submitBtn").addEventListener("click", () => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  document.getElementById("resultTitle").classList.remove("hidden");

  let score = 0;
  const total = selectedWords.length;
  const pointPerQuestion = Math.round(100 / total);

  for (let i = 0; i < selectedWords.length; i++) {
    const word = selectedWords[i].word;
    const correctAnswer = selectedWords[i].meaning;
    const studentAns = document.getElementById(`answer-${i}`).value.trim();

    // ✅ support single or multiple answers
    let isCorrect = false;

    if (Array.isArray(correctAnswer)) {
      isCorrect = correctAnswer.includes(studentAns);
    } else {
      isCorrect = studentAns === correctAnswer;
    }

    if (isCorrect) score += pointPerQuestion;

    resultsForDownload.push({
      word,
      studentAns: studentAns || "（空白）",
      correctAnswer,
      isCorrect
    });

    const row = document.createElement("div");
    row.innerHTML = `
      <p>
        <b>${word}</b><br>
        ➜ 你的答案：<span style="color:blue">${studentAns || "（空白）"}</span><br>
        ➜ 正確答案：<span style="color:green">
          ${Array.isArray(correctAnswer) ? correctAnswer.join(" / ") : correctAnswer}
        </span><br>
        ➜ 判定：
        ${isCorrect
          ? '<span style="color:green">✔ 正確</span>'
          : '<span style="color:red">✘ 錯誤</span>'
        }
      </p>
      <hr>
    `;
    resultsDiv.appendChild(row);
  }

  // score display
  const scoreDiv = document.createElement("h2");
  scoreDiv.innerText = `Score: ${score} / 100`;
  resultsDiv.prepend(scoreDiv);

  document.getElementById("downloadBtn").classList.remove("hidden");
});

// Download results (print to PDF)
document.getElementById("downloadBtn").addEventListener("click", () => {
  const win = window.open("", "_blank");

  let html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vocabulary Test Results</title>
      <style>
        body { font-family: serif; padding: 30px; }
        h1 { text-align: center; }
        p { margin: 12px 0; }
        hr { border: none; border-top: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <h1>Vocabulary Test Results</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <hr>
  `;

  resultsForDownload.forEach((r, i) => {
    html += `
      <p>
        <b>${i + 1}. ${r.word}</b><br>
        你的答案：${r.studentAns}<br>
        正確答案：${
          Array.isArray(r.correctAnswer)
            ? r.correctAnswer.join(" / ")
            : r.correctAnswer
        }<br>
        判定：${r.isCorrect ? "✔ 正確" : "✘ 錯誤"}
      </p>
      <hr>
    `;
  });

  html += `
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
});
