// background.js - Chrome扩展后台脚本，处理文件读写操作

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'appendToFile') {
      handleFileAppend(request.data)
        .then(result => sendResponse({success: true, message: result}))
        .catch(error => sendResponse({success: false, error: error.message}));
      return true; // 保持消息通道开放，允许异步响应
    }
  });
  
  // 处理文件追加操作
  async function handleFileAppend(data) {
    try {
      // 调用本地Node.js服务器
      const response = await fetch('http://localhost:3000/append-sudoku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puzzle: data.puzzle,
          solution: data.solution,
          date: data.date,
          targetFile: data.targetFile,
          difficulty: data.difficulty
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.message;
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('服务器通信失败:', error);
      
      // 如果服务器不可用，使用备选方案
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        return await fallbackDownload(data);
      }
      
      throw error;
    }
  }
  
  // 备选方案：生成下载文件
  async function fallbackDownload(data) {
    const newEntry = `  {
    puzzle: '${data.puzzle}',
    solution: '${data.solution}',
    date: '${data.date}',
  },`;
    
    // 使用data URL代替URL.createObjectURL
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(newEntry);
    
    // 使用Chrome的下载API
    await chrome.downloads.download({
      url: dataUrl,
      filename: 'new_sudoku_entry.txt',
      saveAs: true
    });
    
    return '服务器不可用，新条目已下载为文件，请手动添加到1entry.js中';
  }