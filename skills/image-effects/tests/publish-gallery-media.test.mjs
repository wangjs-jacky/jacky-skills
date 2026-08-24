import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { publishGalleryMedia } from '../scripts/publish-gallery-media.mjs';

test('publishes only missing immutable objects and verifies existing hashes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-media-'));
  const calls = [];
  try {
    await mkdir(path.join(root, 'gallery/media'), { recursive: true });
    await writeFile(path.join(root, 'gallery/media/alpha@1.0.0.png'), 'alpha');
    await writeFile(path.join(root, 'gallery/media/beta@1.0.0.jpg'), 'beta');
    await writeFile(path.join(root, 'gallery/api.json'), JSON.stringify({
      effects: [
        { ref: 'alpha@1.0.0', previewUrl: './media/alpha@1.0.0.png' },
        { ref: 'beta@1.0.0', previewUrl: './media/beta@1.0.0.jpg' },
      ],
    }));

    let betaUploaded = false;
    const fakeExec = async (args) => {
      calls.push(args);
      const target = args.find((value) => value.startsWith('oss://'));
      if (args[0] === 'stat' && target.endsWith('alpha@1.0.0.png')) {
        return { stdout: JSON.stringify({
          ACL: 'public-read',
          Etag: '"2C1743A391305FBF367DF8E4F069F9F9"',
          'Content-Type': 'image/png',
          'Cache-Control': 'public,max-age=31536000,immutable',
        }) };
      }
      if (args[0] === 'stat' && target.endsWith('beta@1.0.0.jpg') && !betaUploaded) {
        const error = new Error('NoSuchKey');
        error.stderr = 'StatusCode=404 NoSuchKey';
        throw error;
      }
      if (args[0] === 'cp' && target.endsWith('beta@1.0.0.jpg')) {
        betaUploaded = true;
        return { stdout: '' };
      }
      if (args[0] === 'stat' && target.endsWith('beta@1.0.0.jpg')) {
        return { stdout: JSON.stringify({
          ACL: 'public-read',
          Etag: '"987BCAB01B929EB2C07877B224215C92"',
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public,max-age=31536000,immutable',
        }) };
      }
      throw new Error(`Unexpected fake ossutil call: ${args.join(' ')}`);
    };

    const result = await publishGalleryMedia({
      skillRoot: root,
      libraryPath: path.join(root, 'gallery/api.json'),
      bucket: 'fixture-bucket',
      region: 'cn-hangzhou',
      execOssutil: fakeExec,
    });

    assert.deepEqual(result, { verified: 2, uploaded: 1 });
    assert.equal(calls.filter((args) => args[0] === 'cp').length, 1);
    assert.ok(calls.find((args) => args[0] === 'cp').includes('--acl'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects an existing versioned object with different bytes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'image-effects-media-'));
  try {
    await mkdir(path.join(root, 'gallery/media'), { recursive: true });
    await writeFile(path.join(root, 'gallery/media/alpha@1.0.0.png'), 'alpha');
    await writeFile(path.join(root, 'gallery/api.json'), JSON.stringify({
      effects: [{ ref: 'alpha@1.0.0', previewUrl: './media/alpha@1.0.0.png' }],
    }));
    await assert.rejects(
      publishGalleryMedia({
        skillRoot: root,
        libraryPath: path.join(root, 'gallery/api.json'),
        bucket: 'fixture-bucket',
        region: 'cn-hangzhou',
        execOssutil: async () => ({ stdout: JSON.stringify({
          ACL: 'public-read',
          Etag: '"00000000000000000000000000000000"',
          'Content-Type': 'image/png',
          'Cache-Control': 'public,max-age=31536000,immutable',
        }) }),
      }),
      /Immutable OSS object differs/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
