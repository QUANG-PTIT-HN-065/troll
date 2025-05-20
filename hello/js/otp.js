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
        alert("Vui lòng nhập đầy đủ 6 số.");
        return;
    }
    if (userOTP === storedOTP) {
        nextPage();
    } else {
        alert("Mã OTP không đúng. Vui lòng thử lại.");
    }
}
function nextPage() {
    let AccountTemp = JSON.parse(sessionStorage.getItem("AccountTemp"));
    listAccount.push(AccountTemp);
    localStorage.setItem("listAccount", JSON.stringify(listAccount));
    showSuccessful("Tạo Tài Khoản Thành Công")
    window.location.href = "../index.html";
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

window.onload = function () {
    var confirmBtn = document.getElementById("confirm");
    confirmBtn.addEventListener("click", checkOTP);
    setupInputBehavior();
};
