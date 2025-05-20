// const { functions } = require("lodash");
function searchEmail() {
    let email = document.getElementById("inputSeachEmail").value;
    sessionStorage.setItem("emailTemp",email);
    let checkEmail = listAccount.find(acc => acc.email === email);
    if (checkEmail) {
        let forgotPassword = document.getElementById("forgotPassword");
        forgotPassword.innerHTML = `
        <img src="/assets/img/logoRikkei.png" class="logo">
                <h1>Nhập Mật Khẩu Mới<h1>
                <form class="input-group" onsubmit="{emailjs}">
                    <label name="email">Mật Khẩu Mới</label>
                    <div class="input-box">
                        <i class="fa-regular fa-envelope"></i>
                        <input name="email" type="password" placeholder="Mật Khẩu Mới" id="inputPassword1">
                    </div>
                    <label name="mat-khau">Xác Nhận Mật Khẩu</label>
                    <div class="input-box">
                        <i class="fa-regular fa-envelope"></i>
                        <input name="mat-khau" type="password" placeholder="Xác Nhận Mật Khẩu" id="inputPassword2">
                    </div>
                    <button style="margin-bottom: 10px;" type="button" id="btn-login" onclick="otp()">Xác Nhận</button>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <a href="" onclick="out()">Tìm Email Khác</a>
                        <p style="margin: 0;">Quay Lại Đăng Nhập <a style="cursor: pointer;" onclick="signOut()">Đăng nhập</a></p>
                    </div>
                </form>`;
    } else {
        showWarning("Không tìm thấy email này!!!");
        return
    }
}
function out() {
    let forgotPassword = document.getElementById("forgotPassword");
    forgotPassword.innerHTML = `
    <img src="/assets/img/logoRikkei.png" class="logo">
                <h1>Quên Mật khẩu<h1>
                <form class="input-group">
                    <label for="email">Email</label>
                    <div class="input-box">
                        <i class="fa-regular fa-envelope"></i>
                        <input type="email" placeholder=" you@company.com" autocomplete="username" id="inputSeachEmail">
                    </div>
                    <button style="margin-bottom: 10px;" type="button" id="btn-login" onclick="searchEmail()">Xác Nhận</button>
                    <p>Quay Lại Đăng Nhập <a style="cursor: pointer;" onclick="signOut()">Đăng nhập</a></p>
                </form>`
}

function otp() {
    let password = document.getElementById("inputPassword1").value;
    let password2 = document.getElementById("inputPassword2").value;
    sessionStorage.setItem("passwordTemp", password)
    console.log(password.length);
    if (password.length < 8) {
        showWarning("Mật Khẩu Phải Lớn Hơn 8 Ký tự");
        return;
    } else if (password === password2) {
        let otp = generateOTP();
        let email = sessionStorage.getItem("emailTemp")
        sessionStorage.setItem("OTP", otp);
        emailjs.init('ctukBCXWCujNRHSar');
        emailjs.send(
            'service_trdu09h', // service ID
            'template_ecdruua', // template_ecdruua
            {
                email: email,
                OTP: otp,
            },
            'ctukBCXWCujNRHSar' // public key
        )
            .then((result) => {
                console.log("gửi thành công" + result.text);
            }, (error) => {
                console.error('FAILED...', error);
            });
        let forgotPassword = document.getElementById("forgotPassword");
        forgotPassword.innerHTML = `
        <img src="/assets/img/logoRikkei.png" alt="rikkei" id="img-rikkei">
                    <h3 class="title">Xác thực OTP</h3>
                   <p>Vui lòng nhập mã OTP được gửi về Email để hoàn tất quá trình đăng ký.</p>
                  <div id="input-number-OTP">
                        <input type="number" placeholder="-">
                      <input type="number" placeholder="-">
                     <input type="number" placeholder="-">
                      <input type="number" placeholder="-">
                       <input type="number" placeholder="-">
                       <input type="number" placeholder="-">
                   </div>
                   <button id="confirm">Xác nhận</button>
                   <p id="navigation">Đã có tài khoản? <a onclick="nextPage()">Đăng nhập</a></p>`;

        let confirmBtn = document.getElementById("confirm");
        confirmBtn.addEventListener("click", checkOTP);
        setupInputBehavior();
    } else {
        showWarning("Mật khẩu không Trùng khớp")
    }

}
function getUserOTP() {
    var inputs = document.querySelectorAll("#input-number-OTP input");
    var userOtp = '';
    for (var i = 0; i < inputs.length; i++) {
        userOtp += inputs[i].value;
    }
    return userOtp;
}

function checkOTP() {
    var storedOTP = sessionStorage.getItem('OTP');
    var userOTP = getUserOTP();
    console.log(storedOTP);
    if (userOTP.length < 6) {
        showWarning("Vui lòng nhập đầy đủ 6 số.");
        return;
    }
    if (userOTP === storedOTP) {
        nextPage();
    } else {
        showWarning("Mã OTP không đúng. Vui lòng thử lại.");
    }
}
function nextPage() {
    let email = sessionStorage.getItem("emailTemp")
    let passwd = sessionStorage.getItem("passwordTemp")
    for (let i = 0; i < listAccount.length; i++) {
        if (listAccount[i].email === email) {
            listAccount[i].password = passwd;
        }
    }
    localStorage.setItem("listAccount", JSON.stringify(listAccount));
    showSuccessful("Đổi Mật KHẩu Thành Công")
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 500);
}
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function setupInputBehavior() {
    var inputs = document.querySelectorAll("#input-number-OTP input");

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("type", "text");
        inputs[i].setAttribute("inputmode", "numeric");
        inputs[i].setAttribute("maxlength", "1");

        inputs[i].addEventListener("input", function (event) {
            var input = event.target;
            var value = input.value;

            if (value < "0" || value > "9") {
                input.value = "";
                return;
            }

            var nextInput = input.nextElementSibling;
            if (nextInput && nextInput.tagName === "INPUT") {
                nextInput.select();
            }
        });

        inputs[i].addEventListener("keydown", function (event) {
            var input = event.target;
            var key = event.key;

            if (key === "e" || key === "E" || key === "+" || key === "-" || key === "." || key === ",") {
                event.preventDefault();
            }

            if (key === "Backspace" && input.value === "") {
                var prevInput = input.previousElementSibling;
                if (prevInput && prevInput.tagName === "INPUT") {
                    prevInput.select();
                }
            }
        });

        inputs[i].addEventListener("paste", function (event) {
            event.preventDefault();
        });
    }
}

const MAX_WARNINGS = 4;
const container = document.getElementById("container-warning");
const warningQueue = [];
function showWarning(message) {
    if (container.children.length >= MAX_WARNINGS) {
        warningQueue.push(message);
        return;
    }

    const warning = document.createElement("div");
    warning.className = "warning";
    warning.innerHTML = `
        <i class="fa-solid fa-circle-xmark"></i>
        <span>${message}</span>
    `;
    container.appendChild(warning);

    setTimeout(() => {
        warning.classList.add("slide-out");
        setTimeout(() => {
            warning.remove();

            if (warningQueue.length > 0) {
                const nextMessage = warningQueue.shift();
                showWarning(nextMessage);
            }
        }, 400);
    }, 3000);
}
const containerSuccessful = document.getElementById("container-successful");

function showSuccessful(message) {
    const Successful = document.createElement("div");
    Successful.className = "login-successful";
    Successful.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${message}</span>
    `;
    containerSuccessful.appendChild(Successful);
    // setTimeout(() => {
    //     Successful.classList.add("slide-out");
    // }, 3000);
}