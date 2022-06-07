class Individual {
    private active: boolean;
    private program: any;
    private stepdataobj = {
      name: '',
      gen: 1,
      org: 1,
      run: 1,
    };
  
    // reproduction variables
    private crossoverMethod: any;
    private methodTypes: any;
    private mutateRate: any;
    private dnaChainOffset: any;
    private dnaChainLength: any;
    // 
  
    name: string;
    total: number;
    dna: any;
    runs: any;
    fitness: number;
    generation: number;
    index: number;
    currentGen: number;
    parents: any;
    input: any;
    success: any;


    constructor(params: any) {
      this.name = params.input.name;
  
      // console.log(this.name, "create organism");
  
      this.program = params.input.program;
      this.total = params.input.pdata.data.genome;
      this.dna = [];
      this.runs = [];
      this.fitness = 0;
      this.generation = params.gen;
      this.index = params.index;
      this.currentGen = params.curentGen;
      this.parents = [];
      this.input = params.input;
  
      this.getCrossoverParams(this.input);
  
      if (params && params.dna) {
        // console.log("has dna", params.dna);
        this.dna = params.dna;
        this.parents = params.parents;
      } else {
        // console.log("create dna", pdata);
        let i = 0;
        while (i < this.total) {
          this.dna[i] = this.program.gene();
          i++;
        }
      }
    }
  
    private getCrossoverParams = (input: any) => {
      this.methodTypes = input.methodTypes;
  
      if (this.methodTypes === undefined) {
        this.methodTypes = {
          default: 'multi-parent',
          multiParent: 'multi-parent',
          multiOffspring: 'multi-offspring',
        };
      }
  
      this.crossoverMethod = input.method;
      this.mutateRate = input.mutate;
      this.dnaChainOffset = input.splicemin;
      this.dnaChainLength = input.splicemax - input.splicemin;
    };
  
    mutate = ($dna: any) => {
      let i = 0;
      while (i < this.total) {
        if (Math.random() < this.mutateRate) {
          $dna[i] = this.program.gene();
        }
        i++;
      }
  
      return $dna;
    };
  
    multiParentCrossover = ($parents: any) => {
      /*
      
      this function is looped from its caller 
  
      and delivers individual offspring to its caller
      
      */
  
      const parents = $parents.map((value: any) => {
        return value;
      });
  
      // console.log("parents", parents.length);
  
      let getRandomParent = () => {
        return Math.floor(Math.random() * parents.length);
      };
  
      const offspring: any = [];
      let dna: any = [];
      let mateA: number;
      let mateB: number;
      let source: any;
  
      // creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
      let c_len =
        Math.floor(Math.random() * this.dnaChainLength) + this.dnaChainOffset;
      // the number of chains there will be per dna strand based on how long the chain is
      let c_num = Math.floor(this.total / c_len);
      let i = 0;
  
      while (i < c_num) {
        do {
          mateA = getRandomParent();
          // console.log("random parent index", mateA);
        } while (mateA == mateB);
  
        mateB = mateA;
        source = parents[mateA];
  
        // console.log("source", mateA, parents.length, source ? true : false, parents[mateA] ? true: false);
  
        if ((i + 1) * c_len <= this.total) {
          dna = dna.concat(source.dna.slice(i * c_len, (i + 1) * c_len));
        } else {
          dna = dna.concat(source.dna.slice(i * c_len));
        }
  
        i++;
      }
  
      const newOffspring = new Individual({
        gen: this.generation + 1,
        parents,
        dna: this.mutate(dna),
        input: this.input,
      });
  
      offspring.push(newOffspring);
  
      return offspring;
    };
  
    multiOffspringCrossover = ($parents: any) => {
      /*
      
      this function is looped from its caller 
  
      but also loops internally 
  
      and delivers multiple offspring to its caller
      
      */
  
      const parents = $parents.map((value: any) => {
        return value;
      });
  
      // console.log("parents", parents.length);
  
      let getRandomParent = () => {
        return Math.floor(Math.random() * parents.length);
      };
      
      let dna: any = [];
      let mateA: number;
      let mateB: number;
      let source: any;
      const offspring: any = [];
  
      //offspring loop by parent (offspring.length == parent.length, not including self)
      do {
        //a new splice length is chosen for each offspring loop
  
        dna = [];
        // creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
        let c_len =
          Math.floor(Math.random() * this.dnaChainLength) + this.dnaChainOffset;
        // the number of chains there will be per dna strand based on how long the chain is
        let c_num = Math.floor(this.total / c_len);
        let i = 0;
        let j = 1;
  
        //dna splice loop
        while (i < c_num) {
          // new parent chosen from mates pool, make sure not to choose same two in a row
          do {
            mateA = getRandomParent();
            // console.log("random parent index", mateA);
          } while (mateA == mateB);
          mateB = mateA;
          source = parents[mateA]; // current parent to mate with self
  
          // console.log("source", mateA, parents.length, source ? true : false, parents[mateA] ? true: false);
  
          // splice procedure
          if ((i + 1) * c_len < this.total && (j + 1) * c_len < this.total) {
            dna = this.dna
              .slice(i * c_len, (i + 1) * c_len)
              .concat(source.dna.slice(j * c_len, (j + 1) * c_len));
          } else {
            dna = this.dna.slice(i * c_len).concat(source.dna.slice(j * c_len));
          }
  
          i++;
          j++;
        }
  
        // dna length resolution
        if (dna.length < this.total) {
          dna = dna.concat(this.dna.slice(dna.length - 1));
        } else if (dna.length > this.total) {
          dna.splice(this.total - 1, dna.length);
        }
  
        // create new individual from new dna, after mutation, add to array of all offspring
        const newOffspring = new Individual({
            gen: this.generation + 1,
            parents: [this, source],
            dna: this.mutate(dna),
            input: this.input,
        });

        offspring.push(newOffspring);
      } while (offspring.length < $parents.length); // exit loop when  offspring equals  of parents
  
      return offspring;
    };
  
    setActive = ($active: any) => {
      this.active = $active;
    };
  
    reproduce = (parents: any) => {
      parents.push(this);
  
      let getRandomParent = () => {
        return Math.floor(Math.random() * parents.length);
      };

      const offspring: any = [];
      let dna: any = [];
      let mateA: number;
      let mateB: number;
      let source: any;
  
      return new Promise((resolve) => {
        if (this.crossoverMethod == this.methodTypes.multiParent) {
          // creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
          let c_len =
            Math.floor(Math.random() * this.dnaChainLength) +
            this.dnaChainOffset;
          // the number of chains there will be per dna strand based on how long the chain is
          let c_num = Math.floor(this.total / c_len);
          let i = 0;
  
          while (i < c_num) {
            do {
              mateA = getRandomParent();
              // console.log("random parent index", mateA);
            } while (mateA == mateB);
  
            mateB = mateA;
            source = parents[mateA];
  
            // console.log("parents", parents.length, "source index", mateA, "source parent", source ? true : false);
  
            if ((i + 1) * c_len <= this.total) {
              dna = dna.concat(source.dna.slice(i * c_len, (i + 1) * c_len));
            } else {
              dna = dna.concat(source.dna.slice(i * c_len));
            }
  
            i++;
          }
  
          // console.log("dna", dna ? true : false);
  
          const newoOffspring = new Individual({
            gen: this.generation + 1,
            parents,
            dna: this.mutate(dna),
            input: this.input,
          });
  
          offspring.push(newoOffspring);
  
          resolve(offspring);
        } else if (this.crossoverMethod == this.methodTypes.multiOffspring) {
          //offspring loop by parent (offspring.length == parent.length, not including self)
          while (offspring.length <= parents.length) {
            //a new splice length is chosen for each offspring loop
  
            dna = [];
            // creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
            let c_len =
              Math.floor(Math.random() * this.dnaChainLength) +
              this.dnaChainOffset;
            // the number of chains there will be per dna strand based on how long the chain is
            let c_num = Math.floor(this.total / c_len);
            let i = 0;
            let j = 1;
  
            //dna splice loop
            while (i < c_num) {
              // new parent chosen from mates pool, make sure not to choose same two in a row
              do {
                mateA = getRandomParent();
                // console.log("random parent index", mateA);
              } while (mateA == mateB);
              mateB = mateA;
              source = parents[mateA]; // current parent to mate with self
  
              // console.log("source", mateA, parents.length, source ? true : false, parents[mateA] ? true: false);
  
              // splice procedure
              if ((i + 1) * c_len < this.total && (j + 1) * c_len < this.total) {
                dna = this.dna
                  .slice(i * c_len, (i + 1) * c_len)
                  .concat(source.dna.slice(j * c_len, (j + 1) * c_len));
              } else {
                dna = this.dna
                  .slice(i * c_len)
                  .concat(source.dna.slice(j * c_len));
              }
  
              i++;
              j++;
            }
  
            // dna length resolution
            if (dna.length < this.total) {
              dna = dna.concat(this.dna.slice(dna.length - 1));
            } else if (dna.length > this.total) {
              dna.splice(this.total - 1, dna.length);
            }
  
            // create new individual from new dna, after mutation, add to array of all offspring
            const newOffspring = new Individual({
              gen: this.generation + 1,
              parents: [this, source],
              dna: this.mutate(dna),
              input: this.input,
            });
  
            offspring.push(newOffspring);
          }
  
          resolve(offspring);
        }
      });
    };
  
    stepdata = (x: any) => {
      // console.log("step", x);
  
      this.stepdataobj = x;
    };
  
    getstepdata = ($stepdata: any) => {
      // console.log("step data run", stepdataobj.run, stepdataobj.fits);
  
      this.stepdataobj.run = $stepdata.run;
  
      return this.stepdataobj;
    };
  
    run = (complete: any) => {
      // console.log("run org", this.index, active);
  
      if (this.active) {
        this.program.run(
          {
            gen: this.generation,
            index: this.index,
            input: this.input,
            dna: this.dna,
          },
          (x: any) => {
            // console.log("complete run", this.index);
  
            this.runs = x.runs;
            this.fitness = x.avg;
            this.success = x.success;
  
            if (complete) complete();
          }
        );
      }
    };
  
    hardStop = () => {
      // console.log("individual hard stop", this.index);
  
      this.setActive(false);
      this.runs = [];
      this.program.hardStop();
    };
  }
  
  export default Individual;
  