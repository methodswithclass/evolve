import Generation from './generation';

class Evolve {

  constructor() {}

  private now: number = 1;
  private stepdataobj: any = {
    name: '',
    gen: this.now,
    org: 1,
    run: 1,
  };

  private previous: any = {
    index: 0,
    best: {},
    worst: {},
    pop: [],
  };

  private rank: any;
  private current: any;

  active: boolean = true;
  input: any = {};

  // private index = (now: number) => {
  //   return now - 1;
  // };

  private setActive = (active: boolean) => {
    this.active = active;
    if (this.current.setActive) this.current.setActive(this.active);
    if (this.previous.setActive) this.previous.setActive(this.active);
  };

  private step = () => {
    console.log(' ');
    console.log('evolve new', this.now);

    if (this.active) {
      this.stepdataobj.gen = this.now;

      this.current.turnover(this.input, (x: any) => {
        this.now++;

        this.rank = x.rank;
        this.previous = x.previous;

        console.log('best', this.rank.best.fitness);

        if (x.next) {
          // era[index(now)] = x.next;
          this.current = x.next;

          // console.log("running evolve", this.input);

          if (this.now <= this.input.gens && !this.rank.best.success) {
            setTimeout(() => {
              this.step();
            }, this.input.programInput.evdelay);
          } else {
            this.hardStop(this.input);
          }
        } else {
          this.hardStop(this.input);
        }
      });
    }
  };

  getstepdata = () => {
    // stepdataobj = era[index(now)].getstepdata(stepdataobj);

    this.stepdataobj =
      typeof this.current !== 'undefined'
        ? this.current.getstepdata(this.stepdataobj)
        : this.stepdataobj;

    return this.stepdataobj;
  };

  running = () => {
    return this.active && this.now <= this.input.gens;
  };

  getBest = () => {
    const defaultVal: any = {
      dna: [],
      runs: 0,
      fitness: 0,
    };

    let best = defaultVal;
    let worst = defaultVal;

    if (!this.rank) {
      this.rank = this.current.rank();
    }

    if (this.rank.best) {
      best = {
        dna: this.rank.best.dna,
        runs: this.rank.best.runs,
        fitness: this.rank.best.fitness,
      };
    }

    if (this.rank.worst) {
      worst = {
        dna: this.rank.worst.dna,
        runs: this.rank.worst.runs,
        fitness: this.rank.worst.fitness,
      };
    }

    return {
      index: this.now,
      best: best,
      worst: worst,
    };
  };

  set = (input: any) => {
    this.input = input;
  };

  initialize = (input: any) => {
    console.log(' ');
    console.log('initialize evolve');

    this.set(input);
    this.now = 1;
    this.current = new Generation({ index: this.now, input: this.input });
    this.setActive(true);
    return this.now == this.input.pop;
  };

  run = (input: any) => {
    console.log(' ');
    console.log('restart evolve');

    if (input.goal != this.input.goal || input.pop != this.input.pop) {
      console.log(
        'inputs are not equal',
        input.pop,
        this.input.pop,
        'reinitialize'
      );
      return false;
    } else {
      console.log('inputs are equal', input.pop, this.input.pop, 'run');
      this.setActive(true);
      this.set(input);
      this.step();
      return true;
    }
  };

  hardStop = (input: any) => {
    console.log('evolve hard stop new', this.input.gens);

    this.set(input);
    this.setActive(false);

    if (this.current && this.current.hardStop) this.current.hardStop();
    if (this.previous && this.previous.hardStop) this.previous.hardStop();

    if (this.input && this.input.setEvdata) {
      this.input.setEvdata({
        index: this.now,
        best: this.rank.best,
        worst: this.rank.worst,
      });
    }
  };
}

export default Evolve;
