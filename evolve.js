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
		self.index = params.index;
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

		self.setActive = function () {

			active = true;
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
				i = 1;
				while (i <= self.total) {
					self.pop[i-1] = new individual({gen:self.index, index:i, input:input});
					i++;
				}
			}

			// i = 0;
			// while (i < self.total) {
			// 	self.pop[i].index = i+1;
			// 	//self.pop[i].print();
			// 	i++;
			// }

			console.log("index", self.index, self.total);

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

			// console.log("run population");

			runtimer = setInterval(function () {

				if (running) {

					running = false;

					// console.log("self.pop", self.pop, indi);

					if (active) {

						// console.log("run individual", indi);

						self.pop[indi].setActive();

						self.pop[indi].run(function () {

							indi++;

							// console.log("run next individual", indi);

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

		var select = function (number, standard) {

			var num_i = number;

			var pIndex = [];
			var parents = [];

			for (var i = 0; i < num_i; i++) {
				pIndex = getPIndex(pIndex, standard);
				parents.push(self.pop[last(pIndex)]);
			}

			return parents
		}

		// var select = function (num_parents) {

		// 	var standard = self.total > 10 ? 0.2 : 0.5;

		// 	var pIndex = [];
		// 	var parents = [];

		// 	for (var i = 0; i < num_parents; i++) {
		// 		pIndex = getPIndex(pIndex, standard);
		// 		parents.push(self.pop[last(pIndex)]);
		// 	}

		// 	return parents
		// }




		var reproduce = function (_parents, standard) {

			var parents = [];
			var mates = [];
			var children = [];
			var offspring = [];
			var num_children = 0;
			
			var num_parents = Math.min(_parents, Math.floor(self.total*standard/5));

			var i = 0;
			var more = true;
			while (more) {

				//console.log("set", i, "size", num_parents);

				if (i + num_parents >= self.total) {
					num_parents = self.total - i;
					more = false;
				}

				i = i + num_parents;

				parents = select(num_parents, standard);

				male = parents[0];
				mates = parents.slice(1);

				offspring = male.reproduce(mates);

				offspring.forEach(function (value, index) {

					value.index = num_children + index + 1;
				})

				children = children.concat(offspring);
				
				num_children = children.length;

			}

			console.log("total children", children.length);

			return children;
		}

		// var reproduce = function (num_parents) {

		// 	var parents = [];
		// 	var mates = [];
		// 	var children = [];
		// 	var offspring = [];

			
		// 	// var num_parents = Math.min(_parents, Math.floor(self.total*standard/5));

		// 	// var i = 0;
		// 	// var more = true;
		// 	while (children.length < self.total) {

		// 		parents = select(num_parents);

		// 		offspring = parents[0].reproduce([parents[1]]);
		// 		children = children.concat(offspring);

		// 	}

		// 	children = children.slice(0, self.total);

		// 	console.log("total children", children.length);

		// 	return children;
		// }

		var getGeneration = function () {

			var ext = rank();

			var thisGen = {};
			thisGen.index = self.index;
			thisGen.best = ext.best;
			thisGen.worst = ext.worst;

			return thisGen;
		}

		self.turnover = function (complete) {

			console.log("turnover", self.index);

			runPop(function () {

				var thisGen = getGeneration();


				// var num_parents = 2;
				// var children = reproduce(num_parents);

				var _parents = 2;
				var standard = self.total > 10 ? 0.2 : 0.5;

				var children = reproduce(_parents, standard);

				complete({
					generation:thisGen,
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
			initializePop();
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

				era[index(now)].turnover(function (x) {

					now++;

					previous = x.generation;
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

			return era.length == self.input.pop;
			
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





