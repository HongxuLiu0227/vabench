import { csvParse } from 'd3-dsv';
import type { OrderData, AggregatedSalesBySegment, AggregatedSalesByMarket, ScatterPoint } from '../types';

const DATA_URL = '/data/Global Superstore_Orders.csv';

export async function loadOrderData(): Promise<OrderData[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  const csvText = await response.text();
  const data = csvParse(csvText);

  return data.map((row: d3.DSVRowString) => ({
    'Row ID': Number(row['Row ID']),
    'Order ID': String(row['Order ID']),
    'Order Date': String(row['Order Date']),
    'Ship Date': String(row['Ship Date']),
    'Ship Mode': String(row['Ship Mode']),
    'Customer ID': String(row['Customer ID']),
    'Customer Name': String(row['Customer Name']),
    'Segment': String(row['Segment']),
    'Country': String(row['Country']),
    'City': String(row['City']),
    'State': String(row['State']),
    'Postal Code': String(row['Postal Code']),
    'Region': String(row['Region']),
    'Product ID': String(row['Product ID']),
    'Category': String(row['Category']),
    'Sub-Category': String(row['Sub-Category']),
    'Product Name': String(row['Product Name']),
    'Sales': Number(row['Sales']) || 0,
    'Quantity': Number(row['Quantity']) || 0,
    'Discount': Number(row['Discount']) || 0,
    'Profit': Number(row['Profit']) || 0,
    'Market': String(row['Market']),
  }));
}

export function aggregateSalesBySegment(data: OrderData[]): AggregatedSalesBySegment[] {
  const segmentMap = new Map<string, number>();
  let totalSales = 0;

  data.forEach((row) => {
    const sales = row.Sales;
    totalSales += sales;
    const current = segmentMap.get(row.Segment) || 0;
    segmentMap.set(row.Segment, current + sales);
  });

  return Array.from(segmentMap.entries())
    .map(([segment, sales]) => ({
      Segment: segment,
      Sales: sales,
      Percentage: (sales / totalSales) * 100,
    }))
    .sort((a, b) => b.Sales - a.Sales);
}

export function aggregateSalesByMarket(
  data: OrderData[],
  selectedSegment?: string | null,
  selectedMarket?: string | null
): AggregatedSalesByMarket[] {
  const countryMap = new Map<string, { sales: number; profit: number; market: string }>();

  let filteredData = data;
  if (selectedSegment) {
    filteredData = filteredData.filter((row) => row.Segment === selectedSegment);
  }
  if (selectedMarket) {
    filteredData = filteredData.filter((row) => row.Market === selectedMarket);
  }

  filteredData.forEach((row) => {
    const key = row.Country;
    const current = countryMap.get(key) || { sales: 0, profit: 0, market: row.Market };
    current.sales += Number(row.Sales) || 0;
    current.profit += Number(row.Profit) || 0;
    countryMap.set(key, current);
  });

  return Array.from(countryMap.entries())
    .map(([country, values]) => ({
      Country: country,
      Market: values.market,
      Sales: values.sales,
      Profit: values.profit,
    }))
    .sort((a, b) => b.Sales - a.Sales);
}

export function aggregateScatterData(
  data: OrderData[],
  selectedSegment?: string | null,
  selectedMarket?: string | null
): ScatterPoint[] {
  const scatterMap = new Map<string, { sales: number; profit: number; segments: Set<string>; regions: Set<string> }>();

  let filteredData = data;
  if (selectedSegment) {
    filteredData = filteredData.filter((row) => row.Segment === selectedSegment);
  }
  if (selectedMarket) {
    filteredData = filteredData.filter((row) => row.Market === selectedMarket);
  }

  filteredData.forEach((row) => {
    const key = `${row.Category}|${row.Market}`;
    const current = scatterMap.get(key);
    if (current) {
      current.sales += Number(row.Sales) || 0;
      current.profit += Number(row.Profit) || 0;
      current.segments.add(row.Segment);
      current.regions.add(row.Region);
    } else {
      scatterMap.set(key, {
        sales: Number(row.Sales) || 0,
        profit: Number(row.Profit) || 0,
        segments: new Set([row.Segment]),
        regions: new Set([row.Region]),
      });
    }
  });

  return Array.from(scatterMap.entries()).map(([key, values]) => {
    const [category, market] = key.split('|');
    const segments = Array.from(values.segments);
    const regions = Array.from(values.regions);
    return {
      Category: category,
      Market: market,
      Region: regions[0] || '',
      Sales: values.sales,
      Profit: values.profit,
      Segment: segments[0] || '',
    };
  });
}

export function getUniqueMarkets(data: OrderData[]): string[] {
  const markets = new Set(data.map((row) => row.Market));
  return Array.from(markets).sort();
}
