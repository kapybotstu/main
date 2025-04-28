import React from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  sender: string;
  role: string;
  content: string;
  time: string;
  unread: boolean;
}

interface MessagesWidgetProps {
  data: {
    icon: any;
    messages: Message[];
  };
}

const MessagesWidget: React.FC<MessagesWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  
  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          <Icon size={20} />
        </div>
        <span className="text-sm text-jobby-gray-600">
          {data.messages.filter(m => m.unread).length} unread
        </span>
      </div>
      
      <div className="space-y-3">
        {data.messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg ${
              message.unread 
                ? 'bg-jobby-purple/5 border border-jobby-purple/20' 
                : 'bg-white border border-jobby-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-jobby-gray-800 text-sm">{message.sender}</h4>
                <p className="text-xs text-jobby-gray-500">{message.role}</p>
              </div>
              <span className="text-xs text-jobby-gray-500">{message.time}</span>
            </div>
            <p className="mt-2 text-sm text-jobby-gray-700 line-clamp-2">{message.content}</p>
            <div className="mt-2 flex justify-end">
              <button className="text-xs text-jobby-purple hover:text-jobby-purple-dark font-medium">
                Read More
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MessagesWidget;