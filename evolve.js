/*

Evolutionary Algorithm modules, and supporting packages

2017 Christopher Polito v1.0

Implemented in a Frontend Angular web application, the Events and React Modules come in handy with respect to the web
application but are not related to the evolutionary algorithm, including them simply reduces dependency requirements

*/


var obj = {};

(function (obj) {


	var sum = function (array, $callback) {

		var sum = 0;

		var callback = function (value, index, array) {

			return value;
		}

		if ($callback) callback = $callback;

		for (var i in array) {

			sum += callback(array[i], i, array);
		}

		return sum;
	}

	var average = function (array, $callback) {

		var total = sum(array, $callback);

		return total/array.length;
	}


	var truncate = function (number, decimal) {
			
		var value = Math.floor(number*Math.pow(10, decimal))/Math.pow(10, decimal);
		
		return value;
	}

	var last = function (array) {

    	return array[array.length-1];
	}


	var shuffle = function (array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

	  	return array;
	}


	var individual = function (params) {
			
		var self = this;

		var i = 0;
		var active = true;

		self.name = params.input.name;

		// console.log(self.name, "create organism");


		var program = params.input.program;
		self.total = params.input.pdata.data.genome;
		self.dna = [];
		self.runs = [];
		self.fitness = 0;
		self.generation = params.gen;
		self.index = params.index;
		self.parents = [];
		var input = params.input;
		var stepdataobj = {
			name:"",
			gen:1,
			org:1,
			run:1
		}


		// reproduction variables
		var crossoverMethod;
		var methodTypes;
		var mutateRate;
		var dnaChainOffset;
		var dnaChainLength;
		// ########


		var getCrossoverParams = function (input) {

			methodTypes = input.crossover.methodTypes;
			crossoverMethod = input.crossover.method;
			mutateRate = input.crossover.mutate;
			dnaChainOffset = input.crossover.splicemin;
			dnaChainLength = input.crossover.splicemax - input.crossover.splicemin;
		}


		getCrossoverParams(input);


		if (params && params.dna) {
			// console.log("has dna", params.dna);
			self.dna = params.dna;
			self.parents = params.parents;
		}
		else {
			// console.log("create dna", pdata);
			i = 0;
			while (i < self.total) {
				self.dna[i] = program.gene();
				i++;
			}
		}

		var mutate = function ($dna) {

			var i = 0;
			while (i < self.total) {
				if (Math.random() < mutateRate) {
					$dna[i] = program.gene();
				}
				i++;
			}

			return $dna;

		}


		var multiParentCrossover = function ($parents) {

			/*

			########
			this function is looped from its caller 

			and delivers individual offspring to its caller
			########

			*/

			var parents = $parents.map(function (value, index) {

				return value;
			});

			// console.log("parents", parents.length);

			var getRandomParent = function () {

				return Math.floor(Math.random()*parents.length);
			}

			
			var offspring = [];
			var $offspring;
			var mates = [];
			var dna = [];
			var mateA;
			var mateB;
			var source;

			// creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
			var c_len = Math.floor(Math.random()*dnaChainLength) + dnaChainOffset;
			// the number of chains there will be per dna strand based on how long the chain is
			var c_num = Math.floor(self.total/c_len);
			var i = 0;

			while (i < c_num) {

				
				do {
					mateA = getRandomParent();
					// console.log("random parent index", mateA);
				} while (mateA == mateB)

				mateB = mateA;
				source = parents[mateA];

				// console.log("source", mateA, parents.length, source ? true : false, parents[mateA] ? true: false);

				if ((i+1)*c_len < self.total) {
					dna = dna.concat(source.dna.slice(i*c_len, (i+1)*c_len));
				}
				else {
					dna = dna.concat(source.dna.slice(i*c_len));
				}

				i++;
			}

			$offspring = new individual({
				gen:self.generation + 1, 
				parents:parents, 
				dna:mutate(dna),
				input:input
			});


			offspring.push($offspring);

			return offspring;


		}

		var multiOffspringCrossover = function ($parents) {


			/*

			########
			this function is looped from its caller 

			but also loops internally 

			and delivers multiple offspring to its caller
			########

			*/


			var parents = $parents.map(function (value, index) {

				return value;
			});

			// console.log("parents", parents.length);

			var getRandomParent = function () {

				return Math.floor(Math.random()*parents.length);
			}


			var mates = [];
			var dna = [];
			var mateA;
			var mateB;
			var source;
			var offspring = [];


			//offspring loop by parent (offspring.length == parent.length, not including self)
			do {


				//a new splice length is chosen for each offspring loop

				dna = [];
				// creates a dna chain that is between dnaChainOffset and (dnaChainOffset + dnaChainLength) in length
				var c_len = Math.floor(Math.random()*dnaChainLength) + dnaChainOffset;
				// the number of chains there will be per dna strand based on how long the chain is
				var c_num = Math.floor(self.total/c_len);
				var i = 0;
				var j = 1;


				//dna splice loop
				while (i < c_num) {

					// new parent chosen from mates pool, make sure not to choose same two in a row
					do {
						mateA = getRandomParent();
						// console.log("random parent index", mateA);
					} while (mateA == mateB)
					mateB = mateA;
					source = parents[mateA]; // current parent to mate with self

					// console.log("source", mateA, parents.length, source ? true : false, parents[mateA] ? true: false);


					// splice procedure
					if ((i+1)*c_len < self.total && (j+1)*c_len < self.total) {
						dna = self.dna.slice(i*c_len, (i+1)*c_len).concat(source.dna.slice(j*c_len, (j+1)*c_len));
					}
					else {
						dna = self.dna.slice(i*c_len).concat(source.dna.slice(j*c_len));
					}

					i++;
					j++;
				}


				// dna length resolution
				if (dna.length < self.total) {
					dna = dna.concat(self.dna.slice(dna.length-1));
				}
				else if (dna.length > self.total) {
					dna.splice(self.total-1, dna.legnth);
				}


				// create new individual from new dna, after mutation, add to array of all offspring
				$offspring = new individual({
					gen:self.generation + 1, 
					parents:[self, source],
					dna:mutate(dna),
					input:input
				});


				offspring.push($offspring);


			} while (offspring.length < $parents.length) // exit loop when # offspring equals # of parents 


		return offspring;


		}

		self.setActive = function () {

			active = true;
		}

		self.reproduce = function (mates) {

			var offspring = [];

			if (crossoverMethod == methodTypes.multiParent) {

				mates.push(self);

				offspring = multiParentCrossover(mates);

			}
			else if (crossoverMethod == methodTypes.multiOffspring) {

				offspring = multiOffspringCrossover(mates);
			}

			return offspring;
		}

		var stepdata = function (x) {

			// console.log("step", x);

			stepdataobj = x;
		}

		self.getstepdata = function ($stepdata) {

			// console.log("step data run", stepdataobj.run, stepdataobj.fits);

			stepdataobj.run = $stepdata.run;

			return stepdataobj;
		}

		self.run = function (complete) {

			// console.log("run org", self.index);

			if (active) {

				program.run({
					gen:self.generation, 
					index:self.index, 
					input:input, 
					dna:self.dna,
					stepdata:stepdata
				}, function (x) {

					// console.log("complete run", self.index);

					self.runs = x.runs;
					self.fitness = x.avg;
					self.success = x.success;

					complete();
				});
			}
		}

		self.hardStop = function () {

			console.log("individual hard stop", self.index);

			active = false;
			self.runs = [];
			program.hardStop();
		}

	}


	var generation = function (params) {
		
		console.log("create generation");

		var self = this;

		var runtimer;
		var active = true;
		var i = 0;
		var indi;
		var input = params.input;
		var task = input.goal;

		// repoduction variables
		var num_parents;
		var pool;
		
		var popThreshold;
		var altPool;
		// ######


		var getCrossoverParams = function (input) {


			num_parents = input.crossover.parents;
			pool = input.crossover.pool;
			
			popThreshold = 10;
			altPool = 0.25;
		}

		getCrossoverParams(input);


		self.total = input.pop;
		self.pop = [];
		self.index = 1;
		self.best;
		self.worst;


		var initializePop = function () {


			indi = 0;

			if (params && params.pop) {
				//console.log("input generation", self.index, "pop", input.pop.length);
				self.pop = params.pop;
				self.total = params.pop.length;
				self.index = params.index;
			}
			else {

				self.pop.length = 0;
				self.pop = null;
				self.pop = [];

				i = 1;
				while (i <= self.total) {
					self.pop[i-1] = new individual({gen:self.index, index:i, input:input});
					i++;
				}
			}


			// console.log("index", self.index, self.total);

			self.best = {
				index:self.index,
				dna:self.pop[0].dna,
				fitness:self.pop[0].fitness,
				runs:self.pop[0].runs
			}

			self.worst = {
				index:self.index,
				dna:self.pop[self.pop.length-1].dna,
				fitness:self.pop[self.pop.length-1].fitness,
				runs:self.pop[self.pop.length-1].runs
			}

		}
		
		initializePop();

		var runPop = function (complete) {

			indi = 0;
			var running = true;
			active = true;

			// console.log("run population");

			runtimer = setInterval(function () {


				if (active) {

					if (running) {

						running = false;

						self.pop[indi].setActive();

						self.pop[indi].run(function () {

							indi++;

							if (indi < self.total) {
								running = true;
							}
							else {
								clearInterval(runtimer);
								runtimer = {};
								runtimer = null;

								complete();
							}
						});

					}
				}

			}, 10);
					

		}


		var rank = function () {

			self.pop.sort(function (a,b) {
				return (task == "min" ? a.fitness - b.fitness : b.fitness - a.fitness);
			});


			self.pop.map(function(value, index) {

				value.index = index;
			});


			var best = self.pop[0];
			var worst = self.pop[self.pop.length-1];

			self.best = {
				index:self.index,
				dna:best.dna,
				fitness:best.fitness,
				runs:best.runs
			}

			self.worst = {
				index:self.index,
				dna:worst.dna,
				fitness:worst.fitness,
				runs:worst.runs
			}

			return {
				best:self.best,
				worst:self.worst
			}
		}
			

		var select = function (number, standard) {


			var normalStand = standard*self.total/100

			var pool = self.pop.filter(function (value, index) {

				return index < Math.floor(normalStand*self.total);
			})

			if (!pool) {

				return;
			}


			var indexes = [];
			var match;

			do {

				do {
					
					index = Math.floor(Math.random()*pool.length);

					match = indexes.find(function(p) {

						return p == index;
					});

				} while (match >= 0);

				indexes.push(index);

			} while (indexes.length < number);


			var parents = indexes.map(function (value, index) {

				return pool[value];
			})

			parents.sort(function (a, b) {

				return b.fitness - a.fitness;
			})

			// console.log("select", self.pop.length, pool.length, number, parents.length);

			return parents;

		}

		var reproduce = function (_parents, standard) {

			var parents = [];
			var mates = [];
			var children = [];
			var offspring;


			do {

				if (active) {

					parents = select(_parents, standard);

					if (parents.length == 0) {

						break;
					}

					// console.log("parents", num_parents, standard, parents.length);

					male = parents[0];
					mates = parents.slice(1);

					offspring = male.reproduce(mates);

					offspring.map(function (value, index) {

						value.index = children.length + index + 1;

					});

					children = children.concat(offspring);

				}

			} while (children.length < self.total)

			if (children.length == 0) {

				return;
			}

			// console.log("total children", children.length);

			return children;
		}

		self.turnover = function ($input, complete) {

			console.log("turnover", self.index);

			input = $input;

			getCrossoverParams(input);

			runPop(function () {

				var ext = rank();

				var standard = self.total <= popThreshold ? altPool : pool;

				// console.log("number of parents", num_parents, standard);

				var children = reproduce(num_parents, standard);

				if (children.length == 0) {

					complete({
						previous:{
							best:ext.best,
							worst:ext.worst
						},
						next:null
					})
				}

				complete({
					previous:{
						best:ext.best,
						worst:ext.worst
					},
					next:new generation({index:self.index + 1, input:input, pop:children})
				});

			});

		}

		this.getstepdata = function (stepdata) {

			stepdata.org = indi;

			stepdata = self.pop[indi].getstepdata(stepdata);

			return stepdata;
		}

		this.hardStop = function () {

			console.log("generation hard stop", indi);

			active = false;
			clearInterval(runtimer);
			runtimer = null;
			if (self.pop[indi]) self.pop[indi].hardStop();
			//initializePop();
		}
		
	}


	var evolveModule = function () {

		var self = this;


		var era = [];
		var now = 1;
		var active = true;
		
		var stepdataobj = {
			name:"",
			gen:now + 1,
			org:1,
			run:1
		}

		var previous = {
			index:0,
			best:{},
			worst:{},
			pop:[]
		}

		var previous;


		self.input = {};

		var index = function ($now) {

			return $now - 1;
		}
		
		var step = function () {

			console.log(" ");
			console.log("evolve", now);

			if (active) {

				stepdataobj.gen = now;

				era[index(now)].turnover(self.input, function (x) {

					now++;

					previous = x.previous;
						
					if (x.next) {
						era[index(now)] = x.next;
					
						// console.log("running evolve", self.input);

						if (self.input && self.input.setEvdata) {
							self.input.setEvdata({
								index:now,
								best:previous.best,
								worst:previous.worst
							})
						}

						if (now <= self.input.gens) {
							setTimeout(function () {
								step();
							}, self.input.evdelay);
						}
						else {

							if (self.input && self.input.completeEvolve) {
								self.input.completeEvolve();
							}
						}

					}
					else {

						self.hardStop(self.input);
					}

				});
			}

		}

		self.getstepdata = function () {

			stepdataobj = era[index(now)].getstepdata(stepdataobj);

			return stepdataobj;
		}

		self.running = function () {

			return active && (now < self.input.gens);
		}

		self.getBest = function () {

			return {
				index:self.index,
				best:{
					dna:previous.best.dna,
					runs:previous.best.runs,
					fitness:previous.best.fitness
				},
				worst:{
					dna:previous.best.dna,
					runs:previous.worst.runs,
					fitness:previous.worst.fitness
				}
			};
		}

		self.set = function (_input) {

			self.input = _input;
		}

		self.initialize = function (_input) {

			console.log("initialize evolve");

			self.set(_input);

			era = null;
			era = [];
			now = 1;
			active = true;

		
			era[index(now)] = new generation({index:now, input:self.input});

			return era[index(now)].length == self.input.pop;
			
		}

		self.run = function (_input) {

			console.log("restart evolve");

			if (_input.goal != self.input.goal || _input.pop != self.input.pop) {
				console.log("inputs are not equal", _input.pop, self.input.pop, "reinitialize");
				return false;
			}
			else {


				console.log("inputs are equal", _input.pop, self.input.pop, "run");
				active = true;
				this.set(_input);
				step();
				return true;
			}
			

		}

		self.hardStop = function (_input) {

			console.log("evolve hard stop", _input, self.input);

			self.set(_input);
			active = false;
			if (era[index(now)]) era[index(now)].hardStop();

			if (self.input && self.input.setEvdata) {
				self.input.setEvdata({
					index:now,
					best:previous.best,
					worst:previous.worst
				})
			}

		}

	}


	obj.evolve = {
		module:evolveModule
	}




})(obj);


try {
	window.evolve = obj.evolve;
}
catch(e) {
	console.log(e.message);
}

try {
	module.exports = obj.evolve;
}
catch (e) {
	console.log(e.message);
}





