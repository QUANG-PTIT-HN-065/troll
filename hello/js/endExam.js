let listQuesDo = JSON.parse(localStorage.getItem("questionInProgress"));
let listQuesDoAfternoon = JSON.parse(localStorage.getItem("questionInProgress2"));
let listSelectedAwsMorning = JSON.parse(localStorage.getItem("listSelectedAwsMorning"));
let listSelectedAwsAfternoon = JSON.parse(localStorage.getItem("listSelectedAwsAfternoon"));
let statusExam = sessionStorage.getItem("statusExam");
let examInProgress = JSON.parse(localStorage.getItem("examInProgress"));
let AccountNow = JSON.parse(localStorage.getItem("AccountNow"));

//Lưu lịch sử bài vừa làm
let historyExamDo = localStorage.setItem("historyExamDo", JSON.stringify(examInProgress));

// if (statusExam === "sáng") {

// } else if (statusExam === "chiều") {
//     listQuesDoAfternoon = JSON.parse(localStorage.getItem("questionInProgress2"));
// }


let questionTrue = 0;
let questionTrueAfternoon = 0;

//Kiểm tra xem làm đề thi ca sáng ca chiều chưa
let checkDoExamMorning = false;
let checkDoExamAfternoon = false;

let examInPro = JSON.parse(localStorage.getItem("examInProgress"));

searchTrueQues()

function searchTrueQues() {
    listQuesDo.forEach((element, i) => {
        // Tìm đối tượng đã chọn theo ID
        const answerObj = listSelectedAwsMorning.find(ans => ans.id === element.id);
        element.options.forEach(opt => {
            // Nếu người dùng đã chọn câu này và đáp án là option hiện tại
            if (answerObj && answerObj.choice === opt) {
                if (opt === element.correctAnswer) {
                    questionTrue++;
                    checkDoExamMorning = true;
                }
            }
        });
    });
}

searchTrueQuesAfternood()

function searchTrueQuesAfternood() {
    listQuesDoAfternoon.forEach((element, i) => {
        // Tìm đối tượng đã chọn theo ID
        const answerObj = listSelectedAwsAfternoon.find(ans => ans.id === element.id);
        element.options.forEach(opt => {
            // Nếu người dùng đã chọn câu này và đáp án là option hiện tại
            if (answerObj && answerObj.choice === opt) {
                if (opt === element.correctAnswer) {
                    questionTrueAfternoon++;
                    checkDoExamAfternoon = true;
                }
            }
        });
    });
}

console.log(checkDoExamMorning);
console.log(checkDoExamAfternoon);

//Tính điểm bài làm
totalResult = Math.floor((100 / (listQuesDo.length)) * questionTrue);

totalResultAfternoon = Math.floor((100 / (listQuesDoAfternoon.length)) * questionTrueAfternoon);

console.log(totalResult);
console.log(totalResultAfternoon);



if (isNaN(totalResult)) {
    totalResult = 0;
}

if (isNaN(totalResultAfternoon)) {
    totalResultAfternoon = 0;
}

document.getElementById("totalResu").textContent = `Kết Quả ${totalResult}/100`;
document.getElementById("totalResuAfter").textContent = `Kết Quả ${totalResultAfternoon}/100`;
// localStorage.setItem("totalExam", JSON.stringify(totalResult));

// Đọc biến isRetake từ localStorage
const isRetake = localStorage.getItem("isRetake") === "true";
localStorage.removeItem("isRetake"); // Xoá để tránh dùng lại lần sau

// Tạo đối tượng lịch sử bài thi
let historyDo = {
    examId: examInProgress.id,
    examName: examInProgress.title,
    time: examInProgress.durationMinutes,
    morningExam: {
        score: totalResult,
        answers: listSelectedAwsMorning
    },
    afternoonExam: {
        score: totalResultAfternoon,
        answers: listSelectedAwsAfternoon
    },
    date: getCurrentDateTime()
};

// Nếu là làm lại: luôn thêm mới vào đầu mảng
if (isRetake) {
    AccountNow.history.unshift(historyDo);
} else {
    // Nếu không phải làm lại thì tìm xem đã có chưa → cập nhật hoặc thêm mới
    let index = AccountNow.history.findIndex(e => e.examId === examInProgress.id);
    if (index === -1) {
        AccountNow.history.unshift(historyDo);
    } else {
        AccountNow.history[index] = historyDo;
    }
}

// Lưu vào localStorage
localStorage.setItem("AccountNow", JSON.stringify(AccountNow));

// Cập nhật tài khoản trong listAccount
const idx = listAccount.findIndex(acc => acc.id === AccountNow.id);
if (idx !== -1) {
    listAccount[idx] = AccountNow;
    localStorage.setItem("listAccount", JSON.stringify(listAccount));
}


// xem kết quả đúng sai

[...document.getElementsByClassName("btn-show-result")].forEach(btnCheckResult => {
    btnCheckResult.addEventListener('click', () => {
        location.href = "checkResult.html";
    });
});

let btnShowTotal = document.getElementById("btn-show-total");
let btnShowResult = document.getElementById("btn-show-result");
let btnShowTotalAfternoon = document.getElementById("btn-show-total-afternoon");
let showTotal = document.getElementById('show-total');
let showResult = document.getElementById("show-result");
let ShowTotalAfternoon = document.getElementById("show-total-afternoon");
let notDoExam = document.getElementById("show-notdo-thisExam");
// statusExam = "sáng";

//Kiểm tra trạng thái đề sáng chiều để hiển thị màn kết quả đề đấy trước

if (statusExam === "sáng") {
    btnShowResult.classList.remove("active");
    btnShowTotal.classList.add("active");
    btnShowTotalAfternoon.classList.remove("active");
    showTotal.style.display = "block";
} else if (statusExam === "chiều") {
    btnShowResult.classList.remove("active");
    btnShowTotal.classList.remove("active");
    btnShowTotalAfternoon.classList.add("active");
    ShowTotalAfternoon.style.display = "block";
}

btnShowTotal.addEventListener('click', () => {
    btnShowResult.classList.remove("active");
    btnShowTotal.classList.add("active");
    btnShowTotalAfternoon.classList.remove("active");
    statusExam = "sáng"
    sessionStorage.setItem("statusExam", statusExam);
    if (checkDoExamMorning) {
        showTotal.style.display = "block";
        showResult.style.display = "none";
        ShowTotalAfternoon.style.display = "none";
        notDoExam.style.display = "none";
    } else {
        showTotal.style.display = "none";
        showResult.style.display = "none";
        ShowTotalAfternoon.style.display = "none";
        notDoExam.style.display = "block";
    }
});

btnShowResult.addEventListener('click', () => {
    btnShowResult.classList.add("active");
    btnShowTotal.classList.remove("active");
    btnShowTotalAfternoon.classList.remove("active");
    showTotal.style.display = "none";
    showResult.style.display = "block";
    ShowTotalAfternoon.style.display = "none";
    notDoExam.style.display = "none";
});

btnShowTotalAfternoon.addEventListener('click', () => {
    statusExam = "chiều"
    btnShowResult.classList.remove("active");
    btnShowTotal.classList.remove("active");
    btnShowTotalAfternoon.classList.add("active");
    sessionStorage.setItem("statusExam", statusExam);
    if (checkDoExamAfternoon) {
        showTotal.style.display = "none";
        showResult.style.display = "none";
        ShowTotalAfternoon.style.display = "block";
        notDoExam.style.display = "none";
    } else {
        showTotal.style.display = "none";
        showResult.style.display = "none";
        ShowTotalAfternoon.style.display = "none";
        notDoExam.style.display = "block";
    }
});

//Làm bài thi ca tiếp theo
document.getElementById("btn-do-this-exam").addEventListener('click', () => {
    location.href = "doExam.html"
});

//Biểu đồ tính điểm

function drawCircle(score, total) {
    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    const startAngle = -0.5 * Math.PI;
    const percent = score / total;
    const endAngle = startAngle + 2 * Math.PI * percent;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Foreground progress
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "#BC2228"; // màu đỏ
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    document.getElementById("scoreText").textContent = `${score}/${total}`;
}

drawCircle(totalResult, 100);

//Biểu đồ tinh điểm chiều

function drawCircleAfternoon(score, total) {
    const canvas = document.getElementById("scoreCanvasAfternoon");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    const startAngle = -0.5 * Math.PI;
    const percent = score / total;
    const endAngle = startAngle + 2 * Math.PI * percent;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Foreground progress
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "#BC2228"; // màu đỏ
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    document.getElementById("scoreTextAfternoon").textContent = `${score}/${total}`;
}

drawCircleAfternoon(totalResultAfternoon, 100)

// Nút quay lại trang chủ
document.getElementById("go-home-page").addEventListener('click', () => {
    homePage()
});

//Hiển thị đề hiện tại

document.querySelectorAll(".app-title").forEach(e => {
    e.textContent = "";
    e.textContent = examInPro.title;
});

//Hàm lấy ngày tháng năm hiện tại

function getCurrentDateTime() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = now.getFullYear();

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

//Hiển thị nút làm lại khi làm xong cả 2 đề sáng chiều

let btnRetake = document.getElementById("retake-th-exam");

if (checkDoExamMorning === true && checkDoExamAfternoon === true) {
    btnRetake.style.display = "block";
} else {
    btnRetake.style.display = "none";
}

btnRetake.addEventListener('click', () => {
    localStorage.setItem("isRetake", "true");
    location.href = "exam.html";
});