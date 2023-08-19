# Evolutionary Algorithm

This library optimizes a strategy to solve a problem by way of an evolutionary algorithm, a model of biological evolution: rank fitness, crossover of best performing, mutation, run next generation.

The initial generation is made up of individuals with random strategies, the output is a strategy that is optimized to solve the given problem

The algorithm is agnostic to the actual problem, it is primarily specified through the getFitness function

# Usage

`npm install @methodswithclass/evolve`

`import Evolve from @methodswithclass/evolve`

The input consists of options for the evolutionary algorithm and the specification of your problem.

## Mutate

called when processing each individual
returns a brand new strategy or a mutated strategy
required, can be async

strategy is the central object that is being optimized (any type)

if input strategy is undefined then return a brand new strategy with random values, if it exists, return a copy of it, with some values newly randomized by some percentage

this function would typically return a randomly valued item (within a relevant range)

```
const mutate = async (strategy) => {
	return newStrategy // can be any type, typically the strategy is a consistent type
}

```

## BeforeEach

called before processing each new generation
returns a boolean on whether to process the next generation, the current generation will finish
optional, can be async

generation is the number of the current generation

```
const beforeEach = async (input) => {
	const { generation, first, last } = input;
	return true/false // must explicitly return false if you want the process to stop
}
```

## AfterEach

called after processing each generation
returns nothing
optional, can be async

generation is the number of the current generation
best is the top performing individual of the generation: { strategy, fitness }

```
const afterEach = async (input) => {
	const { generation, best } = input;
	no return
}
```

## OnEnd

called when all the generations have been processed or evolution told to stop (beforeEach returns false)
optional, can be async

generation is the number of the current generation
best is the top performing individual of the generation: { strategy, fitness }

```
const onEnd = async (input) => {
	const { generation, best } = input;
	no return
}
```

## GetFitness

the primary definition of your problem, it takes a strategy and runs it against the problem to produce a measure of its performance, the fitness
required, can be async

populations for every generation run all individuals simultaneously, indexes not guaranteed to be in order
strategy is the object (any type) formed by mutate(), fitness is calculated by some process on this object
index: {generation number}#{index of individual in population array}
id: {unique id for generation}#{unique id for individual}
returns the fitness of an individual (any type), can be async
this fitness is then passed into rank

```
const getFitness = async (input) => {
	const { index, id, strategy } = input;
	return fitness;
}

```

## Combine

called during generation crossover
required, can be async

strategies are pulled from the top performers of the generation at random

```
const combine = async (strategyA, strategyB) => {
	return newStrategy
}

```

## Rank

comparator according to Array.sort(),
optional, must be synchronous

some function according to your optimization and fitness scheme/type
if not included Evolve will treat the fitness as a number, and will maximize it

```
const rank = (fitnessA, fitnessB) => {
	return fitnessB - fitnessA;
}
```

## Initialization

```
const input = {
	first, // first generation number, required
	last, // last generation number, must be greater than first, required
	best, // initial best performer { strategy, fitness }, optional, used when first is not 1, when this is included, all individuals in the first generation are mutated versions of this
	popTotal, // number of individuals per generation, required, defaults to 100
	beforeEach,
	afterEach,
	onEnd,
	getFitness,
	combine,
	rank,
	mutate,
}

const evolve = Evolve(input);

await evolve.start();

evolve.stop();
```

process auto-stops when the current generation equals the value in `last`

# Example

```
const totalGenes = 100;

const getGene = () => {
	return Math.random();
}

const mutate = (strategy) => {

	const newStrategy = [];

	if (!strategy) {
		for (let i = 0, i < totalGenes; i++) {
			newStrategy.push(getGene());
		}
		return newStrategy;
	}

	const mutatedStrategy = strategy.map(item => {
		if (Math.random() < 0.02) {
			return getGene();
		}

		return item;
	})

	return mutatedStrategy;
}

const combine = (a, b) => {
	const aSegment = a.slice(0, totalGenes/2);
	const bSegment = b.slice(totalGenes/2);

	return [...aSegment, ...bSegment];
}

const getFitness = ({ strategy }) => {
	const fitness = strategy.reduce((total, item)  => {
		if (1 - item < 0.01) {
			return total + 50
		}
		return total - 20;
	}, 0);

	return fitness;
}

let bestPerformer;

const evolve = Evolve({
	first: 1,
	last: 100
	popTotal: 100,
	afterEach: ({ generation, best }) => {
		console.log("current generation", generation);
		bestPerformer = best;
	},
	getFitness,
	mutate,
	combine,
})

await evolve.start();

const { strategy, fitness } = bestPerformer;

this resulting strategy will be an array of values all close to 1;
```
