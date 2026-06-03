import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, Typography, Box } from '@mui/material';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    'todo': {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Design new dashboard',
          description: 'Create wireframes for the analytics dashboard',
          priority: 'high'
        },
        {
          id: '2',
          title: 'API documentation',
          description: 'Write documentation for the new endpoints',
          priority: 'medium'
        }
      ]
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'User authentication',
          description: 'Implement OAuth2 flow',
          priority: 'high'
        }
      ]
    },
    'done': {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '4',
          title: 'Setup CI/CD',
          description: 'Configure GitHub Actions pipeline',
          priority: 'medium'
        }
      ]
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.tasks.find(t => t.id === draggableId);

    if (!task) return;

    // Remove from source
    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    // Add to destination
    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, task);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        tasks: newSourceTasks
      },
      [destination.droppableId]: {
        ...destColumn,
        tasks: newDestTasks
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      case 'low': return 'success.main';
      default: return 'text.secondary';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" gap={2} p={2}>
        {Object.values(columns).map((column) => (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ flex: 1 }}
              >
                <Typography variant="h6" gutterBottom>{column.title}</Typography>
                {column.tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          marginBottom: '8px',
                          ...provided.draggableProps.style
                        }}
                      >
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {task.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {task.description}
                            </Typography>
                            <Typography variant="caption" color={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;