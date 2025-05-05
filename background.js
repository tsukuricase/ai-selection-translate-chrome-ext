import logger from "./logger.js";

logger.info("background", "background.js 加载");

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  logger.debug("background", "收到消息", msg, sender);
});

// 带超时的fetch，防止接口长时间无响应
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 15000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

async function fetchAIResult(text, apiKey, apiType) {
  let apiUrl, headers, body;

  if (apiType === "openrouter") {
    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = JSON.stringify({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Translate sentences to Chinese in a fluent and accurate way.",
        },
        { role: "user", content: text },
      ],
    });
  } else if (apiType === "deepseek") {
    apiUrl = "https://api.deepseek.com/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Translate sentences to Chinese in a fluent and accurate way.",
        },
        { role: "user", content: text },
      ],
    });
  } else if (apiType === "qwen") {
    apiUrl =
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = JSON.stringify({
      model: "qwen-turbo",
      input: {
        prompt: `请将下述内容翻译成中文：${text}`,
      },
    });
  } else {
    throw new Error("不支持的API类型");
  }

  let resp;
  try {
    resp = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers,
      body,
      timeout: 15000,
    });
  } catch (e) {
    throw new Error("网络请求超时或失败: " + e.message);
  }

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error("API调用失败: " + txt);
  }

  let data;
  try {
    data = await resp.json();
  } catch (e) {
    throw new Error("API返回结果解析异常: " + e.message);
  }

  if (apiType === "openrouter" || apiType === "deepseek") {
    return data.choices?.[0]?.message?.content || "未获得译文内容";
  } else if (apiType === "qwen") {
    return data.output?.text || data.output || "未获得译文内容";
  } else {
    return JSON.stringify(data);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ai_translate") {
    fetchAIResult(message.text, message.apiKey, message.apiType)
      .then((result) => sendResponse({ result }))
      .catch((e) => sendResponse({ error: String(e) }));
    return true; // 异步
  }
});
