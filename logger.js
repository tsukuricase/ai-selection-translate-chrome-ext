// logger.js

const LOG_LEVELS = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

let LOG_ENV = "prod";
try {
  fetch(chrome.runtime.getURL("config.json"))
    .then((res) => res.json())
    .then((manifest) => {
      if (manifest.aiLoggerEnv) LOG_ENV = manifest.aiLoggerEnv;
    });
} catch (e) {}

// 只在开发输出 debug，生产只留 warn、error
function shouldLog(level) {
  if (LOG_ENV === "dev") return true;
  return LOG_LEVELS[level] >= LOG_LEVELS.warn;
}

// 可选 traceId，适合异步链调试
function formatMsg(level, module, ...msgs) {
  const now = new Date().toISOString();
  let main = `[AI划词翻译][${level.toUpperCase()}][${module}][${now}]`;
  return [main, ...msgs];
}

let logger = {
  debug: (module, ...msgs) =>
    shouldLog("debug") && console.debug(...formatMsg("debug", module, ...msgs)),
  info: (module, ...msgs) =>
    shouldLog("info") && console.info(...formatMsg("info", module, ...msgs)),
  warn: (module, ...msgs) =>
    shouldLog("warn") && console.warn(...formatMsg("warn", module, ...msgs)),
  error: (module, ...msgs) =>
    shouldLog("error") && console.error(...formatMsg("error", module, ...msgs)),
  // 扩展：支持全部日志落本地/远程
  // upload: (logobj) => fetch('https://mylogsrv/upload', { body: JSON.stringify(logobj) }),
};

export default logger;
