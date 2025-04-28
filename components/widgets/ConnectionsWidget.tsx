import React from 'react';
import { motion } from 'framer-motion';

interface Connection {
  id: string;
  name: string;
  company: string;
  role: string;
  date: string;
}

interface ConnectionsWidgetProps {
  data: {
    icon: any;
    connections: Connection[];
  };
}

const ConnectionsWidget: React.FC<ConnectionsWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  
  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          <Icon size={20} />
        </div>
        <span className="text-sm text-jobby-gray-600">{data.connections.length} connections</span>
      </div>
      
      <div className="space-y-3">
        {data.connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple/30 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-jobby-gray-200 flex items-center justify-center text-jobby-gray-700 font-medium">
              {connection.name.split(' ').map(part => part[0]).join('')}
            </div>
            
            <div className="flex-grow">
              <h4 className="font-medium text-jobby-gray-800 text-sm">{connection.name}</h4>
              <p className="text-xs text-jobby-gray-500">{connection.role} at {connection.company}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-jobby-gray-500">
                {new Date(connection.date).toLocaleDateString()}
              </span>
              <button className="mt-1 text-xs text-jobby-purple hover:text-jobby-purple-dark font-medium">
                Connect
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionsWidget;