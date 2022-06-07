import Individual from './individual';

class Generation {

  private runtimer: any;
  private active: boolean = true;
  private indi: any;
  private task: any;

    // repoduction variables
  private num_parents: number;
  private pool: number;

  private input:any;

  // private types: any = {
  //   default: 'async',
  //   sync: 'sync',
  //   async: 'async',
  // };
  // private reproductionTypes: any = {
  //   default: 'async',
  //   sync: 'sync',
  //   async: 'async',
  // };

  // private selectAsync: boolean = false;
  // private type: string;
  // private reproductionType: string;

  total: any;

  pop: Individual[] = [];
  index: number = 1;
  best: any;
  worst: any;

  constructor (params: any) {
    console.log('create generation');

    this.input = params.input;
    this.task = this.input.goal;

    // this.types = this.input.processTypes;
    // this.reproductionTypes = this.input.reproductionTypes;

    // this.type = this.input.runPopType;
    // this.reproductionType = this.input.reproductionType;

    this.total = this.input.pop;

    this.getCrossoverParams(this.input);

    this.initializePop(params);
  }

    

    // console.log("type", type);

    private getCrossoverParams = (input: any) => {
      this.num_parents = input.parents;
      this.pool = input.pool;

      let tempPool = input.pop * input.pool;

      if (tempPool < this.num_parents * 5) {
        this.pool = input.pool * 5;
      }

      // popThreshold = 10;
      // altPool = 0.25;
    };

    private initializePop = (params: any) => {
      this.indi = 0;

      if (params && params.pop) {
        //console.log("input generation", this.index, "pop", input.pop.length);
        this.pop = params.pop;
        this.total = params.pop.length;
        this.index = params.index;
      } else {
        this.pop.length = 0;
        this.pop = null;
        this.pop = [];

        let i = 1;
        while (i <= this.total) {
          this.pop.push(
            new Individual({ gen: this.index, index: i, input: this.input })
          );
          i++;
        }
      }

      // console.log("index", this.index, this.total);

      this.best = {
        index: this.index,
        dna: this.pop[0].dna,
        fitness: this.pop[0].fitness,
        runs: this.pop[0].runs,
      };

      this.worst = {
        index: this.index,
        dna: this.pop[this.pop.length - 1].dna,
        fitness: this.pop[this.pop.length - 1].fitness,
        runs: this.pop[this.pop.length - 1].runs,
      };
    };

    private runPop = (complete: any) => {
      const runIndi = (i: number) => {
        // console.log("get indi");

        return new Promise((resolve) => {
          // console.log("run indi", i, this.pop.length);
          this.pop[i].run(() => {
            // console.log("resolve", i);
            resolve(i);
          });
        });
      };

      this.setActive(true);

      let i: number = 0;

      let finished: any = [];

      while (i < this.total) {
        // console.log("indi", i, active);

        if (this.active) {
          runIndi(i)
            .then((index: any) => {
              finished.push(index);

              // console.log("completed indi", finished.length, this.pop.length);

              if (finished.length == this.pop.length) {
                // console.log("run complete for generation", this.index);

                complete();
              }
            })
            .catch((error) => {
              console.log('Error in promise:', error);
            });

          i++;
        }
      }
    };

    rank = () => {
      this.pop.sort((a: Individual, b: Individual) => {
        return this.task == 'min' ? a.fitness - b.fitness : b.fitness - a.fitness;
      });

      this.pop.map((value: Individual, index: number) => {
        value.index = index;
      });

      let best = this.pop[0];
      let worst = this.pop[this.pop.length - 1];

      this.best = {
        index: this.index,
        dna: best.dna,
        fitness: best.fitness,
        runs: best.runs,
        success: best.success,
      };

      this.worst = {
        index: this.index,
        dna: worst.dna,
        fitness: worst.fitness,
        runs: worst.runs,
        success: worst.success,
      };

      return {
        best: this.best,
        worst: this.worst,
      };
    };

    private select = (number: number, totalPool: any) => {
      // let normalStand = _pool*this.total/100

      const pool = this.pop.filter((value: any, index: number) => {
        return index < Math.floor(totalPool * this.total);
      });

      if (!pool) {
        return;
      }

      let indexes: any = [];
      let match: any;
      let index: number;

      do {
        do {
          index = Math.floor(Math.random() * pool.length);

          match = indexes.find((p: number) => {
            return p == index;
          });
        } while (match >= 0);

        indexes.push(index);
      } while (indexes.length < number);

      const parents = indexes.map((value: number) => {
        return pool[value];
      });

      parents.sort((a: Individual, b: Individual) => {
        return b.fitness - a.fitness;
      });

      // console.log("select", this.pop.length, pool.length, number, parents.length);

      return parents;
    };

    // let select = function (number, _pool) {

    // 	// let normalStand = _pool*this.total/100

    // 	let $pool = this.pop.filter(function (value, index) {

    // 		return index < Math.floor(_pool*this.total);
    // 	})

    // 	if (!$pool) {

    // 		return;
    // 	}

    // 	let indexes = [];
    // 	let match;
    // 	let index;

    // 	let getIndexAsync = function ($indexes) {

    // 		return new Promise(function (resolve, reject) {

    // 			index = Math.floor(Math.random()*$pool.length);

    // 			match = $indexes.find(function(p) {

    // 				return p == index;
    // 			});

    // 			// console.log("match", index, $indexes, match, typeof match === "undefined");

    // 			if (typeof match === "undefined") {

    // 				return resolve(index);
    // 			}

    // 		})
    // 	}

    // 	while (indexes.length <= number) {

    // 		getIndexAsync(indexes)
    // 		.then(function (index) {

    // 			console.log("index", index);

    // 			indexes.push(index);

    // 			console.log("index is", index, indexes);

    // 		})
    // 		.catch(function (err) {

    // 			console.log("Error in promise:", err);
    // 		})

    // 	}

    // 	let parents = indexes.map(function (value, index) {

    // 		return $pool[value];
    // 	})

    // 	parents.sort(function (a, b) {

    // 		return b.fitness - a.fitness;
    // 	})

    // 	// console.log("select", this.pop.length, pool.length, number, parents.length);

    // 	return parents;

    // }

    private reproduce = (_parents: any, pool: any) => {
      let parents: any = [];
      let mates: any = [];
      let male: Individual;
      let children: any = [];
      let childrenPromise: Promise<[]>;

      let i = 0;

      // console.log("reproduce", _parents, _pool, active);

      if (this.active) {
        while (i < this.total) {
          parents = this.select(_parents, pool);

          if (parents.length == 0) {
            break;
          }

          // console.log("parents", num_parents, _pool, parents.length, parents);

          male = parents[0];
          mates = parents.slice(1);

          // console.log("male", male);

          childrenPromise = male
            .reproduce(mates)
            .then((offspring: any) => {
              offspring.map((value: any, index: number) => {
                value.index = children.length + index + 1;
              });

              children = children.concat(offspring);

              // console.log("children", children.length);

              return children.length;
            })
            .then((j: number) => {
              if (j == this.total) {
                return children;
              }
            })
            .catch((error) => {
              console.log('Error in promise:', error.message);
            });

          // console.log("after then");

          i++;
        }

        return childrenPromise;
      }
    };

    turnover = ($input: any, complete: any) => {
      console.log('turnover', this.index);

      this.input = $input;

      this.getCrossoverParams(this.input);

      this.runPop(() => {
        let ext = this.rank();

        this.reproduce(this.num_parents, this.pool)
          .then(($children: any) => {
            complete({
              rank: {
                best: ext.best,
                worst: ext.worst,
              },
              previous: this,
              next:
                $children.length == 0
                  ? this
                  : new Generation({
                      index: this.index + 1,
                      input: this.input,
                      pop: $children,
                    }),
            });
          })
          .catch((error) => {
            console.log('Error in promise:', error.message);
          });
      });
    };

    setActive = ($active: boolean) => {
      this.active = $active;

      this.pop.forEach((p: Individual) => {
        p.setActive($active);
      });
    };

    getstepdata = (stepdata: any) => {
      stepdata.org = this.indi;

      stepdata = this.pop[this.indi].getstepdata(stepdata);

      return stepdata;
    };

    hardStop = () => {
      // console.log("generation hard stop", indi);

      this.setActive(false);
      clearInterval(this.runtimer);
      this.runtimer = null;
      this.pop.forEach((p: Individual) => {
        p.hardStop();
      });
    };
}

export default Generation;
