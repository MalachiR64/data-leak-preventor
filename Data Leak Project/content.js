// Example: Add a warning when the user types "credit card"
console.log("Gmail Extension is running!");

document.addEventListener('input', (event) => {
  if (event.target && event.target.tagName === "TEXTAREA") {
    const text = event.target.value.toLowerCase();
    if (text.includes("credit card")) {
      alert("Warning: Do not share your credit card information!");
      event.target.value = text.replace("credit card", "[sensitive data]");
    }
  }
});
