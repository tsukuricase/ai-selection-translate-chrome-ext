// options.js

const apiTypeDescMap = {
    openrouter: "OpenRouter 可接多种开源/商业大模型，需注册获取 key。",
    deepseek: "DeepSeek 原生API，需在 DeepSeek 平台获取 key。",
    qwen: "Qwen（阿里千问），需 DashScope 账号-控制台获取 key。"
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const apiTypeSelect = document.getElementById('apiType');
    const apiTypeDesc = document.getElementById('apiTypeDesc');
    const showPassBtn = document.getElementById('showPassBtn');
    const statusSpan = document.getElementById('status');
    const saveBtn = document.getElementById('saveBtn');
    const apiForm = document.getElementById('apiForm');
  
    // 1. 读取 storage，填充
    chrome.storage.sync.get(['apiKey', 'apiType'], (data) => {
      apiKeyInput.value = data.apiKey || '';
      apiTypeSelect.value = data.apiType || 'openrouter';
      apiTypeDesc.innerText = apiTypeDescMap[apiTypeSelect.value] || '';
    });
  
    // 2. API类型变更
    apiTypeSelect.onchange = (e) => {
      apiTypeDesc.innerText = apiTypeDescMap[e.target.value] || '';
    };
  
    // 3. 密码显隐
    showPassBtn.onclick = () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        showPassBtn.innerText = '🙈';
      } else {
        apiKeyInput.type = 'password';
        showPassBtn.innerText = '👁️';
      }
    };
  
    // 4. 表单保存
    apiForm.onsubmit = function (e) {
      e.preventDefault();
      const apiKey = apiKeyInput.value.trim();
      const apiType = apiTypeSelect.value;
  
      if (!apiKey) {
        statusSpan.innerText = '请填写API Key';
        statusSpan.style.color = "#b55";
        return;
      }
  
      saveBtn.disabled = true;
      chrome.storage.sync.set({ apiKey, apiType }, () => {
        statusSpan.innerText = '已保存!';
        statusSpan.style.color = "#21b55b";
        setTimeout(() => {
          statusSpan.innerText = '';
          saveBtn.disabled = false;
        }, 1200);
      });
    };
  });
  