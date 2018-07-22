/*

Evolutionary Algorithm modules, and supporting packages

2018 Christopher Polito v5.0.1

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
		self.currentGen = params.curentGen;
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

			methodTypes = input.methodTypes;


			if (methodTypes === undefined) {
				
				methodTypes = {
					default:"multi-parent",
					multiParent:"multi-parent",
					multiOffspring:"multi-offspring"
				}
			}

			crossoverMethod = input.method;
			mutateRate = input.mutate;
			dnaChainOffset = input.splicemin;
			dnaChainLength = input.splicemax - input.splicemin;
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

				if ((i+1)*c_len <= self.total) {
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

		self.setActive = function ($active) {

			active = $active;
		}


		self.reproduce = function (parents) {


			parents.push(self);


			var getRandomParent = function () {

				return Math.floor(Math.random()*parents.length);
			}


			return new Promise(function (resolve, reject) {


				if (crossoverMethod == methodTypes.multiParent) {


					// console.log("reproduce multi parent", parents.length);


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

						// console.log("parents", parents.length, "source index", mateA, "source parent", source ? true : false);

						if ((i+1)*c_len <= self.total) {
							dna = dna.concat(source.dna.slice(i*c_len, (i+1)*c_len));
						}
						else {
							dna = dna.concat(source.dna.slice(i*c_len));
						}

						i++;
					}

					// console.log("dna", dna ? true : false);

					$offspring = new individual({
						gen:self.generation + 1, 
						parents:parents, 
						dna:mutate(dna),
						input:input
					});

					offspring.push($offspring);


					return resolve(offspring);

				}
				else if (crossoverMethod == methodTypes.multiOffspring) {



					var mates = [];
					var dna = [];
					var mateA;
					var mateB;
					var source;
					var offspring = [];


					//offspring loop by parent (offspring.length == parent.length, not including self)
					while (offspring.length <= parents.length) {


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


					}

					return resolve(offspring);

				}


			});


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

			// console.log("run org", self.index, active);

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

					if (complete) complete();

				});
			}
		}

		self.hardStop = function () {

			// console.log("individual hard stop", self.index);

			self.setActive(false);
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


		var types = input.processTypes;
		var reproductionTypes = input.reproductionTypes;
		
		if (types === undefined) {

			types = {
				default:"async",
				sync:"sync",
				async:"async"
			}

		}

		if (reproductionTypes === undefined) {

			reproductionTypes = {
				default:"async",
				sync:"sync",
				async:"async"
			}
		}


		var selectAsync = false;


		var type = input.runPopType;
		var reproductionType = input.reproductionType;

		// console.log("type", type);

		var getCrossoverParams = function (input) {


			num_parents = input.parents;
			pool = input.pool;
			
			var tempPool = input.pop*input.pool;

			if (tempPool < num_parents*5) {

				pool = input.pool*5;
			}

			// popThreshold = 10;
			// altPool = 0.25;
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
					self.pop.push(new individual({gen:self.index, index:i, input:input}));
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


			var runIndi = function (i) {

				// console.log("get indi");

				return new Promise(function (resolve, reject) {

					// console.log("run indi", i, self.pop.length);
					self.pop[i].run(function () {

						// console.log("resolve", i);
						resolve(i);
					})

				})
			}


			self.setActive(true);

			var i = 0;

			var finished = [];

			while (i < self.total) {

				// console.log("indi", i, active);

				if (active) {

					runIndi(i)
					.then(function (i) {

						finished.push(i);

						// console.log("completed indi", finished.length, self.pop.length);

						if (finished.length == self.pop.length) {

							// console.log("run complete for generation", self.index);

							complete();
						}
					})
					.catch(function (err) {

						console.log("Error in promise:", err);

					})


					i++
				}

			}


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
				runs:best.runs,
				success:best.success
			}

			self.worst = {
				index:self.index,
				dna:worst.dna,
				fitness:worst.fitness,
				runs:worst.runs,
				success:worst.success
			}

			return {
				best:self.best,
				worst:self.worst
			}
		}



		var select = function (number, _pool) {


			// var normalStand = _pool*self.total/100

			var $pool = self.pop.filter(function (value, index) {

				return index < Math.floor(_pool*self.total);
			})

			if (!$pool) {

				return;
			}


			var indexes = [];
			var match;
			var index;


			do {

				do {
					
					index = Math.floor(Math.random()*$pool.length);

					match = indexes.find(function(p) {

						return p == index;
					});

				} while (match >= 0);

				indexes.push(index);

			} while (indexes.length < number);


			var parents = indexes.map(function (value, index) {

				return $pool[value];
			})

			parents.sort(function (a, b) {

				return b.fitness - a.fitness;
			})

			// console.log("select", self.pop.length, pool.length, number, parents.length);

			return parents;

		}
			

		// var select = function (number, _pool) {


		// 	// var normalStand = _pool*self.total/100

		// 	var $pool = self.pop.filter(function (value, index) {

		// 		return index < Math.floor(_pool*self.total);
		// 	})

		// 	if (!$pool) {

		// 		return;
		// 	}


		// 	var indexes = [];
		// 	var match;
		// 	var index;


		// 	var getIndexAsync = function ($indexes) {

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

			

		// 	var parents = indexes.map(function (value, index) {

		// 		return $pool[value];
		// 	})

		// 	parents.sort(function (a, b) {

		// 		return b.fitness - a.fitness;
		// 	})

		// 	// console.log("select", self.pop.length, pool.length, number, parents.length);

		// 	return parents;

		// }

		var reproduce = function (_parents, _pool) {

			var parents = [];
			var mates = [];
			var children = [];
			var childrenPromise;

			var i = 0;

			// console.log("reproduce", _parents, _pool, active);

			if (active) {

				while (i < self.total) {


					parents = select(_parents, _pool);

					if (parents.length == 0) {

						break;
					}

					// console.log("parents", num_parents, _pool, parents.length, parents);

					male = parents[0];
					mates = parents.slice(1);

					// console.log("male", male);

					childrenPromise = male.reproduce(mates)
					.then(function (offspring) {


						offspring.map(function (value, index) {

							value.index = children.length + index + 1;

						});

						children = children.concat(offspring);

						// console.log("children", children.length);

						return children.length;

					})
					.then(function (j) {

						if (j == self.total) {

							return children
						}
					})
					.catch(function (err) {

						console.log("Error in promise:", err);
					})

					// console.log("after then");

					i++;

				}


				return childrenPromise;


			}

			
		}

		self.turnover = function ($input, complete) {

			console.log("turnover", self.index);

			input = $input;

			getCrossoverParams(input);


			runPop(function () {

				var ext = rank();



				reproduce(num_parents, pool)
				.then(function ($children) {

					complete({
						rank:{
							best:ext.best,
							worst:ext.worst
						},
						previous:self,
						next:($children.length == 0 ? self : (new generation({index:self.index + 1, input:input, pop:$children})))
					});
					
				})
				.catch(function (err) {

					console.log("Error in promise:", err);
				})


			});

		}

		this.setActive = function ($active) {

			active = $active;

			self.pop.forEach((p) => {

				p.setActive($active);
			})
		}

		this.getstepdata = function (stepdata) {

			stepdata.org = indi;

			stepdata = self.pop[indi].getstepdata(stepdata);

			return stepdata;
		}

		this.hardStop = function () {

			// console.log("generation hard stop", indi);

			self.setActive(false);
			clearInterval(runtimer);
			runtimer = null;
			self.pop.forEach((p) => {

				p.hardStop();
			})
		}
		
	}


	var evolveModule = function () {

		var self = this;


		// var era = [];
		var now = 1;
		var active = true;
		
		var stepdataobj = {
			name:"",
			gen:now,
			org:1,
			run:1
		}

		var previous = {
			index:0,
			best:{},
			worst:{},
			pop:[]
		}

		var rank;
		var previous;
		var current;

		var check = 0;
		var called = 0;


		self.input = {};

		var index = function ($now) {

			return $now - 1;
		}

		var setActive = function ($active) {

			active = $active;
			if (current.setActive) current.setActive($active);
			if (previous.setActive) previous.setActive($active);
		}
		
		var step = function () {

			console.log(" ");
			console.log("evolve", now);

			if (active) {

				stepdataobj.gen = now;

				current.turnover(self.input, function (x) {

					now++;

					rank = x.rank;
					previous = x.previous;

					console.log("best", rank.best.fitness);
						
					if (x.next) {
						// era[index(now)] = x.next;
						current = x.next;
					
						// console.log("running evolve", self.input);

						if (now <= self.input.gens && !rank.best.success) {
							setTimeout(function () {
								step();
							}, self.input.programInput.evdelay);
						}
						else {
							self.hardStop(self.input);
						}
						

					}
					else {

						self.hardStop(self.input);
					}

				});
			}

		}

		self.getstepdata = function () {

			// stepdataobj = era[index(now)].getstepdata(stepdataobj);

			stepdataobj = (typeof currrent !== "undefined") ? current.getstepdata(stepdataobj) : stepdataobj;

			return stepdataobj;
		}

		self.running = function () {

			return active && (now <= self.input.gens);
		}

		self.getBest = function () {

			return {
				index:self.index,
				best:{
					dna:rank.best.dna,
					runs:rank.best.runs,
					fitness:rank.best.fitness
				},
				worst:{
					dna:rank.worst.dna,
					runs:rank.worst.runs,
					fitness:rank.worst.fitness
				}
			};
		}

		self.set = function (_input) {

			self.input = _input;
		}

		self.initialize = function (_input) {

			console.log(" ");
			console.log("initialize evolve");

			self.set(_input);
			now = 1;
			current = new generation({index:now, input:self.input});
			setActive(true);
			return now == self.input.pop;
		}

		self.run = function (_input) {

			console.log(" ");
			console.log("restart evolve");

			if (_input.goal != self.input.goal || _input.pop != self.input.pop) {
				console.log("inputs are not equal", _input.pop, self.input.pop, "reinitialize");
				return false;
			}
			else {


				console.log("inputs are equal", _input.pop, self.input.pop, "run");
				setActive(true);
				this.set(_input);
				step();
				return true;
			}
			

		}

		self.hardStop = function (_input) {

			console.log("evolve hard stop", self.input.gens);

			self.set(_input);
			setActive(false);

			current.hardStop();
			previous.hardStop();

			if (self.input && self.input.setEvdata) {
				self.input.setEvdata({
					index:now,
					best:rank.best,
					worst:rank.worst
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





