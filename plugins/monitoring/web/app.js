// Claude Code Monitor - Web UI

const TOOL_ICONS = {
  Read: '📖',
  Write: '✏️',
  Edit: '🔧',
  Bash: '⚡',
  Grep: '🔍',
  Glob: '📁',
  Skill: '🎯',
  Agent: '🤖',
  WebSearch: '🌐',
  WebFetch: '🔗',
  AskUserQuestion: '❓',
  LSP: '📡',
  NotebookEdit: '📓',
  Task: '📋',
  default: '⚙️'
};

const TOOL_COLORS = {
  Read: 'tool-read',
  Write: 'tool-write',
  Edit: 'tool-edit',
  Bash: 'tool-bash',
  Grep: 'tool-grep',
  Skill: 'tool-skill',
  Agent: 'tool-agent'
};

let events = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', loadEvents);
  document.getElementById('openFileBtn').addEventListener('click', openLogFile);
  document.getElementById('filterInput').addEventListener('input', renderTimeline);
  document.getElementById('statusFilter').addEventListener('change', renderTimeline);

  loadEvents();
});

// 加载事件（模拟数据，实际需要从文件读取）
async function loadEvents() {
  // 由于浏览器安全限制，无法直接读取本地文件
  // 这里显示提示信息
  const timeline = document.getElementById('timeline');

  timeline.innerHTML = `
    <div class="empty-state">
      <p>📂 Web 界面需要通过本地服务器访问</p>
      <p>请在终端运行以下命令查看日志：</p>
      <code style="display: block; margin-top: 16px; padding: 12px; background: #1a1a1d; border-radius: 6px; font-family: monospace;">
        cat ~/.claude/monitor/sessions/*.jsonl | jq
      </code>
    </div>
  `;

  // 更新统计
  updateStats([]);
}

// 打开日志文件（提示用户）
function openLogFile() {
  alert('请在终端运行以下命令打开日志目录：\n\nopen ~/.claude/monitor/sessions/');
}

// 更新统计信息
function updateStats(events) {
  document.getElementById('eventCount').textContent = events.length;

  const totalDuration = events.reduce((sum, e) => sum + (e.timing?.duration_ms || 0), 0);
  document.getElementById('totalDuration').textContent = formatDuration(totalDuration);

  const uniqueTools = new Set(events.map(e => e.tool?.name).filter(Boolean));
  document.getElementById('toolCount').textContent = uniqueTools.size;
}

// 渲染时间线
function renderTimeline() {
  const filterText = document.getElementById('filterInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = events.filter(event => {
    const toolName = event.tool?.name?.toLowerCase() || '';
    const matchesText = !filterText || toolName.includes(filterText);

    const status = event.result?.status || 'success';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesText && matchesStatus;
  });

  const timeline = document.getElementById('timeline');

  if (filtered.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state">
        <p>没有匹配的事件</p>
      </div>
    `;
    return;
  }

  timeline.innerHTML = filtered.map(event => {
    const icon = TOOL_ICONS[event.tool?.name] || TOOL_ICONS.default;
    const colorClass = TOOL_COLORS[event.tool?.name] || '';
    const time = new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour12: false });
    const duration = formatDuration(event.timing?.duration_ms || 0);
    const status = event.result?.status || 'success';

    return `
      <div class="event-item">
        <span class="event-time">${time}</span>
        <span class="event-icon">${icon}</span>
        <div class="event-content">
          <div class="event-name ${colorClass}">${event.tool?.name || 'Unknown'}</div>
          <div class="event-detail">${truncate(event.result?.output_preview || '', 50)}</div>
        </div>
        <span class="event-duration">${duration}</span>
        <span class="event-status ${status}"></span>
      </div>
    `;
  }).join('');
}

// 格式化时长
function formatDuration(ms) {
  if (!ms) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// 截断文本
function truncate(str, maxLen) {
  if (!str) return '';
  str = str.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}
