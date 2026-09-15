const csv = require('fs').readFileSync('/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_520/public/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv', 'utf8');
const { csvParse } = require('d3-dsv');

const data = csvParse(csv);

console.log('Total rows:', data.length);
console.log('Headers:', Object.keys(data[0]).join(', '));

let emptySales = 0;
let invalidDates = 0;
data.forEach((row, i) => {
  const sales = row['Sales'];
  const orderDate = row['Order Date'];
  if (!sales || sales === '') emptySales++;
  if (!orderDate || orderDate === '') invalidDates++;
});

console.log('Rows with empty Sales:', emptySales);
console.log('Rows with empty Order Date:', invalidDates);

console.log('Sample Sales values:', data.slice(0, 5).map(d => d['Sales']));
console.log('Sample Order Date values:', data.slice(0, 5).map(d => d['Order Date']));

// Check for year range
const years = new Set();
data.forEach(row => {
  const date = new Date(row['Order Date']);
  if (!isNaN(date.getTime())) {
    years.add(date.getFullYear());
  }
});
console.log('Years in data:', Array.from(years).sort());
