
#  Evolutionary Algorithm


This library can optimize your agent's performance by way of an evolutionary algorithm, a model of biological evolution: rank fitness, crossover of best performing, mutation, run next generation.

You provide the environment, or "program" as the property is called, (problem to optimze, machine to teach, etc) and a way to calculate and rank fitness, and this algorithm will handle crossover, mutation, and the automatic generation cycles.

It can be implemented on the frontend of any JavaScript web application or on the server itself in a NodeJS application, which of course provides much higher performance. This algorithm is highly computationally intensive and will take time to complete the sufficient generations that will give an optimum solution, but the results are worth it.  

To implement the algorithm on the frontend, create an object with the following properties and call these functions:

	var input = {
		name:"description string",
		gens:100, // total generations
		runs:20, // runs of scenerio per individual
		goal:"max", // "min" and "max" determine internally if the population is ranked by highest or lowest fitness, depending on the goal of the evolution process
		pop:100, // total individuals in population
		evdelay:0, // delay between the completion of one generation and beginning of the next, 0 for no delay 
		pdata:pdata, // any supporting data for the problem being optimized, this is passed through to the program that is calculating fitness while the algorithm is running
		program:program, // the module for the problem being optimized, details below
		setEvdata:setEvdata, // callback function to set a value to a local variable in your code and do any post processing. This is called after each generation is run, outputs 
								best and worst individuals 
		completeEvolve:completeEvolve // callback function to be called when evolution process is stopped either automatically or manually
	}

	var evolution = new evolve.module();

	evolution.set(input);

	evolution.initialize(input);

then start the evolution process like this:

	evolution.run(input);


You can stop the evolution process by calling:

	evolution.hardStop(input);


Then if you want to restart:

	evolution.restart(input); //the total generations to be calculateed can be changed (increased), and the runs per individual, but note that if the goal for the process 
									changes (i.e. max to min), or the size of the population changes, the process will be started from the first generation.


The accompanying program that represents the problem being optimized must adhere to the following API:

It must expose the following public functions, each will be called at some point in the evolutionary algorithm process:

	{
		run:run, // this function will be called to run the evolution process, it may invoke further processes in whatever way it requires to calculate fitness for the individual
		instruct:instruct, // this function will be called to set the plan being tested for fitness, or when running a simulation of a final result 
		stepdata:stepdata, // this function can be used to return realtime data of evolution process, a global object can be set by the run process which is then returned by this 
								function in intervals by your main software 
		gene:gene, // this generates and returns a single new gene, an individual piece of dna
		hardStop:hardStop, // this is called to stop the process immediately
		reset:reset // this is called to reset the program to it's original state
	} 


There are a few caveates about the input object for the this package. The program, setEvdata callback, and the completeEvolve callback need to be handled differently depending on whether the evolutionary algorithm and this package run on the frontend or the backend. If the application runs on the frontend, then all three can be included in the input object directly. Obviously, if implementing on the backend, you cannot send module and function objects over an http request. So you will have to devise a way to retrieve your program (already on the backend) when you send this input object and intialize everything. As for the setEvdata callback, this data refers to the best individual of each generation. All that has to be done is to recursively make an http request to an api that calls and returns evolve.module.getBest(). Same for completeEvolve, write a recurive http request that calls and returns evolve.module.running() and when it returns false, simply call whatever function you would have included as your callback in the input object (this will work if the process is stopped automatically or manually).


There are other things to consider for a backend implementation, if there any questions, please don't hesitate to send me an email. When I have the time, I plan on expounding on the wiki and an robust api reference.


chris@mwithc.io



Visit https://evolve.methodswithclass.com to see how this package can be applied to various problems like machine learning and image recognition. 

