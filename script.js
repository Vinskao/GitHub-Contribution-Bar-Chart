//make chart
const dataPoints = [];
const dateValues = [];
const monthMap = {
  '1月': 'Jan',
  '2月': 'Feb',
  '3月': 'Mar',
  '4月': 'Apr',
  '5月': 'May',
  '6月': 'Jun',
  '7月': 'Jul',
  '8月': 'Aug',
  '9月': 'Sep',
  '10月': 'Oct',
  '11月': 'Nov',
  '12月': 'Dec',
};
addEventListener('load', () => {

if (typeof window !== 'undefined') {
	$(document).ready(function() {
		let jsonData; 
		$.getJSON("https://firebasestorage.googleapis.com/v0/b/graph-2cfc7.appspot.com/o/graph.json?alt=media&token=e661ddf2-8464-422c-a8cc-538bbccf98ca", function(response) {
			jsonData = response; 
			const contributionDays = jsonData.user.contributionsCollection.contributionCalendar.weeks
				.flatMap(week => week.contributionDays);
			const contributionTotal = jsonData.user.contributionsCollection.contributionCalendar.totalContributions
			const contributionTotalElement = document.getElementById('contributionTotal');
			contributionTotalElement.textContent = `Total Contributions Rolling-year: ${contributionTotal}`;
			let month;
			let dayOfMonth;
			let year;
			let fullDate;
			contributionDays.forEach(day => {
				const date = new Date(day.date);
				month = monthMap[date.toLocaleString('default', { month: 'short'})];
				dayOfMonth = date.getDate(); 
				year = date.getFullYear(); 
				fullDate = `${year}-${month}-${dayOfMonth}`;
				const contributionCount = day.contributionCount;
				dataPoints.push([fullDate, contributionCount]);
			});
			
			// console.log(dataPoints);


			let heightScale
			let xScale
			let xAxisScale
			let yAxisScale

			let width = 600
			let height = 300
			let padding = 40

			let svg = d3.select('svg')

			let drawCanvas = () => {
				svg.attr('width', width)
				svg.attr('height', height)
			}

			let generateScales = () => {
				// Create a linear scale for the y-axis
				heightScale = d3.scaleLinear()
					.domain([0, d3.max(dataPoints, (item) => {
						return item[1];
					})])
					.range([0, height - (2 * padding)]);
			
				// Create a time scale for the x-axis based on the date values from the data points
				xAxisScale = d3.scaleTime()
					.domain([d3.min(dataPoints, (item) => new Date(item[0])), d3.max(dataPoints, (item) => new Date(item[0]))])
					.range([padding, width - padding]);
			
				// Create a linear scale for the y-axis
				yAxisScale = d3.scaleLinear()
					.domain([0, d3.max(dataPoints, (item) => item[1])])
					.range([height - padding, padding]);
			};
			
			let drawBars = () => {
				let tooltip = d3.select('body')
					.append('div')
					.attr('id', 'tooltip')
					.style('visibility', 'hidden')
					.style('position', 'absolute')
					.style('text-align', 'center')
					.style('background-color', 'rgba(0, 0, 0, 0.7)')
					.style('color', 'white')
					.style('border-radius', '5px')
					.style('padding', '5px')
					.style('left', '25%')
					.style('top', '3%');
			
				svg.selectAll('rect')
					.data(dataPoints)
					.enter()
					.append('rect')
					.attr('class', 'bar')
					.attr('width', (width - (2 * padding)) / dataPoints.length)
					.attr('data-date', (item) => item[0])
					.attr('data-count', (item) => item[1])
					.attr('height', (item) => heightScale(item[1]))
					.attr('x', (item) => xAxisScale(new Date(item[0])))  // Use time scale for positioning
					.attr('y', (item) => (height - padding - heightScale(item[1])))
					.on('mouseover', (item) => {
						tooltip.transition()
							.style('visibility', 'visible');
						tooltip.text(`Date: ${item[0]}, Count: ${item[1]}`);
			
						document.querySelector('#tooltip').setAttribute('data-date', item[0]);
					})
					.on('mouseout', () => {
						tooltip.transition()
							.style('visibility', 'hidden');
					});
			};
			

			let generateAxes = () => {
				
				let xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat('%Y-%m-%d'));
				let yAxis = d3.axisLeft(yAxisScale);

				svg
					.append('g')
					.call(xAxis)
					.attr('id', 'x-axis')
					.attr('transform', `translate(0, ${height - padding})`)
					.selectAll('text')
					.style('fill', '#7E3BBF')
					.attr('transform', 'rotate(-40)')
					.attr('dy', '1em') 
    				.style('text-anchor', 'end')
					.style('font-size', '9px');
					
					
				svg
					.append('g')
					.attr('id', 'y-axis')
					.attr('transform', `translate(${padding}, 0)`)
					.call(yAxis)
					.style('font-size', '11px')
					.selectAll('text')
					.style('fill', '#7E3BBF'); 

				svg
					.append('text')
					.attr('transform', 'rotate(-90)')
					.attr('y', padding - 25) 
					.attr('x', -height / 2) 
					.style('text-anchor', 'middle')
					.text('Count')
					.style('fill', '#7E3BBF');

				svg.selectAll('#x-axis path')
					.style('stroke-width', '4px')
					.style('stroke', '#7E3BBF')
				
				svg.selectAll('#y-axis path')
					.style('stroke-width', '4px')
					.style('stroke', '#7E3BBF')
			}

			drawCanvas()
			generateScales()
			drawBars()
			generateAxes()


			
		
		});
		
	});
};
})