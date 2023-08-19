import Individual from './individual';
import { v4 as uuid } from 'uuid';

const defaultRank = (a, b) => {
  return b - a;
};

function Generation(input) {
  const self = this;

  const {
    pop = [],
    epoch = 1,
    best = null,
    popTotal = 100,
    rank: userRank = defaultRank,
  } = input || {};

  const total = popTotal;
  const topPercent = 0.1;
  const parents = { a: [], b: [] };
  let _pop = pop || [];
  let _isSorted = false;
  let _active = null;
  const id = uuid();

  const rank = (a, b) => {
    return userRank(a, b);
  };

  const getRandomIndex = () => {
    return Math.floor(Math.random() * total * topPercent);
  };

  const getAnotherIndex = (first) => {
    const second = getRandomIndex();

    if (first === second) {
      return getAnotherIndex(first);
    }

    return second;
  };

  const getRandomParents = () => {
    for (let index = 0; index < total; index++) {
      const first = getRandomIndex();
      const second = getAnotherIndex(first);

      parents.a[index] = first;
      parents.b[index] = second;
    }
  };

  const init = () => {
    if (_pop.length === 0) {
      for (let index = 0; index < total; index++) {
        const newInd = new Individual({
          epoch,
          strategy: best?.strategy,
          gen: id,
          index,
          ...input,
        });

        _pop[index] = newInd;
      }
    } else {
      _pop.forEach((item) => {
        item.setGen(id);
      });
    }

    getRandomParents();

    _active = true;
  };

  init();

  const sort = () => {
    if (!_isSorted) {
      _pop.sort((a, b) => {
        return rank(a.getFitness(), b.getFitness());
      });

      _isSorted = true;
    }
  };

  self.getId = () => {
    return `#${id}`;
  };

  self.getEpoch = () => {
    return epoch;
  };

  self.getPopulation = () => {
    return _pop;
  };

  self.setPopulation = (value) => {
    _pop = value;
  };

  self.getBest = () => {
    sort();

    const best = _pop[0];

    return { strategy: best.getStrategy(), fitness: best.getFitness() };
  };

  self.crossover = async () => {
    sort();

    let nextGen = [];

    for (let index = 0; index < total; index++) {
      const a = _pop[parents.a[index]];
      const b = _pop[parents.b[index]];

      const newIndi = await a.reproduce(b);

      newIndi.setIndex(index);
      newIndi.setEpoch(epoch + 1);

      nextGen[index] = newIndi;
    }

    return new Generation({ ...input, pop: nextGen, epoch: epoch + 1 });
  };

  self.run = async (active) => {
    const promises = _pop.map((item) => {
      return item.run();
    });

    const result = await Promise.all(promises);

    if (_active === false || active === false) {
      return false;
    }

    return !result.some((item) => item === false);
  };

  self.stop = () => {
    _active = false;
    _pop.forEach((item) => {
      item.stop();
    });
  };
}

export default Generation;
