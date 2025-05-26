chrome.storage.local.get(["totalFlags", "installDate"], (data) => {
  document.getElementById("total").textContent = `Total: ${data.totalFlags || 0}`;
  const date = new Date(data.installDate);
  document.getElementById("since").textContent = `Since: ${date.toLocaleDateString()}`;
});
