window.addEventListener("load", () => {
  // 创建固定按钮
  const button1 = document.createElement('button');
  button1.innerHTML = '打印数独';
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

  const button2 = document.createElement('button');
  button2.innerHTML = '按钮2';
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
  
  document.body.appendChild(button1);
  document.body.appendChild(button2);
  // 点击按钮时获取并打印数独
  button1.addEventListener('click', () => {
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
        if(input.value) {
          puzzle += input.value;
        } else {
          puzzle += "0";
        }
      });
    });
    
    console.log(puzzle);
  });

  button2.addEventListener('click', () => {
    const iframe = document.querySelector("#f1");
    const iframeDocument = iframe.contentDocument;
    const td = iframeDocument.querySelector(".board");
    const tbody = td.querySelector("tbody");
    const tds = tbody.querySelectorAll(".block");
    let solution = "";
    tds.forEach((td) => {
        console.log(td);
    });
    console.log(solution);
  });
});

