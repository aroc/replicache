import {expect} from '@esm-bundle/chai';
import * as dag from '../dag/mod';
import {Hash, hashOf, initHasher} from '../hash';
import {MemStore} from '../kv/mod';
import {DEFAULT_HEAD_NAME} from './commit';
import {getRoot} from './root';

setup(async () => {
  await initHasher();
});

test('getRoot', async () => {
  const t = async (headHash: Hash | undefined, expected: Hash | Error) => {
    const kvs = new MemStore();
    const ds = new dag.Store(kvs);
    if (headHash !== undefined) {
      await ds.withWrite(async dw => {
        await dw.setHead(DEFAULT_HEAD_NAME, headHash);
        await dw.commit();
      });
    }
    if (expected instanceof Error) {
      let err;
      try {
        await getRoot(ds, DEFAULT_HEAD_NAME);
      } catch (e) {
        err = e;
      }
      expect(err).to.be.an.instanceof(Error);
      expect((err as Error).message).to.equal(expected.message);
    } else {
      const actual = await getRoot(ds, DEFAULT_HEAD_NAME);
      expect(actual).to.equal(expected);
    }
  };

  await t(undefined, new Error('No head found for main'));
  const foo = hashOf('foo');
  await t(foo, foo);
});
