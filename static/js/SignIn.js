const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const Alert = document.querySelector(".alert")
// import { usersImg } from "./avatarapi.js";
// const AlertTimer = document.querySelector(".alert-timer")
// const profile_container = document.getElementById('profile-container');
// for (let index = 0; index < 4; index++) {
//   let i = document.createElement('i');  
//   i.innerHTML = usersImg
//   profile_container.appendChild(i)
// }
sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

if (Alert) {
  let i=5;
  setTimeout(() => {
    Alert.style.display = "none";
  }, 6000);
}