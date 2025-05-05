console.log("Service Worker started");

// chrome.runtime.onMessage.addListener((message, sender, resp) => {
//   console.log("background", "收到消息", message, sender);
//   if (message.action === "ai_translate") {
//     console.log(
//       "[debug] 收到 ai_translate, key=",
//       message.apiKey,
//       "type=",
//       message.apiType,
//       "text=",
//       message.text
//     );
//     fetchAIResult(message.text, message.apiKey, message.apiType)
//       .then((result) => sendResponse({ result }))
//       .catch((e) => sendResponse({ error: String(e) }));
//     return true; // 异步
//   }
// });

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
            'You are a professional English-to-Japanese translator.Translate the following English sentence into Japanese.Please respond with all of the following:1. The sentence in Japanese (kanji/kana).2. The sentence in hiragana.3. The sentence in katakana.4. The sentence in romaji (Latin alphabet).5. A brief grammatical analysis of the sentence (in English).Format your reply clearly, only in English.Example:Japanese: これはペンです。Hiragana: これはぺんです。Katakana: コレハペンデス。Romaji: Kore wa pen desu.Grammar analysis: "Kore" means "this"; "wa" is the topic particle; "pen" means "pen"; "desu" is the copula.',
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
  console.log("background", "收到消息", message, sender);
  if (message.action === "ai_translate") {
    console.log(
      "[debug] 收到 ai_translate, key=",
      message.apiKey,
      "type=",
      message.apiType,
      "text=",
      message.text
    );
  }
  if (message.action === "ai_translate") {
    fetchAIResult(message.text, message.apiKey, message.apiType)
      .then((result) => sendResponse({ result }))
      .catch((e) => sendResponse({ error: String(e) }));
    return true; // 异步
  }
});
