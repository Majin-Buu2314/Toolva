import React, { useState, useEffect } from 'react';
import { User, Code, Briefcase, Palette, PenTool, Camera, Brain, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Persona {
  id: string;
  name: string;
  icon: any;
  description: string;
  skills: string[];
  tools: string[];
  workflows: string[];
}

const PersonaRecommendations = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchPersonas();
  }, []);

  useEffect(() => {
    if (selectedPersona) {
      fetchRecommendations(selectedPersona);
    }
  }, [selectedPersona]);

  const fetchPersonas = async () => {
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*');

      if (error) throw error;

      const mappedPersonas = data.map(p => ({
        ...p,
        icon: getIconComponent(p.icon_name)
      }));

      setPersonas(mappedPersonas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (personaId: string) => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('persona_id', personaId);

      if (error) throw error;
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      'developer': Code,
      'designer': Palette,
      'writer': PenTool,
      'business': Briefcase,
      'security': Shield,
      'ai': Brain,
      'default': User
    };
    return icons[iconName] || icons.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Find Your Perfect AI Stack
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get personalized tool recommendations based on your role and needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {personas.map((persona) => {
          const Icon = persona.icon;
          return (
            <motion.button
              key={persona.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPersona(persona.id)}
              className={`p-6 rounded-xl text-center transition-all ${
                selectedPersona === persona.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{persona.name}</h3>
              <p className="text-sm opacity-80">{persona.description}</p>
            </motion.button>
          );
        })}
      </div>

      {selectedPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {rec.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {rec.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rec.tools.map((tool: any) => (
                  <div
                    key={tool.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {tool.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tool.description}
                    </p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Learn More
                      <svg
                        className="w-4 h-4 ml-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PersonaRecommendations;