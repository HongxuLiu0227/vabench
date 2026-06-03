import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import MapComponent from './MapComponent';
import { locations } from '../../../data/locations';

export default {
  title: 'Components/Map',
  component: MapComponent,
} as ComponentMeta<typeof MapComponent>;

const Template: ComponentStory<typeof MapComponent> = (args) => <MapComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  locations: locations.slice(0, 5),
  center: [51.505, -0.09],
  zoom: 13,
  height: '400px',
};

export const WithMarkers = Template.bind({});
WithMarkers.args = {
  locations: locations.slice(5, 10),
  center: [40.7128, -74.0060],
  zoom: 11,
  height: '500px',
  showMarkers: true,
  markerColor: '#ff0000',
};

export const WithHeatmap = Template.bind({});
WithHeatmap.args = {
  locations: locations,
  center: [34.0522, -118.2437],
  zoom: 10,
  height: '600px',
  showHeatmap: true,
  heatmapRadius: 15,
  heatmapBlur: 15,
};