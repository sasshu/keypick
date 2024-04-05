window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("button");
  const text = document.getElementById("text");
  button.addEventListener("click", async () => {
    text.textContent = await window.api.openDialog();
  });

  const themeButton = document.getElementById("theme-button");
  themeButton.addEventListener("click", window.api.toggleDarkmode);
});
