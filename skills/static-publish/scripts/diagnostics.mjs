import { readFile } from 'node:fs/promises';

export function problem(code, message, nextStep) {
  return Object.assign(new Error(message), { code, safe: true, nextStep });
}
export async function readJSON(path, label = '项目配置') {
  let raw;
  try { raw = await readFile(path, 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') throw problem('CONFIG_NOT_FOUND', `${label}不存在。`, '首次使用先运行 project.mjs init；已有项目请选择实际配置或先生成所需证据文件。');
    throw problem('INPUT_UNREADABLE', `${label}不可读。`, '核对所选文件及本机读取权限，不要复制认证文件来代替配置。');
  }
  try { return JSON.parse(raw); }
  catch { throw problem('INVALID_JSON', `${label}不是有效 JSON。`, '修正 JSON 语法；配置中不要放密钥，错误输出不会回显文件内容。'); }
}
export function diagnostic(error) {
  if (error.safe) return { code: error.code, message: error.message, nextStep: error.nextStep };
  if (error instanceof SyntaxError) return { code: 'INVALID_JSON', message: 'JSON 语法无效。', nextStep: '修正所选配置，不要粘贴凭据。' };
  if (error.code) return { code: error.code, message: '选定文件、目录或网络操作失败。', nextStep: error.code === 'EEXIST' ? '选择新的输出名，保留已有快照与回执。' : '核对选定路径和访问条件，再由明确动作重跑。' };
  return { code: 'VALIDATION_FAILED', message: error.message, nextStep: '按提示修正本次显式配置或公开文件，再运行 plan。' };
}
export function ossFailure(text, systemError) {
  if (systemError) return systemError.code === 'ENOENT'
    ? { code: 'CLI_NOT_FOUND', message: '未找到 aliyun。', nextStep: '按 onboarding 安装官方 Aliyun CLI 并核对 aliyun oss --help；不使用 OSS 可选 same-origin。' }
    : { code: 'CLI_UNAVAILABLE', message: '官方 CLI 超时或启动失败。', nextStep: '检查本地工具和网络；没有继续查询或重试。' };
  if (/0016-00000901|Put public object acl is not allowed/i.test(text)) return { code: 'PUBLIC_ACCESS_BLOCKED', message: '选定对象的公开只读 ACL 被 BlockPublicAccess 阻止。', nextStep: '按 onboarding 核对账号/桶/对象条件；仅在授权范围配置新桶，组织禁止公开时改用满足条件的路线。' };
  const codes = {
    NoSuchKey: ['精确对象不存在。', '只证明对象读路径可到达；本次 publish 再验证写入与匿名公开性。'],
    NoSuchBucket: ['已知 Bucket 不存在或名称不正确。', '先核对用户自己的桶名和地域；无桶可选 same-origin，确需建桶再取得具体目标授权。'],
    AccessDenied: ['对象请求被拒绝。', '先核对地域 Endpoint，再由管理员核对所选前缀的对象读写/公开 ACL 权限；不要求列桶权限。'],
    InvalidAccessKeyId: ['CLI 身份不可用。', '通过官方本机配置修复自己的身份；不要将 AccessKey 发到聊天。'],
    SignatureDoesNotMatch: ['请求签名未通过。', '核对本机官方身份、地域和时间；不要输出原始认证日志。'],
    SecurityTokenExpired: ['临时身份已过期。', '按组织规定在本机更新临时身份，再显式重跑。'],
    PermanentRedirect: ['目标 Endpoint 与 Bucket 不匹配。', '使用桶真实地域；必须经 CNAME 的账号按 onboarding 选择适配工具或同站模式。'],
  };
  const code = Object.keys(codes).find(key => new RegExp(`(?:ErrorCode[=:]\\s*|<Code>)${key}\\b`).test(text));
  if (code) return { code, message: codes[code][0], nextStep: codes[code][1] };
  return { code: 'OSS_REQUEST_FAILED', message: 'OSS 请求失败。', nextStep: '通过官方工具核对 OSS 子命令、身份、地域和域名路线；不回显原始日志，不自动建桶或改权限。' };
}
