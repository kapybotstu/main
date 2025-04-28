import React from 'react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface CalendarWidgetProps {
  data: {
    icon: any;
    events: Event[];
  };
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  
  // Group events by date
  const eventsByDate = data.events.reduce((groups, event) => {
    const date = new Date(event.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <Icon size={20} />
        </div>
        <span className="text-sm text-jobby-gray-600">{data.events.length} upcoming events</span>
      </div>
      
      <div className="space-y-4">
        {sortedDates.map((date, dateIndex) => (
          <div key={date}>
            <div className="mb-2">
              <h4 className="text-sm font-medium text-jobby-gray-700">{date}</h4>
              <div className="h-0.5 w-16 bg-jobby-gold/50 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              {eventsByDate[date].map((event, eventIndex) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (dateIndex * 0.1) + (eventIndex * 0.05) }}
                  className="p-2 rounded-md border-l-3 border-l-4 border-solid border-jobby-purple bg-jobby-purple/5"
                >
                  <p className="text-sm font-medium text-jobby-gray-800">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-jobby-gray-500">
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      event.type === 'interview' 
                        ? 'bg-jobby-purple/10 text-jobby-purple' 
                        : 'bg-jobby-gold/10 text-jobby-gold'
                    }`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;