import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Plus } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
}

interface TasksWidgetProps {
  data: {
    icon: any;
    tasks: Task[];
  };
}

const TasksWidget: React.FC<TasksWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  const [tasks, setTasks] = useState<Task[]>(data.tasks);
  const [newTaskText, setNewTaskText] = useState('');
  
  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: `t${Date.now()}`,
        text: newTaskText,
        completed: false,
        dueDate: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          <Icon size={20} />
        </div>
        <span className="text-sm text-jobby-gray-600">{tasks.length} tasks</span>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <motion.li 
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 p-2 rounded-md hover:bg-jobby-gray-100"
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-jobby-purple" />
                ) : (
                  <Circle className="h-5 w-5 text-jobby-gray-400" />
                )}
              </button>
              <div className="flex-grow">
                <p className={`text-sm ${task.completed ? 'text-jobby-gray-500 line-through' : 'text-jobby-gray-800'}`}>
                  {task.text}
                </p>
                <p className="text-xs text-jobby-gray-500">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      
      <div className="mt-3 pt-3 border-t border-jobby-gray-200 flex items-center">
        <input
          type="text"
          placeholder="Add a new task..."
          className="flex-grow text-sm border-none bg-transparent focus:outline-none focus:ring-0 text-jobby-gray-700 placeholder-jobby-gray-400"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={addTask}
          className="p-1.5 rounded-md hover:bg-jobby-purple/10 text-jobby-purple"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default TasksWidget;