let accNow = JSON.parse(localStorage.getItem("AccountNow"));
let listAcc = JSON.parse(localStorage.getItem("listAccount"));

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

//Hiển thị tên tài khoản hiện tại

let boxName = document.getElementById("form-row");
let editInfoModal = document.getElementById("editInfo");

boxName.innerHTML = "";
editInfoModal.innerHTML = "";
boxName.innerHTML = `
        <div class="form-group">
          <label for="lastName">Họ và Tên</label>
          <input type="text" id="lastName" value="${accNow.nameUser}" disabled />
        </div>
        <div class="form-group">
          <label for="lastName">Email</label>
          <input type="text" id="lastName" value="${accNow.email}" disabled />
        </div>
        <div class="form-group">
          <label for="birthday">Ngày sinh</label>
          <input type="text" id="birthday" value="${accNow.date}" disabled />
        </div>
    `;

editInfoModal.innerHTML = `
    <div class="form-group">
          <label for="editLastName">Họ và Tên</label>
          <input type="text" id="editName" value="${accNow.nameUser}" class="box-input-edit" />
        </div>
        <div class="form-group">
          <label for="editBirthday">Ngày sinh</label>
          <input type="date" id="editBirthday" value="${accNow.date}" class="box-input-edit" />
        </div>
`;

//Đổi passwd và thông Tin 

//1.1 đổi thông tin
const btnEdit = document.getElementById("btnEdit");

btnEdit.addEventListener("click", () => {
    let editLastNameValue = document.getElementById("editName").value;
    let editBirthdayValue = document.getElementById("editBirthday").value;

    if (!validBlank(editLastNameValue, editBirthdayValue)) {
        Swal.fire({
            title: "Không được để trtống",
            text: "Email,tên người dùng hoặc ngày sinh không được để trống",
            icon: "error"
        });
    } else {

        Swal.fire({
            title: "Bạn có muốn lưu thay đổi",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Lưu",
            denyButtonText: `Không lưu`
        }).then((result) => {
            if (result.isConfirmed) {
                accNow.nameUser = editLastNameValue;
                accNow.date = editBirthdayValue;
                listAcc.forEach(element => {
                    if (element.id === accNow.id) {
                        element.nameUser = editLastNameValue;
                        element.date = editBirthdayValue;
                    }
                });
                localStorage.setItem("listAccount", JSON.stringify(listAcc));
                localStorage.setItem("AccountNow", JSON.stringify(accNow));
                Swal.fire({
                    title: "Lưu thành công!!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // closeModal("editInfoModal");
                    location.reload();
                });
            } else if (result.isDenied) {
                Swal.fire("Thay đổi không được lưu", "", "info");
            }
        });

    }
});

//valid đổi thông tin

function validBlank(name,date) {
    if (name.length === 0 ||
        date.length === 0) {
        return false;
    }
    return true;
}

function isValidEmail(email) {
    const regex = /^[a-zA-z0-9._%+-]+@[a-zA-Z0-9.]+\.(com)$/;
    return regex.test(email);
}

// Đổi passwd
const btnChangePass = document.getElementById("btnChangePass");


btnChangePass.addEventListener("click", () => {
    let currentPasswordValue = document.getElementById("currentPassword").value;
    let newPasswordValue = document.getElementById("newPassword").value;
    let confirmPasswordVlaue = document.getElementById("confirmPassword").value;

    if (!validBlank(currentPasswordValue, newPasswordValue, confirmPasswordVlaue)) {
        Swal.fire({
            title: "Không được để trông",
            text: "Các ô nhập không được để trống",
            icon: "error"
        });
    } else if (!isValidPasswd(currentPasswordValue)) {
        Swal.fire({
            title: "Mật khẩu sai định dạng",
            text: "Mật khẩu phải đủ 8 ký tự",
            icon: "error"
        });
    } else if (!isRePasswd(newPasswordValue, confirmPasswordVlaue)) {
        Swal.fire({
            title: "Mật khẩu sai",
            text: "Mật khẩu xác nhận không khớp với mật khẩu mới",
            icon: "error"
        });
    }else if(!checkPassCure (currentPasswordValue)){
         Swal.fire({
            title: "Mật khẩu sai",
            text: "Mật khẩu bạn nhập không khớp với mật khẩu tài khoản",
            icon: "error"
        });
    }else {
        Swal.fire({
            title: "Bạn có muốn lưu thay đổi hiện tại",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Lưu",
            denyButtonText: `Không lưu`
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Lưu thành công!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    accNow.password = newPasswordValue;
                    listAcc.forEach(element => {
                        if (element.id === accNow.id) {
                            element.password = newPasswordValue;
                        }
                    });
                    localStorage.setItem("listAccount", JSON.stringify(listAcc));
                    localStorage.setItem("AccountNow", JSON.stringify(accNow));
                    closeModal("passwordModal");
                    location.reload();
                });
            } else if (result.isDenied) {
                Swal.fire("Thay đổi không thành công", "", "info");
            }
        });
    }

});

//Valid đổi pass

function isValidPasswd(passwd) {
    if (passwd.length < 8) {
        return false;
    }
    return true;
}

function isRePasswd(newpasswd, repasswd) {
    if (newpasswd === repasswd) {
        return true;
    }
    return false;
}

function checkPassCure (passwd){
    if(accNow.password === passwd){
        return true;
    }
    return false;
}
document.getElementById("profile-image").src = accNow.avata;
function changeAvatar() {
    event.preventDefault();
    const avatar = document.getElementById("avatarUrl").value;
    accNow.avata = avatar;
    localStorage.setItem("AccountNow", JSON.stringify(accNow));
    listAccount.forEach(element => {
        if (element.id === accNow.id) {
            element.avata = avatar;
        }
    });
    localStorage.setItem("listAccount", JSON.stringify(listAccount));
    avatar1();
    document.getElementById("profile-image").src = avatar;
    closeModal('avatarModal')
}
