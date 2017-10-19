/*

Evolutionary Algorithm modules, and supporting packages

2017 Christopher Polito v1.0

Implemented in a Frontend Angular web application, the Events and React Modules come in handy with respect to the web
application but are not related to the evolutionary algorithm, including them simply reduces dependency requirements

*/


(function (window) {


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

		console.log(self.name, "create organism");

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

		if (params && params.dna) {
			self.dna = params.dna;
			self.parents = params.parents;
		}
		else {
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

		self.run = function (complete) {

			//console.log("run org", self.index);

			if (active) {

				program.run({
					gen:self.generation, 
					index:self.index, 
					input:input, 
					dna:self.dna
				}, function (x) {

					self.runs = x.runs;
					self.fitness = x.avg;
					self.success = x.success;

					complete();
				});
			}
		}

		self.hardStop = function () {

			active = false;
		}

	}


	var generation = function (params) {
			
		var self = this;

		var runtimer;
		var active = true;
		var i = 0;
		var indi = 0;
		var input = params.input;
		var task = input.goal;
		self.total = input.pop;
		self.pop = [];
		self.index = 1;
		
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
			self.pop[i].index = i;
			//self.pop[i].print();
			i++;
		}

		var runPop = function (complete) {

			indi = 0;
			var running = true;

			console.log("run population");

			runtimer = setInterval(function () {

				if (running) {

					running = false;

					// console.log("self.pop", self.pop, org);

					if (active) {

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

			self.pop.forEach(function (value, index, array) {

				value.index = index;
			});

			//console.log(self.pop[0].fitness);
			//console.log(self.pop[self.total-1].fitness);

			return {
				best:self.pop[0],
				worst:self.pop[self.total-1]
			}
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

		self.turnover = function (complete) {

			console.log("turnover", self.index);

			runPop(function () {

				var ext = rank();

				console.log("push evdata");

				// react.push({
				// 	name:"ev." + input.name,
				// 	state:{
				// 		index:self.index,
				// 		best:ext.best,
				// 		worst:ext.worst
				// 	}
				// });

				input.setEvdata({
					index:self.index,
					best:ext.best,
					worst:ext.worst
				})

				var num_parents = 2;
				var children = reproduce(num_parents);

				complete({
					next:new generation({index:self.index + 1, input:input, pop:children})
				});

			});

		}

		this.hardStop = function () {

			active = false;

			clearInterval(runtimer);

			self.pop[indi].hardStop();

		}
		
	}


	var evolveModule = function () {

		var self = this;


		var era = [];
		var now = 0;
		var input;
		var active = true;
		
		this.step = function () {

			console.log(" ");
			console.log("evolve", now);

			if (active) {

				era[now].turnover(function (x) {

					now++;

					era[now] = x.next;

					if (now < input.gens) {
						setTimeout(function () {
							self.step();
						}, input.evdelay);
					}
					else {
						input.completeEvolve("finished");
					}

				});
			}
			else {
				input.completeEvolve("finished");
			}

		}

		this.set = function (_input) {

			input = _input;
		}

		this.initialize = function (_input) {

			console.log("initialize evolve");

			self.set(_input);

			now = 0;

			era.length = 0;
			era = null;
			era = [];

			era[0] = new generation({index:1, input:input});
		}

		this.run = function (_input) {

			console.log("run evolve");

			if (_input.goal != input.goal || _input.pop != input.pop) {
				console.log("restart evolve");
				self.initialize(_input);
				self.run(_input);
			}
			else {
				self.set(_input);
				self.step();
			}
		}

		this.hardStop = function (_input) {

			this.set(_input);

			active = false;

			era[now].hardStop();
		}

	}


	window.evolve = {
		module:new evolveModule()
	}




})(window);