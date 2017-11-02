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

		var pdata = params.input.pdata;
		var program = params.input.program;
		self.total = pdata.genome;
		self.dna = [];
		self.runs = [];
		self.fitness = 0;
		self.generation = params.gen;
		self.index;
		self.parents = [];
		var input = params.input;
		var stepdataobj = {
			name:"",
			gen:1,
			org:1,
			run:1
		}



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

		var mutate = function (dna) {

			var i = 0;
			while (i < self.total) {
				if (Math.random() < 0.02) {
					dna[i] = program.gene();
				}
				i++;
			}

			return dna;

		}

		var createChild = function (dna, parents) {

			//console.log("create child");

			var child = {};

			var mIndex = Math.floor(Math.random()*parents.length);

			source = parents[mIndex].dna;

			if (dna.length < self.total) {
				dna  = dna.concat(source.slice(dna.length - 1, self.total-1));
			}
			else if (dna.length > self.total) {
				dna.splice(self.total-1, dna.length - self.total);
			}

			if (dna.length == self.total) {

				child = new individual({
					gen:self.generation + 1, 
					parents:parents, 
					dna:mutate(dna), 
					input:input
				});
			}
			else {
				console.log("wrong length");
			}

			return child;

		}

		var crossover = function (parents) {

			//console.log("crossover", parents.length);

			var dna = [];
			var mates = [];

			for (var k = 0; k < parents.length; k++) {
				dna[k] = [];
			}

			for (var k = 0; k < parents.length; k++) {
				mates[k] = k;
			}

			var c_num = Math.floor(Math.random()*10) + 2;
			var c_len = Math.floor(self.total/c_num);
			var i = 0;
			var j = 0;
			var dna_i = 0;

			while (i < c_num) {

				shuffle(mates);

				while (j < c_len) {

					dna_i = i*c_len + j;

					for (k in dna) {
						dna[k][dna_i] = parents[mates[k]].dna[dna_i];
					}

					j++;
				}

				i++;
				j = 0;

			}

			return dna;

		}

		self.reproduce = function (mates) {

			//console.log(mates)

			mates.push(self);

			//console.log("reproduce", parents);

			var dna = crossover(mates);

			var offspring = [];

			for (var i = 0; i < mates.length; i++) {
				offspring.push(createChild(dna[i], mates));
			}

			//console.log("offspring", offspring.length);

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
				i = 0;
				while (i < self.total) {
					self.pop[i] = new individual({gen:self.index, input:input});
					i++;
				}
			}

			i = 0;
			while (i < self.total) {
				self.pop[i].index = i+1;
				//self.pop[i].print();
				i++;
			}

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

			ext = {
				best:self.best,
				worst:self.worst
			}

		}
		
		initializePop();

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

		var runPop = function (complete) {

			indi = 0;
			var running = true;
			active = true;

			console.log("run population");

			runtimer = setInterval(function () {

				if (running) {

					running = false;

					// console.log("self.pop", self.pop, org);

					if (active) {

						self.pop[indi].run(function () {

							rank();

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

		var getIndex = function (factor) {
			return Math.floor(Math.random()*self.total*factor);
		}

		var indexExists = function (index, array) {

			for (i in array) {

				if (index == array[i]) {
					return true;
				}
			}

			return false;
		}

		var getPIndex = function (pIndex, standard) {

			var index;

			do {
				index = getIndex(standard);
			} while (indexExists(index, pIndex));

			pIndex.push(index);

			return pIndex;

		}

		var select = function (num_parents) {

			var standard = self.total > 10 ? 0.2 : 0.5;

			var pIndex = [];
			var parents = [];

			for (var i = 0; i < num_parents; i++) {
				pIndex = getPIndex(pIndex, standard);
				parents.push(self.pop[last(pIndex)]);
			}

			return parents
		}

		var reproduce = function (num_parents) {

			var parents = [];
			var mates = [];
			var children = [];
			var offspring = [];

			
			// var num_parents = Math.min(_parents, Math.floor(self.total*standard/5));

			// var i = 0;
			// var more = true;
			while (children.length < self.total) {

				parents = select(num_parents);

				offspring = parents[0].reproduce([parents[1]]);
				children = children.concat(offspring);

			}

			children = children.slice(0, self.total);

			console.log("total children", children.length);

			return children;
		}

		var getGeneration = function () {

			var generation = {};
			generation.pop = [];
			generation.index = self.index;
			generation.best = this.best;
			generation.worst = this.worst;

			for (var i in self.pop) {

				generation.pop.push({
					index:i,
					dna:self.pop[i].dna,
					fitness:self.pop[i].fitness,
					runs:self.pop[i].runs
				})
			}

			return generation;
		}

		self.turnover = function (complete) {

			console.log("turnover", self.index);

			runPop(function () {

				var generation = getGeneration();


				var num_parents = 2;
				var children = reproduce(num_parents);

				complete({
					generation:generation,
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
			self.pop[indi].hardStop();
			initializePop();
		}
		
	}


	var evolveModule = function () {

		var self = this;


		var current;
		var now = 0;
		var active = true;
		
		var stepdataobj = {
			name:"",
			gen:now + 1,
			org:1,
			run:1
		}

		var ext = {
			index:0,
			best:{
				index:0,
				dna:[],
				fitness:0,
				runs:[]
			},
			worst:{
				index:0,
				dna:[],
				fitness:0,
				runs:[]
			}
		};

		var previous = {
			index:0,
			best:{},
			worst:{},
			pop:[]
		}


		var input = {};
		
		var step = function () {

			console.log(" ");
			console.log("evolve", now);

			if (active) {

				current.turnover(function (x) {

					now++;

					previous = x.generation;
					current = null;
					current = x.next;


					if (input.setEvdata) {
						input.setEvdata({
							index:now-1,
							best:previous.best,
							worst:previous.worst
						})
					}

					if (now < input.gens) {
						setTimeout(function () {
							step();
						}, input.evdelay);
					}
					else {

						if (input.completeEvolve) {
							input.completeEvolve();
						}
					}

				});
			}

		}

		this.getstepdata = function () {

			stepdataobj.gen = now;

			stepdataobj = current.getstepdata(stepdataobj);

			return stepdataobj;
		}

		this.running = function () {

			return active && (now < input.gens);
		}

		this.setLatest = function (x) {

			current = x;
		}

		this.getLatest = function () {

			return previous;
		}

		this.getBest = function (gen) {

			console.log("get best", gen);

			// return era[gen].getRank();
			return {
				index:self.index,
				best:{
					runs:ext.best.runs,
					fitness:ext.best.fitness
				},
				worst:{
					runs:ext.worst.runs,
					fitness:ext.worst.fitness
				}
			};
		}

		this.set = function (_input) {

			input = _input;
		}

		this.initialize = function (_input) {

			console.log("initialize evolve");

			self.set(_input);

			now = 0;
			active = true;

			current = null;
			
			if (_input.generation) {
				current = new generation({index:_input.gen, pop:_input.generation.pop, input:input});
			}
			else {
				current = new generation({index:1, input:input});
			}
		}

		this.run = function (_input) {

			console.log("run evolve module", _input, input);

			active = true;

			// if (!self.input || _input.goal != self.input.goal || _input.pop != self.input.pop) {
			// 	console.log("restart evolve");
			// 	self.initialize(_input);
			// 	self.run(_input);
			// }
			// else {
			// 	self.set(_input);
			// 	self.step();
			// }

			self.set(_input);
			step();

		}

		this.restart = function (_input) {

			now = input.gens;

			if (_input.goal != input.goal || _input.pop != input.pop) {
				console.log("restart evolve");
				self.initialize(_input);
				self.run(_input);
			}
			else {
				self.set(_input);
				step();
			}

		}

		this.hardStop = function (_input) {

			console.log("evolve hard stop", _input);

			self.set(_input);
			active = false;
			current.hardStop();

			if (input.setEvdata) {
				input.setEvdata({
					index:now-1,
					best:previous.best,
					worst:previous.worst
				})
			}

		}

	}


	obj.evolve = {
		module:new evolveModule()
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





