import { v4 as uuid } from 'uuid';

function Individual(input) {
  const self = this;

  const {
    epoch = 1,
    gen = '',
    index = 0,
    strategy = {},
    getFitness: userGetFitness,
    mutate: userMutate,
    combine: userCombine,
  } = input || {};

  if (!userGetFitness || !userMutate || !userCombine) {
    throw { message: 'missing required function' };
  }

  let _gen = gen;
  let _strategy = strategy;
  let _epoch = epoch;
  let _index = index;
  let _fitness = 0;
  let _active = null;
  const id = uuid();

  const getFitness = async (input) => {
    if (typeof userGetFitness === 'function') {
      return userGetFitness(input);
    }

    return 0;
  };

  const mutate = async (input) => {
    return userMutate(input);
  };

  const combine = async (a, b) => {
    return userCombine(a, b);
  };

  const init = async () => {
    if (Object.keys(_strategy).length === 0) {
      _strategy = await mutate();
    } else {
      _strategy = await mutate(_strategy);
    }

    _active = true;
  };

  const setFitness = (value) => {
    _fitness = value;
  };

  self.setGen = (value) => {
    _gen = value;
  };

  self.setEpoch = (value) => {
    _epoch = value;
  };

  self.setIndex = (value) => {
    _index = value;
  };

  self.getId = () => {
    return `${_gen}#${id}`;
  };

  self.getIndex = () => {
    return `${_epoch}#${_index}`;
  };

  self.getStrategy = () => {
    return _strategy;
  };

  self.getFitness = () => {
    return _fitness;
  };

  self.run = async () => {
    await init();
    if (!_active) {
      return false;
    }
    try {
      const result = await getFitness({
        index: self.getIndex(),
        id: self.getId(),
        strategy: _strategy,
      });

      setFitness(result);
      return true;
    } catch (error) {
      const index = self.getIndex();
      console.error('error getting fitness', index, error.message);
      return false;
    }
  };

  self.reproduce = async (mate) => {
    const otherStrategy = mate.getStrategy();

    const newStrategy = await combine(_strategy, otherStrategy);

    return new Individual({ ...input, strategy: newStrategy });
  };

  self.stop = () => {
    _active = false;
  };
}

export default Individual;
