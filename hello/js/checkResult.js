let listQuesDo = [];
let listSelectedAws = [];
let statusExam = sessionStorage.getItem("statusExam");

if (statusExam === "sáng") {
  listQuesDo = JSON.parse(localStorage.getItem("questionInProgress"));
  listSelectedAws =  JSON.parse(localStorage.getItem("listSelectedAwsMorning"));
} else if (statusExam === "chiều") {
  listQuesDo = JSON.parse(localStorage.getItem("questionInProgress2"));
  listSelectedAws =  JSON.parse(localStorage.getItem("listSelectedAwsAfternoon"));
}
// Hiển thị tất cả câu hỏi và hết quả 
let examInPro = JSON.parse(localStorage.getItem("examInProgress"));
//render câu hỏi
renderQuestion();
console.log(listQuesDo);
console.log(listSelectedAws);


function renderQuestion() {
  let questionDo = document.getElementById("homework-section");
  questionDo.innerHTML = "";

  listQuesDo.forEach((element, i) => {
    let optionsHTML = "";
    // Tìm đối tượng đã chọn theo ID
    const answerObj = listSelectedAws.find(ans => ans.id === element.id);

    element.options.forEach(opt => {
      const escaped = escapeHTML(opt);
      let checked = "";
      let style = "";
      let styleBtn = "";
      // Nếu người dùng đã chọn câu này và đáp án là option hiện tại
      if (answerObj && answerObj.choice === opt) {
        checked = "checked";

        // Tô màu theo đúng/sai
        if (opt === element.correctAnswer) {
          styleBtn = `style="border: 1px solid #039855;background: #ECFDF3;color: #039855;"`
          renderBtnQues(i + 1, styleBtn);
          style = 'style="background: #039855; color: #fff; font-weight: 500;"'; // xanh: đúng
        } else {
          styleBtn = `style="border: 1px solid #BC2228;background: #FFF6F7;color: #BC2228;"`
          renderBtnQues(i + 1, styleBtn);
          style = 'style="background: #BC2228; color: #fff; font-weight: 500;"'; // đỏ: sai
        }
      }

      optionsHTML += `
        <li>
          <label ${style}>
            <input type="radio" name="question${i}" value="${escaped}" ${checked} disabled>
            <span>${escaped}</span>
          </label>
        </li>
      `;
    });

    questionDo.innerHTML += `
      <div id="containerQuestion" class="question">
        <p id="question">Câu số ${i + 1}</p>
        <p id="topic">Front-end</p>
        <p id="topic">Lập trình</p>
        <p id="name-question">${element.content}</p>
        <ul id="class-answer">
          ${optionsHTML}
        </ul>
      </div>
    `;
  });
}

function renderBtnQues(i, style) {
  let btnQues = document.getElementById("number-question");
  btnQues.innerHTML += `<button ${style}>${i}</button>`;
}


function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.getElementById("internal-article").addEventListener('click', () => {
  location.href = "Endexam.html";
});

//Tên đề thi hiện tại

document.querySelectorAll(".name-test").forEach(e => {
  e.textContent = "";
  e.textContent = examInPro.title
});

//Thời gian của đề thi ngày

document.getElementById('exam-time').textContent = "";
document.getElementById('exam-time').textContent = `Thời gian thi: ${examInPro.durationMinutes} phút `