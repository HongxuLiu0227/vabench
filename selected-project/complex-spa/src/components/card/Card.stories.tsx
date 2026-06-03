import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

export default {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    imageUrl: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'highlighted', 'minimal']
    },
    onClick: { action: 'clicked' }
  }
} as Meta<typeof Card>;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Project Dashboard',
    description: 'Overview of all active projects with status indicators',
    imageUrl: 'https://via.placeholder.com/300x200?text=Dashboard',
    variant: 'default'
  }
};

export const Highlighted: Story = {
  args: {
    title: 'Urgent Task',
    description: 'Complete the client proposal by EOD',
    imageUrl: 'https://via.placeholder.com/300x200?text=Urgent',
    variant: 'highlighted'
  }
};

export const Minimal: Story = {
  args: {
    title: 'Team Members',
    description: 'View and manage your team',
    imageUrl: 'https://via.placeholder.com/300x200?text=Team',
    variant: 'minimal'
  }
};