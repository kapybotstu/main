import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, X } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  date: string;
}

interface NotesWidgetProps {
  data: {
    icon: any;
    notes: Note[];
  };
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  const [notes, setNotes] = useState<Note[]>(data.notes);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `n${Date.now()}`,
        text: newNote,
        date: new Date().toISOString().split('T')[0]
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setIsAdding(false);
    }
  };
  
  const removeNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
            <Icon size={20} />
          </div>
          <span className="text-sm text-jobby-gray-600">{notes.length} notes</span>
        </div>
        
        {!isAdding && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-md hover:bg-jobby-gold/10 text-jobby-gold"
          >
            <Plus size={18} />
          </motion.button>
        )}
      </div>
      
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-3 p-3 border border-jobby-gold/30 rounded-lg bg-jobby-gold/5"
        >
          <textarea
            placeholder="Write a new note..."
            className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0 resize-none min-h-[80px]"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs rounded-md text-jobby-gray-600 hover:bg-jobby-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={addNote}
              className="px-3 py-1 text-xs rounded-md bg-jobby-gold text-white hover:bg-jobby-gold-dark"
            >
              Save
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="flex-grow overflow-y-auto space-y-3">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-3 rounded-lg border border-jobby-gray-200 bg-white"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs text-jobby-gray-500">
                {new Date(note.date).toLocaleDateString()}
              </p>
              <button
                onClick={() => removeNote(note.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-jobby-gray-100 text-jobby-gray-500"
              >
                <X size={14} />
              </button>
            </div>
            <p className="mt-1 text-sm text-jobby-gray-800 whitespace-pre-wrap">{note.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotesWidget;