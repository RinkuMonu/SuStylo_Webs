// utils/password.js
export function generateStrongPassword(length = 10) {
  const lowers = "abcdefghijklmnopqrstuvwxyz";
  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specials = "@#$%^&*!()-_+=~[]{}|:;,.<>/?";

  // ensure at least one of each
  let pwd = "";
  pwd += uppers[Math.floor(Math.random() * uppers.length)];
  pwd += lowers[Math.floor(Math.random() * lowers.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];

  const all = lowers + uppers + digits + specials;
  while (pwd.length < length) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // shuffle
  pwd = pwd.split("").sort(() => 0.5 - Math.random()).join("");
  return pwd;
}
