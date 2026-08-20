#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEffects } from './effect-library.mjs';
import { assertMetadataFreeImage } from './image-metadata.mjs';

const runFile = promisify(execFile);
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_SKILL_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function previewFormat(previewPath) {
  const extension = path.posix.extname(previewPath).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'jpeg';
  if (extension === '.png') return 'png';
  throw new Error(`Unsupported preview extension for ${previewPath}`);
}

function remoteLabel({ repository, revision, path: sourcePath }) {
  return `${repository}@${revision}:${sourcePath}`;
}

function pinnedSourceFetchError(message, request, cause) {
  const error = new Error(`${message} for ${remoteLabel(request)}`, { cause });
  error.code = 'ERR_PINNED_SOURCE_FETCH';
  return error;
}

function fetchFailureMessage(cause) {
  const diagnostic = [cause?.stderr, cause?.message]
    .filter((value) => typeof value === 'string')
    .join('\n');
  if (cause?.code === 'ENOENT') return 'GitHub CLI is unavailable';
  if (/authentication|authenticate|HTTP\s+(?:401|403)|not logged/i.test(diagnostic)) {
    return 'GitHub authentication failed';
  }
  if (/HTTP\s+404|not found/i.test(diagnostic)) {
    return 'Pinned GitHub source was not found';
  }
  if (cause?.killed || cause?.code === 'ETIMEDOUT') return 'GitHub request timed out';
  return 'GitHub request failed';
}

function decodeBase64Content(payload, request) {
  if (
    payload === null ||
    typeof payload !== 'object' ||
    payload.encoding !== 'base64' ||
    typeof payload.content !== 'string'
  ) {
    throw new Error(`Invalid GitHub content response for ${remoteLabel(request)}`);
  }

  const compact = payload.content.replaceAll(/\s/g, '');
  if (
    compact.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(compact)
  ) {
    throw new Error(`Invalid base64 content for ${remoteLabel(request)}`);
  }
  return Buffer.from(compact, 'base64');
}

export async function loadValidatedEffects({
  sourceRoot = DEFAULT_SKILL_ROOT,
  online = false,
  fetcher = fetchGitHubContent,
  previewReader = readFile,
} = {}) {
  const effects = await loadEffects(path.join(sourceRoot, 'references/effects'));
  const previewAssetsByRef = new Map();

  for (const effect of effects) {
    const previewBytes = await previewReader(
      path.join(sourceRoot, ...effect.preview.split('/')),
    );
    const { width, height } = await assertMetadataFreeImage(
      previewBytes,
      previewFormat(effect.preview),
    );
    const actualSha = sha256(previewBytes);
    if (actualSha !== effect.previewProvenance.sha256) {
      throw new Error(`Preview SHA-256 mismatch for ${effect.ref}`);
    }
    previewAssetsByRef.set(effect.ref, { bytes: previewBytes, width, height });
  }

  if (online) await validateOnlineSources(effects, { fetcher });
  return { effects, previewAssetsByRef };
}

export async function validateEffects(options = {}) {
  const { effects } = await loadValidatedEffects(options);
  return effects;
}

export async function validateOnlineSources(effects, { fetcher = fetchGitHubContent } = {}) {
  const payloadByRemote = new Map();
  for (const effect of effects) {
    for (const source of effect.sources) {
      const request = {
        repository: effect.sourceRepository,
        revision: effect.sourceRevision,
        path: source.path,
      };
      let payload;
      const label = remoteLabel(request);
      if (payloadByRemote.has(label)) {
        payload = payloadByRemote.get(label);
      } else {
        try {
          payload = await fetcher(request);
        } catch (cause) {
          const message =
            cause?.code === 'ERR_PINNED_SOURCE_FETCH'
              ? cause.message
              : `Failed to validate pinned GitHub source ${label}`;
          throw new Error(message, { cause });
        }
        payloadByRemote.set(label, payload);
      }
      const actualSha = sha256(decodeBase64Content(payload, request));
      if (actualSha !== source.sha256) {
        throw new Error(`SHA-256 mismatch for pinned GitHub source ${remoteLabel(request)}`);
      }
    }
  }
  return effects;
}

export async function fetchGitHubContent(
  { repository, revision, path: sourcePath },
  { run = runFile } = {},
) {
  const [owner, repositoryName] = repository.split('/');
  const encodedPath = sourcePath.split('/').map(encodeURIComponent).join('/');
  const endpoint = `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repositoryName)}/contents/${encodedPath}?ref=${encodeURIComponent(revision)}`;

  let stdout;
  try {
    ({ stdout } = await run('gh', ['api', endpoint], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: 30_000,
    }));
  } catch (cause) {
    const request = { repository, revision, path: sourcePath };
    throw pinnedSourceFetchError(fetchFailureMessage(cause), request, cause);
  }

  try {
    return JSON.parse(stdout);
  } catch (cause) {
    throw pinnedSourceFetchError(
      'Invalid GitHub JSON response',
      { repository, revision, path: sourcePath },
      cause,
    );
  }
}

async function main() {
  const argumentsList = process.argv.slice(2);
  if (argumentsList.some((argument) => argument !== '--online')) {
    throw new Error('Usage: node scripts/validate-effects.mjs [--online]');
  }
  const online = argumentsList.includes('--online');
  const effects = await validateEffects({ online });
  process.stdout.write(
    `Validated ${effects.length} effect${effects.length === 1 ? '' : 's'}${online ? ' with pinned online sources' : ''}.\n`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
