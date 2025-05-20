let page = sessionStorage.getItem("page")
function init(renderListd) {
    console.log(renderListd);
    
    let itemsPerPage;
    if (page === "adminPage") {
        itemsPerPage = 5;
    }else if (page === "userPage") {
        itemsPerPage = 10;
    }
    if (renderListd.length === 0) {
        document.getElementById("listHistory").innerHTML = `
        <div id="tableHistory">
            <div style="width: 100%; text-align: center;">Không có lịch sử thi nào</div>
        </div>`;
        return;
        
    }
    let currentPage = 1;
    const totalItems = renderListd.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const contentList = document.getElementById("listHistory");

    const firstPageBtn = document.getElementById("firstPageHistory");
    const prevPageBtn = document.getElementById("prevPageHistory");
    const nextPageBtn = document.getElementById("nextPageHistory");
    const lastPageBtn = document.getElementById("lastPageHistory");
    const pageNumbersContainer = document.getElementById("pageNumbersHistory");

    function renderContent() {
        contentList.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const itemsToShow = renderListd.slice(start, end);

        itemsToShow.forEach((item, index) => {
            contentList.innerHTML += `
            <div id="tableHistory" onclick="eventBtn(${index})">
                <div style="width: 25%;">${item.examName}</div>
                <div style="width: 25%">${item.date}</div>
                <div style="width: 25%">${item.morningExam.score}</div>
                <div style="width: 25%">${item.afternoonExam.score}</div>
            </div>`;
        });

        // // const btnDoExam = document.querySelectorAll(".btn-do-exam");
        // btnDoExam.forEach((btn, idx) => {
        //     btn.addEventListener("click", () => {

        //     });
        // });



        renderPagination();
    }

    function renderPagination() {
        pageNumbersContainer.innerHTML = "";
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (startPage > 1) {
            pageNumbersContainer.innerHTML += `<button class="page-button" data-page="1">1</button>`;
            if (startPage > 2) pageNumbersContainer.innerHTML += `<span>...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbersContainer.innerHTML += `
                <button class="page-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbersContainer.innerHTML += `<span>...</span>`;
            pageNumbersContainer.innerHTML += `<button class="page-button" data-page="${totalPages}">${totalPages}</button>`;
        }

        setupPaginationEvents();
        updateButtons();
    }

    function setupPaginationEvents() {
        const pageButtons = pageNumbersContainer.querySelectorAll(".page-button");
        pageButtons.forEach(button => {
            button.addEventListener("click", () => {
                currentPage = parseInt(button.dataset.page);
                renderContent();
            });
        });

        if (firstPageBtn) firstPageBtn.onclick = () => { currentPage = 1; renderContent(); };
        if (prevPageBtn) prevPageBtn.onclick = () => { if (currentPage > 1) currentPage--; renderContent(); };
        if (nextPageBtn) nextPageBtn.onclick = () => { if (currentPage < totalPages) currentPage++; renderContent(); };
        if (lastPageBtn) lastPageBtn.onclick = () => { currentPage = totalPages; renderContent(); };
    }

    function updateButtons() {
        if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
        if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    }

    renderContent();
}
let acc = JSON.parse(localStorage.getItem("AccountNow"))
let history = acc.history
let status = "sáng"
if (page === "adminPage") {

} else if (page === "userPage") {
    init(history);
}
function eventBtn(index) {
    let item = history[index];
    let status = "sáng";
    const btn = document.getElementById("seeDetailsUser");

    btn.classList.remove("hidden");
    renderDetail();

    function renderDetail() {
        btn.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="width: 82%;">
                <h3>Thông Tin </h3>
                <h4>Tên bài thi: ${item.examName}</h4>
                <br>
                <h4>Ngày làm bài: ${item.date}</h4>
                <br>
                <h4>Điểm: ${status === "sáng" ? item.morningExam.score : item.afternoonExam.score}</h4>
                <br>
                <h4>Đề thi ca: ${status}</h4>
                <div id="homework-section"></div>
                <div class="modal-actions">
                    <button type="button" class="btn-close" id="close-btn">Đóng</button>
                    <button type="button" class="btn-add-post" id="btn-add-post">Ca ${status === "sáng" ? "chiều" : "sáng"}</button>
                </div>
            </div>
            <div id="number-question">
              <!-- <button class = "wrongAws" >1</button> -->
            </div>
        </div>
        `;
        document.getElementById("close-btn").addEventListener("click", () => {
            btn.classList.add("hidden");
        });

        document.getElementById("btn-add-post").addEventListener("click", () => {
            status = status === "sáng" ? "chiều" : "sáng";
            renderDetail();
        });
        let exam = listExam.find((element) => element.id === item.examId);
        let answers = status === "sáng" ? item.morningExam.answers : item.afternoonExam.answers;
        let questionIds = status === "sáng" ? exam.questionIds : exam.questionIds2;
        let exam1 = listQuestion.filter(q => questionIds.includes(q.id));
        console.log(exam1);
        console.log(answers);

        renderQuestion(exam1, answers)
    }

}


function renderQuestion(listQuesDo, listSelectedAws) {
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

// if (page === "userPage") {
//     document.getElementById("internal-article").addEventListener('click', () => {
//         location.href = "Endexam.html";
//     });

// }
//Tên đề thi hiện tại

// document.querySelectorAll(".name-test").forEach(e => {
//   e.textContent = "";
//   e.textContent = examInPro.title
// });

// //Thời gian của đề thi ngày

// document.getElementById('exam-time').textContent = "";
// document.getElementById('exam-time').textContent = `Thời gian thi: ${examInPro.durationMinutes} phút `