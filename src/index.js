import Generation from './generation';

function Evolve(input) {
  const self = this;

  const {
    first = 1,
    last = 1,
    beforeEach: userBeforeEach,
    afterEach: userAfterEach,
    onEnd: userOnEnd,
  } = input || {};

  let _current = null;
  let _epoch = null;
  let _active = false;
  let _errorMessage = null;

  const init = async () => {
    _current = new Generation({ ...input, epoch: first });
    _active = true;
  };

  init().catch((error) => {
    console.error('error in init generation', _epoch, error.message);
    _errorMessage = error.message;
  });

  const beforeEach = async (input) => {
    if (typeof userBeforeEach === 'function') {
      return userBeforeEach(input);
    }
    return null;
  };

  const afterEach = async (input) => {
    if (typeof userAfterEach === 'function') {
      return userAfterEach(input);
    }
    return null;
  };

  const onEnd = async (input) => {
    if (typeof userOnEnd === 'function') {
      return userOnEnd(input);
    }
    return null;
  };

  const run = async (_gen) => {
    _epoch = _gen?.getEpoch() || last;
    _current = _gen;
    console.log('current epoch', _epoch);
    const active = await beforeEach({ first, last, generation: _epoch });
    const result = await _current?.run(active);
    if (!result || _epoch >= last) {
      console.log('finished evolve', _epoch);
      await onEnd({
        generation: _epoch,
        best: _current.getBest(),
      });
      self.stop();
      return;
    }

    await afterEach({
      generation: _epoch,
      best: _current.getBest(),
    });

    const next = await _current.crossover();

    await run(next);
  };

  self.start = async () => {
    try {
      if (!_current) {
        throw { message: `no generation: ${_errorMessage}` };
      }
      await run(_current);
    } catch (error) {
      console.error('error in run', _epoch, error.message);
      throw { message: `error in run ${_epoch}: ${error.message}` };
    }
  };

  self.stop = () => {
    _active = false;
    _current.stop();
  };
}

const init = (input) => {
  return new Evolve(input);
};

export default init;
