const startBtn = document.getElementById("start-btn");

let examInPro = JSON.parse(localStorage.getItem("examInProgress"));

let questionInProgress = [];
let questionInProgress2 = [];
startBtn.addEventListener('click', () => {
    setTimeout(() => {
        location.href = "doExam.html";
    }, 500);
});

// document.getElementById("logo-head").addEventListener('click', () => {
//     homePage();
// });

document.getElementById("app-title").textContent = `${examInPro.title}`;

document.getElementById("breadcrumb").textContent = `${examInPro.title}`;

// console.log(examInPro.questionIds);

for (let i = 0; i < examInPro.questionIds.length; i++) {
    for (let j = 0; j < listQuestion.length; j++) {
        if(examInPro.questionIds[i] === listQuestion[j].id){
            questionInProgress.push(listQuestion[j]);
        }   
    }
}

for (let i = 0; i < examInPro.questionIds2.length; i++) {
    for (let j = 0; j < listQuestion.length; j++) {
        if(examInPro.questionIds2[i] === listQuestion[j].id){
            questionInProgress2.push(listQuestion[j]);
        }   
    }
}
import _ from 'https://cdn.skypack.dev/lodash';
let quest1 = _.shuffle(questionInProgress)
let quest2 = _.shuffle(questionInProgress2)
console.log(questionInProgress);
console.log(questionInProgress2);
localStorage.setItem("questionInProgress", JSON.stringify(quest1));
localStorage.setItem("questionInProgress2", JSON.stringify(quest2));

let statusExam = "sáng"
sessionStorage.setItem("statusExam", statusExam);

let morningExam = document.getElementById("morningExam")
let afternoonExam = document.getElementById("afternoonExam")

afternoonExam.addEventListener('click', () => {
    statusExam = "chiều"
    morningExam.classList.toggle("active");
    afternoonExam.classList.toggle("active");
    console.log(statusExam);
    sessionStorage.setItem("statusExam", statusExam);
})
morningExam.addEventListener('click', () => {
    statusExam = "sáng"
    morningExam.classList.toggle("active");
    afternoonExam.classList.toggle("active");
    console.log(statusExam);
    sessionStorage.setItem("statusExam", statusExam);
})

//Trước khi làm bài
let listSelectedAws = [];

localStorage.setItem("listSelectedAwsMorning", JSON.stringify(listSelectedAws));
localStorage.setItem("listSelectedAwsAfternoon", JSON.stringify(listSelectedAws));