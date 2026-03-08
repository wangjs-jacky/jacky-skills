#!/usr/bin/env node

/**
 * Bilibili Batch - B 站视频批量提取工具
 *
 * 用法：
 *   bilibili-batch top <UP主空间URL> [options]
 *   bilibili-batch file <URL列表文件> [options]
 *   bilibili-batch from-json <JSON数据文件> [options]
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 默认配置
const DEFAULT_CONFIG = {
  obsidianPath: '/Users/jiashengwang/jacky-github/jacky-obsidian',
  outputDir: '00-Inbox/B站',
  limit: 10,
  sort: 'play',
  format: 'detailed',
  model: 'base'
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    command: null,
    url: null,
    options: { ...DEFAULT_CONFIG }
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === 'top' || arg === 'file' || arg === 'from-json') {
      result.command = arg;
    } else if (arg === '--limit' || arg === '-l') {
      result.options.limit = parseInt(args[++i], 10);
    } else if (arg === '--sort' || arg === '-s') {
      result.options.sort = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      result.options.output = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      result.options.format = args[++i];
    } else if (arg === '--model' || arg === '-m') {
      result.options.model = args[++i];
    } else if (arg === '--dry-run') {
      result.options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-') && !result.url) {
      result.url = arg;
    }
    i++;
  }

  return result;
}

function printHelp() {
  console.log(`
Bilibili Batch - B 站视频批量提取工具

用法：
  bilibili-batch top <UP主空间URL> [options]
  bilibili-batch file <URL列表文件> [options]
  bilibili-batch from-json <JSON文件> [options]

命令：
  top        提取 UP 主 Top N 视频（需要浏览器支持）
  file       批量处理 URL 列表文件
  from-json  从 JSON 文件读取视频列表

选项：
  -l, --limit <n>      提取数量（默认：10）
  -s, --sort <type>    排序方式：play/favorite/date（默认：play）
  -o, --output <dir>   输出目录
  -f, --format <type>  笔记格式：simple/detailed（默认：detailed）
  -m, --model <model>  Whisper 模型（默认：base）
  --dry-run            只显示视频列表，不提取
  -h, --help           显示帮助信息

示例：
  # 从 URL 列表文件提取
  bilibili-batch file /tmp/urls.txt

  # 从 JSON 数据文件提取
  bilibili-batch from-json /tmp/videos.json --limit 5

  # 指定输出目录
  bilibili-batch file urls.txt -o /path/to/obsidian/00-Inbox/B站
`);
}

// 从文件读取 URL 列表
async function readUrlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && trimmed.includes('bilibili.com');
  });

  return lines.map(url => {
    const match = url.match(/BV[\w]+/);
    return {
      id: match ? match[0] : 'unknown',
      url: url.trim()
    };
  });
}

// 从 JSON 文件读取视频列表
async function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  // 支持多种 JSON 格式
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id || item.bvid || item.url?.match(/BV[\w]+/)?.[0] || 'unknown',
      title: item.title || '未知标题',
      viewCount: item.viewCount || item.play || item.view || 0,
      uploader: item.uploader || item.author || '未知作者',
      duration: item.duration || '未知',
      url: item.url || `https://www.bilibili.com/video/${item.id || item.bvid}`
    }));
  }

  return [];
}

// 获取视频详细信息
async function getVideoInfo(bvId) {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;

  try {
    const data = await fetchJson(url);
    if (data.code === 0) {
      return {
        id: bvId,
        title: data.data.title,
        viewCount: data.data.stat.view,
        uploader: data.data.owner.name,
        duration: formatDuration(data.data.duration),
        url: `https://www.bilibili.com/video/${bvId}`
      };
    }
  } catch (e) {
    // 忽略错误
  }

  return {
    id: bvId,
    url: `https://www.bilibili.com/video/${bvId}`
  };
}

// 格式化时长
function formatDuration(seconds) {
  if (typeof seconds === 'string') return seconds;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 获取 JSON 数据
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 批量提取字幕
async function batchExtract(videos, outputDir, model = 'base') {
  console.log(`\n开始批量提取 ${videos.length} 个视频...`);

  // 创建临时 URL 文件
  const tmpFile = '/tmp/bilibili-batch-urls.txt';
  const urls = videos.map(v => v.url).join('\n');
  fs.writeFileSync(tmpFile, urls);

  // 创建输出目录
  const extractDir = '/tmp/bilibili-batch-output';
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }

  // 使用 video2text 批量提取
  try {
    execSync(
      `video2text extract --file ${tmpFile} -f md -m ${model} -o ${extractDir}`,
      { stdio: 'inherit' }
    );
    return extractDir;
  } catch (error) {
    console.error('批量提取失败:', error.message);
    return null;
  }
}

// 生成 Obsidian 笔记
function generateObsidianNotes(videos, extractDir, outputDir, format = 'detailed') {
  console.log('\n生成 Obsidian 笔记...');

  // 获取作者名（从第一个视频）
  const author = videos[0]?.uploader || '未知作者';
  const authorDir = path.join(outputDir, author.replace(/[\/\\?%*:|"<>]/g, '_'));

  if (!fs.existsSync(authorDir)) {
    fs.mkdirSync(authorDir, { recursive: true });
  }

  // 遍历提取的文件
  if (!fs.existsSync(extractDir)) {
    console.error('提取目录不存在:', extractDir);
    return 0;
  }

  const extractedDirs = fs.readdirSync(extractDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let successCount = 0;

  for (const bvId of extractedDirs) {
    const videoDir = path.join(extractDir, bvId);
    const files = fs.readdirSync(videoDir);
    const mdFile = files.find(f => f.endsWith('.md'));

    if (!mdFile) continue;

    const video = videos.find(v => v.id === bvId || v.url.includes(bvId));
    const title = video?.title || mdFile.replace('.md', '');
    const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '_');

    // 读取原始字幕
    const rawContent = fs.readFileSync(path.join(videoDir, mdFile), 'utf-8');

    // 生成笔记
    const noteContent = formatNoteContent(title, video, rawContent);
    const notePath = path.join(authorDir, `${safeTitle}.md`);
    fs.writeFileSync(notePath, noteContent);

    console.log(`  ✓ ${title}`);
    successCount++;
  }

  console.log(`\n完成！成功生成 ${successCount} 个笔记`);
  console.log(`输出目录: ${authorDir}`);

  return successCount;
}

// 格式化笔记内容
function formatNoteContent(title, video, rawContent) {
  const today = new Date().toISOString().split('T')[0];
  const author = video?.uploader || '未知作者';
  const bvId = video?.id || '';
  const duration = video?.duration || '未知';
  const viewCount = video?.viewCount || 0;

  // 格式化播放量
  const viewStr = viewCount >= 10000
    ? `${(viewCount / 10000).toFixed(1)}万`
    : viewCount.toString();

  return `# ${title}

> **作者**: ${author}
> **来源**: https://www.bilibili.com/video/${bvId}
> **提取时间**: ${today}
> **视频时长**: ${duration}
> **播放量**: ${viewStr}

## 视频嵌入

<iframe src="//player.bilibili.com/player.html?bvid=${bvId}&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="500"> </iframe>

> [!quote] 📺 B 站视频 - ${title}
> 🔗 [点击观看](https://www.bilibili.com/video/${bvId})

---

${rawContent}

---
#B站 #${author.replace(/\s/g, '')} #视频笔记
`;
}

// 主函数
async function main() {
  const { command, url, options } = parseArgs();

  if (!command) {
    printHelp();
    process.exit(1);
  }

  if (!url) {
    console.error('错误：请提供 URL、文件路径或 JSON 数据');
    process.exit(1);
  }

  let videos = [];

  if (command === 'file') {
    videos = await readUrlFile(url);
    console.log(`\n从文件读取到 ${videos.length} 个 URL`);

    // 尝试获取视频详细信息
    console.log('正在获取视频详细信息...');
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (v.id && v.id !== 'unknown') {
        const info = await getVideoInfo(v.id);
        videos[i] = { ...info, ...v };
        console.log(`  ${i + 1}/${videos.length} ${info.title || v.id}`);
      }
    }

  } else if (command === 'from-json') {
    videos = await readJsonFile(url);
    console.log(`\n从 JSON 文件读取到 ${videos.length} 个视频`);

  } else if (command === 'top') {
    console.log('\n提示: "top" 命令需要浏览器自动化支持');
    console.log('建议: 使用 Claude Code 的浏览器功能获取视频列表，然后保存为 JSON 文件');
    console.log('或者: 使用 "file" 命令处理 URL 列表文件\n');
    process.exit(1);
  }

  // 应用 limit
  if (options.limit && videos.length > options.limit) {
    videos = videos.slice(0, options.limit);
  }

  // 显示视频列表
  console.log('\n视频列表:');
  videos.forEach((v, i) => {
    const viewStr = v.viewCount >= 10000
      ? `${(v.viewCount / 10000).toFixed(1)}万`
      : (v.viewCount || '未知');
    console.log(`  ${i + 1}. [${viewStr}播放] ${v.title || v.id}`);
  });

  if (options.dryRun) {
    console.log('\n[Dry Run] 只显示列表，不提取');
    return;
  }

  if (videos.length === 0) {
    console.error('没有找到视频');
    process.exit(1);
  }

  // 确定输出目录
  const outputDir = options.output ||
    path.join(DEFAULT_CONFIG.obsidianPath, DEFAULT_CONFIG.outputDir);

  // 批量提取
  const extractDir = await batchExtract(videos, outputDir, options.model);

  if (extractDir) {
    // 生成 Obsidian 笔记
    generateObsidianNotes(videos, extractDir, outputDir, options.format);
  }
}

main().catch(console.error);
