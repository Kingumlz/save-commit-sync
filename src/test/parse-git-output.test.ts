import * as assert from 'assert';
import { FileChanges, parseStatus, describeCode } from '../generate/parse-git-output';
import { DESCRIPTION } from '../generate/constants';

describe('Split git status into components for an unchanged path', function() {
  describe('#parseStatus()', function() {
    it('should return the appropriate commit message for a new file', function() {
      // Using DESCRIPTION.A to get 'A' does not work here.
      const expected: FileChanges = {
        x: 'A',
        y: ' ',
        to: 'foo.txt',
        from: ''
      };
      assert.deepEqual(parseStatus('A  foo.txt'), expected);
    });

    it('should return the appropriate commit message for a modified file', function() {
      const expected: FileChanges = {
        x: ' ',
        y: 'M',
        to: 'foo.txt',
        from: ''
      };
      assert.deepEqual(parseStatus(' M foo.txt'), expected);
    });

    it('should return the appropriate commit message for a deleted file', function() {
      const expected: FileChanges = {
        x: 'D',
        y: ' ',
        to: 'foo.txt',
        from: ''
      };
      assert.deepEqual(parseStatus('D  foo.txt'), expected);
    });

    it('should return the appropriate commit message for a renamed file', function() {
      const expected: FileChanges = {
        x: 'R',
        y: ' ',
        to: 'foo.txt',
        from: 'bar.txt'
      };
      assert.deepEqual(parseStatus('R  foo.txt -> bar.txt'), expected);

      it('should return the appropriate commit message for a moved file', function() {
        const expected: FileChanges = {
          x: 'R',
          y: ' ',
          to: 'foo.txt',
          from: 'fizz/bar.txt'
        };
        assert.deepEqual(parseStatus('R  foo.txt -> fizz/foo.txt'), expected);
      });
    });
  });
});

describe('Get value from key', function() {
  describe('#describeCode()', function() {
    it('Can return the correct value for added symbol', function() {
      assert.equal(describeCode('A'), 'added');

      assert.equal(describeCode('A'), DESCRIPTION.A);
    });

    it('Can return the correct value for empty space as unmodified', function() {
      assert.equal(describeCode(' '), 'unmodified');
    });

    it('Can return the correct value for ignored symbol', function() {
      assert.equal(describeCode('!'), 'ignored');
    });
  });
});
