<script lang="ts">
	import { Chart } from '@human-kit/ui';

	type Car = { weight: number; mpg: number; origin: string };
	const cars: Record<string, [number, number][]> = {
		Europe: [
			[2130, 31],
			[2234, 30],
			[2372, 26],
			[2670, 27],
			[2950, 23],
			[3190, 22],
			[2050, 36],
			[2430, 29]
		],
		Japan: [
			[1835, 35],
			[2065, 31],
			[2130, 33],
			[2370, 30],
			[2565, 27],
			[2720, 25],
			[1985, 38],
			[2290, 32]
		],
		USA: [
			[3504, 18],
			[3693, 15],
			[4354, 14],
			[3850, 15],
			[3086, 22],
			[2933, 24],
			[4440, 13],
			[3433, 19],
			[2720, 26]
		]
	};
	const data: Car[] = Object.entries(cars).flatMap(([origin, rows]) =>
		rows.map(([weight, mpg]) => ({ weight, mpg, origin }))
	);
</script>

<Chart.Root
	{data}
	x="weight"
	y="mpg"
	series="origin"
	xLabel="Weight (lb)"
	yLabel="Fuel economy (mpg)"
	xScale={{ zero: false, nice: true }}
	yScale={{ zero: false }}
	class="demo-chart"
>
	<Chart.Title>Weight and fuel economy of cars</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Dot />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
