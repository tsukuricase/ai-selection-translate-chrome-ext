import logger from "./logger.js";

logger.debug("content", "内容脚本已注入", { url: location.href });

let selectedText = "";
let popover = null;

function isInputOrEditable(el) {
  return el.isContentEditable || ["INPUT", "TEXTAREA"].includes(el.tagName);
}

document.addEventListener("mouseup", function (e) {
  logger.info("content", "mouseup事件触发", { selectedText, e });
  if (isInputOrEditable(e.target)) return;
  selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    showPopover(e.pageX, e.pageY, "正在翻译...");
    chrome.storage.sync.get(["apiKey", "apiType"], (data) => {
      translateWithAI(selectedText, data.apiKey, data.apiType);
    });
  } else {
    removePopover();
  }
});

function showPopover(x, y, text) {
  removePopover();
  popover = document.createElement("div");
  popover.id = "ai-translate-popover";
  popover.style.cssText = `
    position: absolute; left: ${x}px; top: ${y}px; z-index: 2147483647; background: #fff; border:1px solid #888;
    padding:8px 14px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.18); max-width:320px; font-size:15px;
    line-height:1.6; word-break:break-word;
  `;
  popover.innerHTML = `<span>${text}</span>
    <button id="closePopover" style="float:right;border:none;background:transparent;cursor:pointer;font-size:16px;">✖</button>`;
  document.body.appendChild(popover);
  document.getElementById("closePopover").onclick = removePopover;
  // 防溢出
  setTimeout(() => {
    const rect = popover.getBoundingClientRect();
    let nx = x,
      ny = y;
    if (rect.right > window.innerWidth)
      nx -= rect.right - window.innerWidth + 10;
    if (rect.bottom > window.innerHeight)
      ny -= rect.bottom - window.innerHeight + 10;
    popover.style.left = nx + "px";
    popover.style.top = ny + "px";
  }, 20);
}

function removePopover() {
  if (popover) {
    popover.remove();
    popover = null;
  }
}

function translateWithAI(text, apiKey, apiType) {
  if (!apiKey || !apiType) {
    if (popover)
      popover.querySelector("span").innerText = "请先在插件设置API KEY";
    return;
  }
  if (popover) popover.querySelector("span").innerText = "正在翻译...";
  chrome.runtime.sendMessage(
    { action: "ai_translate", text, apiKey, apiType },
    (response) => {
      if (!popover) return;
      if (chrome.runtime.lastError)
        popover.querySelector("span").innerText =
          "通信失败: " + chrome.runtime.lastError.message;
      else if (response && response.result)
        popover.querySelector("span").innerText = response.result;
      else
        popover.querySelector("span").innerText = response?.error || "翻译失败";
    }
  );
}

// 支持点击外部或ESC关闭
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") removePopover();
});
document.addEventListener("mousedown", function (e) {
  if (popover && !popover.contains(e.target)) removePopover();
});
