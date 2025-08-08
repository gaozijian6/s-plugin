// 移除import语句，直接嵌入DLX代码
// import { SudokuSolver } from './DLX.ts';

// DLX求解器代码
class DLX {
  constructor() {
    this.maxn = 20010;
    this.L = new Array(this.maxn);
    this.R = new Array(this.maxn);
    this.D = new Array(this.maxn);
    this.U = new Array(this.maxn);
    this.Row = new Array(this.maxn);
    this.C = new Array(this.maxn);
    this.S = new Array(this.maxn);
    this.ans = new Array(this.maxn);
    this.cnt = 0;
    this.mul = 0;
    this.res = Array.from({length: 20}, () => new Array(20));
    this.p = new Array(5010);
  }

  init(m) {
    this.m = m;
    this.mul = 0;
    
    for (let i = 0; i <= m; i++) {
      this.D[i] = this.U[i] = i;
      this.S[i] = 0;
      this.L[i] = i - 1;
      this.R[i] = i + 1;
    }
    
    this.L[0] = m;
    this.R[m] = 0;
    this.id = m + 1;
    this.cnt = this.rowid = 0;
  }

  insert(arr, len) {
    for (let i = 0; i < len; i++, this.id++) {
      const x = arr[i];
      this.C[this.id] = x;
      this.Row[this.id] = this.rowid;
      this.S[x]++;
      this.D[this.id] = x;
      this.U[this.id] = this.U[x];
      this.D[this.U[x]] = this.id;
      this.U[x] = this.id;
      
      if (i === 0) {
        this.L[this.id] = this.R[this.id] = this.id;
      } else {
        this.L[this.id] = this.id - 1;
        this.R[this.id] = this.id - i;
        this.L[this.id - i] = this.id;
        this.R[this.id - 1] = this.id;
      }
    }
    this.rowid++;
  }

  remove(c) {
    this.L[this.R[c]] = this.L[c];
    this.R[this.L[c]] = this.R[c];
    
    for (let i = this.D[c]; i !== c; i = this.D[i]) {
      for (let j = this.R[i]; j !== i; j = this.R[j]) {
        this.S[this.C[j]]--;
        this.U[this.D[j]] = this.U[j];
        this.D[this.U[j]] = this.D[j];
      }
    }
  }

  resume(c) {
    for (let i = this.U[c]; i !== c; i = this.U[i]) {
      for (let j = this.L[i]; j !== i; j = this.L[j]) {
        this.S[this.C[j]]++;
        this.U[this.D[j]] = j;
        this.D[this.U[j]] = j;
      }
    }
    this.L[this.R[c]] = c;
    this.R[this.L[c]] = c;
  }

  dance() {
    if (this.R[0] === 0) {
      if (++this.mul > 1) return true;
      for (let i = 0; i < this.cnt; i++) {
        const plan = this.p[this.ans[i]];
        this.res[plan.i][plan.j] = plan.val;
      }
      return false;
    }

    let c = this.R[0];
    for (let i = this.R[0]; i !== 0; i = this.R[i]) {
      if (this.S[i] < this.S[c]) c = i;
    }

    this.remove(c);
    for (let i = this.D[c]; i !== c; i = this.D[i]) {
      this.ans[this.cnt++] = this.Row[i];
      for (let j = this.R[i]; j !== i; j = this.R[j]) {
        this.remove(this.C[j]);
      }
      if (this.dance()) return true;
      for (let j = this.L[i]; j !== i; j = this.L[j]) {
        this.resume(this.C[j]);
      }
      this.cnt--;
    }
    this.resume(c);
    return false;
  }

  getResult() {
    return this.res;
  }

  getMul() {
    return this.mul;
  }

  setPlan(index, plan) {
    this.p[index] = plan;
  }
}

class SudokuSolver {
  constructor() {
    this.dlx = new DLX();
    this.m = 3;
    this.size = this.m * this.m;
    this.map = Array.from({length: 20}, () => new Array(20).fill(0));
  }

  solve(input) {
    // 将输入字符串转换为二维数组
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const val = input[i * this.size + j];
        this.map[i + 1][j + 1] = parseInt(val);
      }
    }

    const M = this.size;
    this.dlx.init(M * M * 4);
    let idx = 0;
    
    // 构建精确覆盖问题
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= M; j++) {
        if (this.map[i][j] !== 0) {
          // 已填数字只添加一种可能
          const k = this.map[i][j];
          const arr = [
            (i - 1) * M + k,
            M * M + (j - 1) * M + k,
            M * M * 2 + (this.grid(i, j) - 1) * M + k,
            M * M * 3 + (i - 1) * M + j
          ];
          this.dlx.insert(arr, 4);
          this.dlx.setPlan(idx++, {i, j, val: k});
        } else {
          // 空格添加1-9所有可能
          for (let k = 1; k <= M; k++) {
            const arr = [
              (i - 1) * M + k,
              M * M + (j - 1) * M + k,
              M * M * 2 + (this.grid(i, j) - 1) * M + k,
              M * M * 3 + (i - 1) * M + j
            ];
            this.dlx.insert(arr, 4);
            this.dlx.setPlan(idx++, {i, j, val: k});
          }
        }
      }
    }

    // 如果dance()返回true，说明有多个解或无解
    if (this.dlx.dance()) {
      return undefined;
    }

    const result = this.dlx.getResult();
    
    // 检查结果是否有效
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= M; j++) {
        if (!result[i] || !result[i][j]) {
          return undefined;
        }
      }
    }
    
    // 将结果转换为字符串
    let output = '';
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= M; j++) {
        output += result[i][j].toString();
      }
    }
    return output;
  }

  grid(i, j) {
    return Math.floor((i - 1) / this.m) * this.m + Math.floor((j - 1) / this.m) + 1;
  }
}

// 在文件开头添加上下文检查
function checkExtensionContext() {
  if (!chrome.runtime || !chrome.runtime.sendMessage) {
    console.warn('扩展上下文已失效，需要刷新页面');
    return false;
  }
  return true;
}

// 显示消息函数
function showMessage(text, type = 'info') {
  const alertMessage = document.createElement("div");
  alertMessage.textContent = text;
  const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
  alertMessage.style.cssText = `
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    background:${bgColor};
    color:#fff;
    padding:15px 25px;
    border-radius:6px;
    z-index:9999;
    max-width:400px;
    text-align:center;
    font-size:14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(alertMessage);
  setTimeout(() => {
    if (document.body.contains(alertMessage)) {
      document.body.removeChild(alertMessage);
    }
  }, 3000);
}

// 在window.addEventListener("load", () => { 之前添加检查
if (!checkExtensionContext()) {
  console.log('扩展上下文无效，跳过初始化');
  // 可以选择直接返回，不执行后续代码
}

window.addEventListener("load", () => {
  // 获取当前路由
  const fullUrl = window.location.href;

  // 创建固定按钮
  const button1 = document.createElement("button");
  button1.innerHTML = "复制数独";
  button1.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    z-index: 10000;
    width: 200px;
    height: 200px;
  `;

  const button2 = document.createElement("button");
  button2.innerHTML = "复制答案";
  button2.style.cssText = `
  display: none;
  `;
  let date = "";

  // 移除button3的创建和添加
  // const button3 = document.createElement("button");
  // button3.innerHTML = "copy";
  // button3.style.cssText = `
  //   position: fixed;
  //   right: 20px;
  //   top: 40%;
  //   transform: translateY(-50%);
  //   background-color: #1890ff;
  //   color: white;
  //   border: none;
  //   border-radius: 4px;
  //   padding: 10px 20px;
  //   cursor: pointer;
  //   z-index: 10000;
  // `;

  document.body.appendChild(button1);
  document.body.appendChild(button2);
  // document.body.appendChild(button3);

  // 点击按钮时获取并打印数独
  button1.addEventListener("click", () => {
    const iframe = document.querySelector("#f1");
    const iframeDocument = iframe.contentDocument;

    localStorage.clear();

    const table = iframeDocument.querySelector(".sd");
    const tbody = table.firstElementChild;
    const trs = tbody.querySelectorAll("tr");

    let puzzle = "";

    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      tds.forEach((td) => {
        const input = td.querySelector("input");
        if (input.value) {
          puzzle += input.value;
        } else {
          puzzle += "0";
        }
      });
    });
    localStorage.setItem("puzzle", puzzle);

    const Wdate = iframeDocument.querySelector(".Wdate");
    const difficulties = iframeDocument.querySelector(".selected");
    let word = "";
    switch (difficulties.innerHTML) {
      case "入门":
        word = "a";
        break;
      case "初级":
        word = "b";
        break;
      case "中级":
        word = "c";
        break;
      case "高级":
        word = "d";
        break;
      case "骨灰级":
        word = "e";
        break;
    }
    date = Wdate.value;
    date = date.replace("年", "-").replace("月", "-").replace("日", "");
    date += word;

    // 使用DLX求解器计算答案
    const solver = new SudokuSolver();
    const solution = solver.solve(puzzle);
    
    if (solution) {
      localStorage.setItem("solution", solution);
      
      // 直接执行copy按钮的逻辑
      // 根据难度确定目标文件
      let targetFile = "1entry.js";
      let difficultyLevel = "";
      
      if (date) {
        const lastChar = date.slice(-1);
        switch (lastChar) {
          case "a":
            targetFile = "1entry.js";
            difficultyLevel = "入门";
            break;
          case "b":
            targetFile = "2easy.js";
            difficultyLevel = "初级";
            break;
          case "c":
            targetFile = "3medium.js";
            difficultyLevel = "中级";
            break;
          case "d":
            targetFile = "4hard.js";
            difficultyLevel = "高级";
            break;
          case "e":
            targetFile = "5extreme.js";
            difficultyLevel = "骨灰级";
            break;
        }
      }
      
      // 检查扩展上下文是否有效
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        showMessage('扩展上下文已失效，请刷新页面', 'error');
        return;
      }
      
      // 发送数据到background进行文件追加
      chrome.runtime.sendMessage({
        action: 'appendToFile',
        data: {
          puzzle: puzzle,
          solution: solution,
          date: date,
          targetFile: targetFile,
          difficulty: difficultyLevel
        }
      }, (response) => {
        // 检查是否有运行时错误
        if (chrome.runtime.lastError) {
          console.error('消息发送失败:', chrome.runtime.lastError);
          
          // 如果是上下文失效错误，提示用户刷新
          if (chrome.runtime.lastError.message.includes('context invalidated') || 
              chrome.runtime.lastError.message.includes('Extension context')) {
            showMessage('扩展已更新，请刷新页面后重试', 'error');
          } else {
            showMessage('操作失败: ' + chrome.runtime.lastError.message, 'error');
          }
          return;
        }
        
        // 检查响应是否存在
        if (!response) {
          showMessage('扩展通信失败，请刷新页面后重试', 'error');
          return;
        }
        
        if (response.success) {
          showMessage(`${date}`, 'success');
        } else {
          showMessage('文件操作失败: ' + response.error, 'error');
        }
      });
      
      // 复制到剪贴板
      const textToCopy = `{
      puzzle: '${puzzle}',
      solution: '${solution}',
      date:'${date}',
    },`;
      
      navigator.clipboard.writeText(textToCopy);
      
      // 聚焦到日期输入框
      const input = iframeDocument.querySelector(".Wdate");
      if (input) {
        input.focus();
      }
      
    } else {
      showMessage('无法求解该数独，请检查输入', 'error');
    }
  });

  button2.addEventListener("click", () => {
    const iframe = document.querySelector("#f1");
    const iframeDocument = iframe.contentDocument;
    const td = iframeDocument.querySelector(".board");
    const tbody = td.querySelector("tbody");
    const blocks = tbody.querySelectorAll(".block");
    const boxes = ["", "", "", "", "", "", "", "", ""];
    blocks.forEach((block, index) => {
      const textareas = block.querySelectorAll("textarea");
      textareas.forEach((textarea) => {
        boxes[index] += textarea.value;
      });
    });
    const box1s = [boxes[0], boxes[1], boxes[2]];
    const box2s = [boxes[3], boxes[4], boxes[5]];
    const box3s = [boxes[6], boxes[7], boxes[8]];
    let row1 = "";
    let row2 = "";
    let row3 = "";
    let row4 = "";
    let row5 = "";
    let row6 = "";
    let row7 = "";
    let row8 = "";
    let row9 = "";
    for (let i = 0; i < 3; i++) {
      for (let box of box1s) {
        if (i == 0) {
          row1 += box.substring(i * 3, (i + 1) * 3);
        } else if (i == 1) {
          row2 += box.substring(i * 3, (i + 1) * 3);
        } else {
          row3 += box.substring(i * 3, (i + 1) * 3);
        }
      }
      for (let box of box2s) {
        if (i == 0) {
          row4 += box.substring(i * 3, (i + 1) * 3);
        } else if (i == 1) {
          row5 += box.substring(i * 3, (i + 1) * 3);
        } else {
          row6 += box.substring(i * 3, (i + 1) * 3);
        }
      }
      for (let box of box3s) {
        if (i == 0) {
          row7 += box.substring(i * 3, (i + 1) * 3);
        } else if (i == 1) {
          row8 += box.substring(i * 3, (i + 1) * 3);
        } else {
          row9 += box.substring(i * 3, (i + 1) * 3);
        }
      }
    }
    let solution = row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9;
    localStorage.setItem("solution", solution);

    // 通过background script追加数据到1entry.js文件
    const puzzle = localStorage.getItem("puzzle");
    if (puzzle && solution && date) {
      chrome.runtime.sendMessage({
        action: 'appendToFile',
        data: {
          puzzle: puzzle,
          solution: solution,
          date: date
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('消息发送失败:', chrome.runtime.lastError);
          showMessage('操作失败: ' + chrome.runtime.lastError.message, 'error');
        } else if (response.success) {
          showMessage(response.message, 'success');
        } else {
          showMessage('文件操作失败: ' + response.error, 'error');
        }
      });
    }

    setTimeout(() => {
      window.close();
    }, 10);
  });

  // 移除自动跳转逻辑
  // if (fullUrl.includes("answer")) {
  //   setTimeout(() => {
  //     button2.click();
  //   }, 0);
  // }

  // 移除button3的事件监听器
  // button3.addEventListener("click", () => { ... });
});
