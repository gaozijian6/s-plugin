const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 文件映射
const FILE_MAP = {
  '1entry.js': '入门',
  '2easy.js': '初级', 
  '3medium.js': '中级',
  '4hard.js': '高级',
  '5extreme.js': '骨灰级'
};

// 用于检测重复的变量
let lastPuzzle = '';
let currentPuzzle = '';

// 追加数据到指定文件的API
app.post('/append-sudoku', async (req, res) => {
  try {
    const { puzzle, solution, date, targetFile, difficulty } = req.body;
    
    if (!puzzle || !solution || !date || !targetFile) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必需的参数: puzzle, solution, date, targetFile' 
      });
    }
    
    // 检测重复puzzle
    currentPuzzle = puzzle;
    if (currentPuzzle === lastPuzzle && lastPuzzle !== '') {
      return res.status(400).json({
        success: false,
        error: '检测到重复的puzzle，请勿重复提交相同的数独题目'
      });
    }
    
    // 验证目标文件是否有效
    if (!FILE_MAP[targetFile]) {
      return res.status(400).json({
        success: false,
        error: `无效的目标文件: ${targetFile}`
      });
    }
    
    // 目标文件路径
    const filePath = path.join(__dirname, targetFile);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: `文件不存在: ${targetFile}`
      });
    }
    
    // 读取现有文件内容
    let content = await fs.readFile(filePath, 'utf8');
    
    // 找到数组结束位置（最后一个 ]; ）
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex === -1) {
      return res.status(400).json({
        success: false,
        error: `无法找到数组结束标记 ]; 请确保 ${targetFile} 格式正确`
      });
    }
    
    // 构建新的条目
    const newEntry = `  {
    puzzle: '${puzzle}',
    solution: '${solution}',
    date: '${date}',
  },`;
    
    // 在数组结束前插入新条目
    const beforeBracket = content.substring(0, lastBracketIndex);
    const afterBracket = content.substring(lastBracketIndex);
    const newContent = beforeBracket + newEntry + '\n' + afterBracket;
    
    // 写入文件
    await fs.writeFile(filePath, newContent, 'utf8');
    
    // 更新lastPuzzle为当前puzzle
    lastPuzzle = currentPuzzle;
    
    // 截取前10位数字用于日志显示
    const puzzlePreview = puzzle.substring(0, 10) + '...';
    const solutionPreview = solution.substring(0, 10) + '...';

    console.log(`成功追加${difficulty}数据到${targetFile}:`);
    console.log(`  日期: ${date}`);
    console.log(`  题目: ${puzzlePreview}`);
    console.log(`  答案: ${solutionPreview}`);
    
    res.json({ 
      success: true, 
      message: `${difficulty}数据已成功追加到${targetFile}文件！`,
      targetFile: targetFile,
      difficulty: difficulty,
      date: date
    });
    
  } catch (error) {
    console.error('文件操作失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 获取所有文件状态的API
app.get('/files-status', async (req, res) => {
  try {
    const status = {};
    
    for (const [filename, difficulty] of Object.entries(FILE_MAP)) {
      const filePath = path.join(__dirname, filename);
      try {
        const stats = await fs.stat(filePath);
        status[filename] = {
          exists: true,
          difficulty: difficulty,
          size: stats.size,
          modified: stats.mtime
        };
      } catch (error) {
        status[filename] = {
          exists: false,
          difficulty: difficulty,
          error: error.message
        };
      }
    }
    
    res.json({ success: true, files: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '数独服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`数独服务器已启动，监听端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`文件状态: http://localhost:${PORT}/files-status`);
}); 