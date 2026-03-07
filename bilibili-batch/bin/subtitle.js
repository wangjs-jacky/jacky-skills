#!/usr/bin/env node

/**
 * Video Subtitle Extractor - 视频字幕提取工具
 *
 * 支持平台：
 * - Bilibili（B站）：优先使用原生字幕， * - YouTube：使用 yt-dlp 下载字幕
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============== 配置 ==============
const CONFIG = {
  obsidianPath: '/Users/jiashengwang/jacky-github/jacky-obsidian',
  outputDir: '00-Inbox/视频笔记'
};

// ============== 工具函数 ==============
function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON 解析失败: ${data.slice(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(count) {
  if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`;
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  return count.toString();
}

function parseVtt(content) {
  const lines = content.split('\n');
  const result = [];
  let currentTime = 0;
  let currentText = '';

  for (const line of lines) {
    const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (timeMatch) {
      if (currentText) {
        result.push({ from: currentTime, content: currentText.trim() });
      }
      currentTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
      currentText = '';
    } else if (line.trim() && !line.includes('WEBVTT') && !line.includes('Kind:') && !line.includes('Language:')) {
      currentText += ' ' + line.trim();
    }
  }

  if (currentText) {
    result.push({ from: currentTime, content: currentText.trim() });
  }

  return result;
}

function parseSrt(content) {
  const blocks = content.split('\n\n');
  const result = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timeMatch) continue;

    const from = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]);
    const text = lines.slice(2).join(' ').trim();

    if (text) {
      result.push({ from, content: text });
    }
  }

  return result;
}

// ============== Bilibili 提取器 ==============
const BilibiliExtractor = {
  isMatch(url) {
    return /bilibili\.com\/video\//.test(url);
  },

  getBvid(url) {
    const match = url.match(/BV[\w]+/);
    return match ? match[0] : null;
  },

  async getVideoInfo(bvid) {
    const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const data = await fetchJson(url, { Referer: 'https://www.bilibili.com' });

    if (data.code !== 0) {
      throw new Error(data.message || '获取视频信息失败');
    }

    const info = data.data;
    return {
      bvid: info.bvid,
      title: info.title,
      author: info.owner.name,
      duration: info.duration,
      viewCount: info.stat.view,
      cid: info.cid
    };
  },

  async getSubtitles(bvid, cid) {
    const url = `https://api.bilibili.com/x/player/v2?bvid=${bvid}&cid=${cid}`;
    const data = await fetchJson(url, { Referer: 'https://www.bilibili.com' });

    if (data.code !== 0) {
      throw new Error(data.message || '获取字幕列表失败');
    }

    return data.data.subtitle?.subtitles || [];
  },

  async downloadSubtitle(subtitleUrl) {
    const url = subtitleUrl.startsWith('//')
      ? `https:${subtitleUrl}`
      : subtitleUrl;
    const data = await fetchJson(url);
    return data.body || [];
  },

  async extract(url) {
    const bvid = this.getBvid(url);
    if (!bvid) {
      throw new Error('无法从 URL 中提取 BV 号');
    }

    console.log('  获取视频信息...');
    const info = await this.getVideoInfo(bvid);

    console.log('  检查字幕可用性...');
    const subtitles = await this.getSubtitles(bvid, info.cid);

    if (!subtitles || subtitles.length === 0) {
      return { success: false, reason: 'no_subtitle', info };
    }

    // 优先选择 AI 中文字幕
    const zhSubtitle = subtitles.find(s => s.lan === 'ai-zh')
      || subtitles.find(s => s.lan === 'zh-CN')
      || subtitles.find(s => s.lan.startsWith('zh'))
      || subtitles[0];

    console.log(`  找到字幕: ${zhSubtitle.lan_doc} (${zhSubtitle.lan})`);

    const subtitleBody = await this.downloadSubtitle(zhSubtitle.subtitle_url);

    return {
      success: true,
      info: {
        id: bvid,
        title: info.title,
        author: info.author,
        duration: info.duration,
        viewCount: info.viewCount
      },
      subtitle: subtitleBody
    };
  }
};

// ============== YouTube 提取器 ==============
const YouTubeExtractor = {
  isMatch(url) {
    return /youtube\.com|youtu\.be/.test(url);
  },

  getVideoId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] || match[2] : null;
  },

  async extract(url) {
    const videoId = this.getVideoId(url);
    if (!videoId) {
      throw new Error('无法从 URL 中提取视频 ID');
    }

    console.log('  获取视频信息...');

    const infoJson = execSync(
      `yt-dlp --print "%(id)s|%(title)s|%(uploader)s|%(duration_string)s|%(view_count)s" "${url}"`,
      { encoding: 'utf-8' }
    );

    const [id, title, author, duration, viewCount] = infoJson.split('|').map(s => s.trim());

    console.log('  检查字幕可用性...');

    const tmpDir = `/tmp/yt-subtitle-${videoId}`;
    try {
      execSync(
        `yt-dlp --write-auto-sub --skip-download --sub-lang "zh-Hans,zh-CN,zh,en" -o "${tmpDir}" "${url}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'ignore'] }
      );
    } catch (e) {
      // 忽略错误
    }

    // 检查是否有字幕文件
    if (!fs.existsSync(tmpDir)) {
      return { success: false, reason: 'no_subtitle', info: { title, author, duration, viewCount } };
    }

    const files = fs.readdirSync(tmpDir).filter(f => f.endsWith('.vtt') || f.endsWith('.srt'));
    if (files.length === 0) {
      return { success: false, reason: 'no_subtitle', info: { title, author, duration, viewCount } };
    }

    const subtitleFile = path.join(tmpDir, files[0]);
    const subtitleContent = fs.readFileSync(subtitleFile, 'utf-8');

    const subtitle = parseVtt(subtitleContent);

    // 清理临时文件
    fs.rmSync(tmpDir, { recursive: true });

    return {
      success: true,
      info: {
        id: videoId,
        title,
        author,
        duration,
        viewCount: parseInt(viewCount) || 0
      },
      subtitle
    };
  }
};

// ============== 笔记生成 ==============
function generateMarkdown(result, outputPath) {
  const { info, subtitle } = result;
  const today = new Date().toISOString().split('T')[0];

  const content = subtitle.map(item => {
    return `- **${formatTime(item.from)}** ${item.content}`;
  }).join('\n');

  const isBilibili = info.id.startsWith('BV');
  const sourceUrl = isBilibili
    ? `https://www.bilibili.com/video/${info.id}`
    : `https://www.youtube.com/watch?v=${info.id}`;

  const embedCode = isBilibili
    ? `<iframe src="//player.bilibili.com/player.html?bvid=${info.id}&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="500"> </iframe>`
    : `<iframe src="https://www.youtube.com/embed/${info.id}" width="100%" height="500" frameborder="0" allowfullscreen="true"> </iframe>`;

  const markdown = `# ${info.title}

> **作者**: ${info.author}
> **来源**: ${sourceUrl}
> **提取时间**: ${today}
> **视频时长**: ${typeof info.duration === 'number' ? formatTime(info.duration) : info.duration}
> **播放量**: ${formatViewCount(info.viewCount)}

## 视频嵌入

${embedCode}

---

## 完整文案（带时间戳）
${content}

---
#视频笔记 #${info.author.replace(/\s/g, '')}
`;

  fs.writeFileSync(outputPath, markdown);
}

// ============== 主逻辑 ==============
async function extractSubtitle(url, options = {}) {
  console.log(`\n提取: ${url}`);

  let result;

  if (BilibiliExtractor.isMatch(url)) {
    result = await BilibiliExtractor.extract(url);
  } else if (YouTubeExtractor.isMatch(url)) {
    result = await YouTubeExtractor.extract(url);
  } else {
    console.error('  不支持的平台:', url);
    return null;
  }

  if (!result.success && result.reason === 'no_subtitle') {
    console.log('  该视频无原生字幕');
    console.log('  提示: 使用 video2text --fallback 可启用 Whisper 提取');
    return result;
  }

  return result;
}

// ============== CLI 入口 ==============
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Video Subtitle Extractor - 视频字幕提取工具

用法:
  subtitle extract <URL> [options]
  subtitle batch <URL列表文件> [options]

支持平台:
  - Bilibili（B站）
  - YouTube

选项:
  -o, --output <dir>   输出目录
  --dry-run            只检查字幕可用性， 不下载
`);
    process.exit(1);
  }

  const command = args[0];
  const target = args[1];
  const options = {};

  // 解析选项
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
    options.output = args[++i];
    } else if (args[i] === '--dry-run') {
    options.dryRun = true;
    }
  }

  if (command === 'extract') {
    const result = await extractSubtitle(target, options);

    if (!result || !result.success) {
      console.log('\n提取失败');
      process.exit(1);
    }

    console.log(`\n✓ 揑取成功!`);
    console.log(`  标题: ${result.info.title}`);
    console.log(`  作者: ${result.info.author}`);
    console.log(`  字幕条数: ${result.subtitle.length}`);

    if (!options.dryRun && options.output) {
      const safeTitle = result.info.title.replace(/[\/\\?%*:|"<>]/g, '_');
      const outputPath = path.join(options.output, `${safeTitle}.md`);
      generateMarkdown(result, outputPath);
      console.log(`  已保存: ${outputPath}`);
    }
  } else if (command === 'batch') {
    const urls = fs.readFileSync(target, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    console.log(`\n批量处理 ${urls.length} 个视频`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < urls.length; i++) {
      console.log(`\n[${i + 1}/${urls.length}]`);
      const result = await extractSubtitle(urls[i], options);

      if (result && result.success) {
        success++;
        if (!options.dryRun && options.output) {
          const safeTitle = result.info.title.replace(/[\/\\?%*:|"<>]/g, '_');
          const authorDir = path.join(options.output, result.info.author.replace(/[\/\\?%*:|"<>]/g, '_'));
          if (!fs.existsSync(authorDir)) {
            fs.mkdirSync(authorDir, { recursive: true });
          }
          const outputPath = path.join(authorDir, `${safeTitle}.md`);
          generateMarkdown(result, outputPath);
          console.log(`  ✓ 已保存: ${outputPath}`);
        }
      } else {
        failed++;
      }
    }

    console.log(`\n完成! 成功: ${success}, 失败: ${failed}`);
  }
}

main().catch(console.error);
