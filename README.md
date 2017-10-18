
#  Evolutionary Algorithm


This repo is an evolutionary algorithm built into a JavaScript module

It contains a module for the Individual, the Population (Generation), and a module for the main running program called Evolve

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
	
	program:program, // the module for the problem being optimized, must export a "gene" function and a "run" function
	
	setEvdata:setEvdata, // function to be called after each generation has run, outputs best and worst individual
	
	completeEvolve:completeEvolve // function to be called when evolution process is stopped either automatically or manually

}

evolve.module.initialize(input);

then start the evolution process like this:

evolve.module.run(input);