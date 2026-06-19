const urlInput = document.getElementById("urlInput");
const checkButton = document.getElementById("checkButton");
const openButton = document.getElementById("openButton");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const message = document.getElementById("message");
const urlList = document.getElementById("urlList");

const STORAGE_KEY = "bulk-url-opener-urls";

function showMessage(text, type = "normal") {
  message.textContent = text;

  if (type === "error") {
    message.style.color = "#dc2626";
  } else if (type === "success") {
    message.style.color = "#15803d";
  } else {
    message.style.color = "#2563eb";
  }
}

function splitLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function normalizeUrl(input) {
  let url = input.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  return url;
}

function isValidHttpUrl(urlText) {
  try {
    const url = new URL(urlText);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getCheckedUrls() {
  const lines = splitLines(urlInput.value);

  const results = lines.map((line) => {
    const normalizedUrl = normalizeUrl(line);
    const isValid = isValidHttpUrl(normalizedUrl);

    return {
      original: line,
      normalized: normalizedUrl,
      isValid: isValid
    };
  });

  return results;
}

function renderUrlList(results) {
  urlList.innerHTML = "";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "URLが入力されていません。";
    li.className = "invalid";
    urlList.appendChild(li);
    return;
  }

  results.forEach((result) => {
    const li = document.createElement("li");

    if (result.isValid) {
      li.textContent = "OK: " + result.normalized;
      li.className = "valid";
    } else {
      li.textContent = "NG: " + result.original;
      li.className = "invalid";
    }

    urlList.appendChild(li);
  });
}

function checkUrls() {
  const results = getCheckedUrls();
  const validCount = results.filter((result) => result.isValid).length;
  const invalidCount = results.length - validCount;

  renderUrlList(results);

  if (results.length === 0) {
    showMessage("URLを入力してください。", "error");
    return;
  }

  if (invalidCount > 0) {
    showMessage(`${validCount}件OK、${invalidCount}件NGです。`, "error");
  } else {
    showMessage(`${validCount}件すべて有効です。`, "success");
  }
}

function openUrls() {
  const results = getCheckedUrls();
  const validUrls = results
    .filter((result) => result.isValid)
    .map((result) => result.normalized);

  renderUrlList(results);

  if (validUrls.length === 0) {
    showMessage("開けるURLがありません。", "error");
    return;
  }

  const maxOpenCount = 10;

  if (validUrls.length > maxOpenCount) {
    const ok = confirm(
      `${validUrls.length}件のURLを開こうとしています。\n` +
      `一度に大量のタブを開くとブラウザにブロックされることがあります。\n\n` +
      `続行しますか？`
    );

    if (!ok) {
      showMessage("一括オープンをキャンセルしました。", "normal");
      return;
    }
  }

  let openedCount = 0;
  let blockedCount = 0;

  validUrls.forEach((url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (newWindow) {
      openedCount++;
    } else {
      blockedCount++;
    }
  });

  if (blockedCount > 0) {
    showMessage(
      `${openedCount}件開きました。${blockedCount}件はブロックされた可能性があります。`,
      "error"
    );
  } else {
    showMessage(`${openedCount}件のURLを開きました。`, "success");
  }
}

function saveUrls() {
  localStorage.setItem(STORAGE_KEY, urlInput.value);
  showMessage("URL一覧を保存しました。", "success");
}

function loadSavedUrls() {
  const savedUrls = localStorage.getItem(STORAGE_KEY);

  if (savedUrls) {
    urlInput.value = savedUrls;
    checkUrls();
    showMessage("保存済みのURL一覧を読み込みました。", "success");
  }
}

function clearUrls() {
  const ok = confirm("入力内容と保存済みデータを削除しますか？");

  if (!ok) {
    return;
  }

  urlInput.value = "";
  localStorage.removeItem(STORAGE_KEY);
  urlList.innerHTML = "";
  showMessage("クリアしました。", "success");
}

checkButton.addEventListener("click", checkUrls);
openButton.addEventListener("click", openUrls);
saveButton.addEventListener("click", saveUrls);
clearButton.addEventListener("click", clearUrls);

loadSavedUrls();
