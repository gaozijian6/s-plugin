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
  `;

  const button2 = document.createElement("button");
  button2.innerHTML = "复制答案";
  button2.style.cssText = `
    position: fixed;
    right: 20px;
    top: 55%;  // button2位置在button1下方
    transform: translateY(-50%);
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
  `;
  let date = "";

  const button3 = document.createElement("button");
  button3.innerHTML = "copy";
  button3.style.cssText = `
    position: fixed;
    right: 20px;
    top: 40%;  // button3位置在button2下方
    transform: translateY(-50%);
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
  `;

  document.body.appendChild(button1);
  document.body.appendChild(button2);
  document.body.appendChild(button3);
  
  // 点击按钮时获取并打印数独
  button1.addEventListener("click", () => {
    localStorage.clear();
    const iframe = document.querySelector("#f1");
    const iframeDocument = iframe.contentDocument;
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
    date = Wdate.value;
    date = date.replace("年", "-").replace("月", "-").replace("日", "");
    date += "a";

    const answerButton = iframeDocument.querySelector('[value="答案"]');
    answerButton?.click();
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

    setTimeout(() => {
      window.close();
    }, 10);
  });
  if (fullUrl.includes("answer")) {
    setTimeout(() => {
      button2.click();
    }, 0);
  }

  button3.addEventListener("click", () => {
    const textToCopy = `{
      puzzle: '${localStorage.getItem("puzzle")}',
      solution: '${localStorage.getItem("solution")}',
      date:'${date}',
    },`;
    navigator.clipboard.writeText(textToCopy);
    const alertMessage = document.createElement('div');
    alertMessage.textContent = '复制成功';
    alertMessage.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:10px 20px;border-radius:4px;z-index:9999';
    document.body.appendChild(alertMessage);
    setTimeout(() => {
      document.body.removeChild(alertMessage);
    }, 500);
  });
});