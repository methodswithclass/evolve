
#  Evolutionary Algorithm


This repo is an evolutionary algorithm built into a JavaScript module

It contains a module for the Individual, the population (generation), and a module for the main running program called "evolve"

Evolutionary Algorithms can be used to solve complex optimization problems where the parameters do not reveal an obvious path to maximum or minimum solutions

To instantiate the Evolve program, create a new object with the following inputs in the following way:

	var input = {
		name:"description string",
		gens:100, // total generations
		runs:20, // runs of scenerio per individual
		goal:"max", // if algorithm is finding a maximum or minimum
		pop:100, // total individuals in population
		evdelay:0, // delay between the completion of one generation and beginning of the next 
		pdata:pdata, // any supporting data for the problem being optimized
		program:program, // the module for the problem being optimized, details below
		setEvdata:setEvdata, // callback function to set a value to a local variable in your code and do any post processing. This is called after each generation is run, outputs 
								best and worst individuals 
		completeEvolve:completeEvolve // callback function to be called when evolution process is stopped either automatically or manually
	}

	evolve.module.set(input);

	evolve.module.initialize(input);

then start the evolution process like this:

	evolve.module.run(input);



You can stop the evolution process by calling:

	evolve.module.break(input);


Then if you want to restart:

	evolve.module.restart(input); //the total generations to be calculateed can be changed (increased), and the runs per individual, but note that if the goal for the process 
									changes (i.e. max to min), or the size of the population changes, the process will be started from the first generation.


The accompanying program that represents the problem being optimized must adhere to the following API:

It must export or return the following public functions:

	{
		run:run, // this function will be called to run the evolution process
		instruct:instruct, // this function will be called to set the dna when running a scenario 
		stepdata:stepdata, // this function is called to get realtime data of the generation, individual index, run number, etc. 
		gene:gene, // this generates a new gene, an individual piece of dna
		simulate:simulate, // this is called when running the final result of the evolution process with an optimized individual's dna
		hardStop:hardStop, // this is called to stop the process immediately, any process started by the run function should be stopped by this call immediately
		reset:reset // this is called to reset the program to it's original state
	} 


Visit https://evolve.methodswithclass.com to see how this package can be applied to various problems like machine learning and image recognition. 

