
function avatar1() {
    let acc = JSON.parse(localStorage.getItem("AccountNow"));
    document.getElementById("avatar").src = acc.avata;
    document.getElementById("navName").innerHTML = acc.nameUser;
    document.getElementById("navEmail").innerHTML = acc.email;
}
avatar1()

const menuHeader = document.getElementById("menu-header");
menuHeader.addEventListener('click', () => {
    toggleMenu();
});

function toggleMenu() {
    const menu = document.querySelector('.menu');
    const arrow = document.getElementById('arrow');
    menu.classList.toggle('open');
    arrow.classList.toggle('rotate');
}

const menuNav = document.getElementById("menu-nav");
const menu = document.getElementById("menu");
const closeMenuNav = document.getElementById("close-menu-nav");

let menuNavCheck = true;

menuNav.addEventListener('click', () => {
    menuNavCheck = !menuNavCheck;
    menuNav.style.display = menuNavCheck ? "block" : "none";
    menu.style.display = menuNavCheck ? "none" : "block";
    closeMenuNav.style.display = menuNavCheck ? "none" : "block";
});

closeMenuNav.addEventListener('click', () => {
    menuNavCheck = !menuNavCheck;
    menuNav.style.display = menuNavCheck ? "block" : "none";
    menu.style.display = menuNavCheck ? "none" : "block";
    closeMenuNav.style.display = menuNavCheck ? "none" : "block";
});
const dropdown = document.getElementById("avatar-dropdown");

avatar.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});

// Đóng dropdown nếu click ra ngoài
document.addEventListener("click", (e) => {
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});



