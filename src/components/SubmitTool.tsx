import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Code, Globe, Book, Shield, Database, GitBranch, Zap, Star, Users, Clock, Award, Target, Lightbulb, Camera, Video, Music, PenTool, Brain, Cpu, BarChart, Briefcase, CheckCircle, AlertCircle, Info, Sparkles, TrendingUp, Heart, Eye, Download, Share2 } from 'lucide-react';
import { categories } from '../data/categories';
import { ToolSubmission } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface SubmitToolProps {
  onClose: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface SubmissionStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingReview: number;
  averageApprovalTime: string;
}

const SubmitTool: React.FC<SubmitToolProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<ToolSubmission>({
    name: '',
    description: '',
    category: '',
    url: '',
    pricing: '',
    modelType: '',
    submitterEmail: '',
    additionalNotes: '',
    github: '',
    documentation: '',
    apiEndpoint: '',
    techStack: [],
    integrations: [],
    pricingDetails: {
      free: {
        features: [],
        limits: []
      },
      paid: {
        plans: []
      }
    },
    useCases: [],
    requirements: [],
    setupInstructions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats>({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingReview: 0,
    averageApprovalTime: '3-5 days'
  });
  const [similarTools, setSimilarTools] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Dynamic inputs
  const [techStackInput, setTechStackInput] = useState('');
  const [integrationsInput, setIntegrationsInput] = useState('');
  const [useCaseInput, setUseCaseInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [freePlanFeature, setFreePlanFeature] = useState('');
  const [freePlanLimit, setFreePlanLimit] = useState('');
  const [paidPlanName, setPaidPlanName] = useState('');
  const [paidPlanPrice, setPaidPlanPrice] = useState('');
  const [paidPlanFeature, setPaidPlanFeature] = useState('');

  useEffect(() => {
    fetchSubmissionStats();
    generateAiSuggestions();
  }, []);

  useEffect(() => {
    if (formData.name && formData.category) {
      findSimilarTools();
    }
  }, [formData.name, formData.category]);

  const fetchSubmissionStats = async () => {
    try {
      // Simulate fetching submission stats
      setSubmissionStats({
        totalSubmissions: 1247,
        approvedSubmissions: 892,
        pendingReview: 45,
        averageApprovalTime: '2-4 days'
      });
    } catch (error) {
      console.error('Error fetching submission stats:', error);
    }
  };

  const generateAiSuggestions = () => {
    const suggestions = [
      "Include detailed API documentation",
      "Add pricing comparison with competitors",
      "Provide integration examples",
      "Include performance benchmarks",
      "Add video demonstration",
      "Specify system requirements",
      "Include customer testimonials",
      "Add security certifications"
    ];
    setAiSuggestions(suggestions.slice(0, 4));
  };

  const findSimilarTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('category', formData.category)
        .limit(3);

      if (error) throw error;
      setSimilarTools(data || []);
    } catch (error) {
      console.error('Error finding similar tools:', error);
    }
  };

  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'Tool name is required' });
    }
    if (!formData.description.trim()) {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (!formData.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    if (!formData.url.trim()) {
      errors.push({ field: 'url', message: 'Website URL is required' });
    } else if (!isValidUrl(formData.url)) {
      errors.push({ field: 'url', message: 'Please enter a valid URL' });
    }
    if (!formData.submitterEmail.trim()) {
      errors.push({ field: 'submitterEmail', message: 'Email is required' });
    } else if (!isValidEmail(formData.submitterEmail)) {
      errors.push({ field: 'submitterEmail', message: 'Please enter a valid email' });
    }

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress(0);

    try {
      // Simulate submission progress
      const progressInterval = setInterval(() => {
        setSubmissionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmissionProgress(100);
      clearInterval(progressInterval);
      
      toast.success('Tool submitted successfully! We\'ll review it within 2-4 days.');
      onClose();
    } catch (err) {
      toast.error('Failed to submit tool. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  const handleScreenshotUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newScreenshots = [...screenshots, ...files].slice(0, 5);
    setScreenshots(newScreenshots);

    const newPreviewUrls = newScreenshots.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  }, [screenshots]);

  const removeScreenshot = useCallback((index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setScreenshots(newScreenshots);
    setPreviewUrls(newPreviewUrls);
  }, [screenshots, previewUrls]);

  const addToArray = (arrayName: keyof ToolSubmission, value: string, inputSetter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[arrayName] as string[] || [];
      setFormData({
        ...formData,
        [arrayName]: [...currentArray, value.trim()]
      });
      inputSetter('');
    }
  };

  const removeFromArray = (arrayName: keyof ToolSubmission, index: number) => {
    const currentArray = formData[arrayName] as string[] || [];
    setFormData({
      ...formData,
      [arrayName]: currentArray.filter((_, i) => i !== index)
    });
  };

  const steps = [
    { 
      title: 'Basic Information', 
      icon: Globe, 
      description: 'Essential tool details',
      fields: ['name', 'description', 'category', 'url']
    },
    { 
      title: 'Technical Details', 
      icon: Code, 
      description: 'Technical specifications',
      fields: ['github', 'documentation', 'apiEndpoint', 'techStack']
    },
    { 
      title: 'Features & Pricing', 
      icon: Zap, 
      description: 'Pricing and feature details',
      fields: ['pricing', 'pricingDetails', 'useCases']
    },
    { 
      title: 'Media & Documentation', 
      icon: Book, 
      description: 'Screenshots and guides',
      fields: ['screenshots', 'setupInstructions', 'requirements']
    }
  ];

  const getStepCompletion = (stepIndex: number) => {
    const step = steps[stepIndex];
    const completedFields = step.fields.filter(field => {
      const value = formData[field as keyof ToolSubmission];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim() !== '';
    });
    return (completedFields.length / step.fields.length) * 100;
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Chatbots': Brain,
    'Image Generation': Camera,
    'Code': Code,
    'Music': Music,
    'Video': Video,
    'Writing': PenTool,
    'Business': Briefcase,
    'Analytics': BarChart,
    'Machine Learning': Cpu
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-2">Submit Your AI Tool</h2>
              <p className="text-blue-100">Join our curated directory of {submissionStats.totalSubmissions}+ AI tools</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{submissionStats.totalSubmissions}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{submissionStats.approvedSubmissions}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{submissionStats.pendingReview}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{submissionStats.averageApprovalTime}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Review Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              const completion = getStepCompletion(index);
              
              return (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                      {isActive && completion > 0 && (
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800">
                          <div 
                            className="absolute inset-0 rounded-full border-4 border-blue-600 transition-all duration-300"
                            style={{
                              clipPath: `polygon(0 0, ${completion}% 0, ${completion}% 100%, 0 100%)`
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex h-[calc(95vh-280px)]">
          {/* Main Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tool Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter your tool name"
                          required
                        />
                        {validationErrors.find(e => e.field === 'name') && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.find(e => e.field === 'name')?.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.filter(cat => cat.name !== 'All').map(category => {
                            const IconComponent = categoryIcons[category.name] || Globe;
                            return (
                              <option key={category.name} value={category.name}>
                                {category.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={4}
                        placeholder="Describe what your tool does and its key features"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website URL *
                        </label>
                        <input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://yourtool.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Email *
                        </label>
                        <input
                          type="email"
                          value={formData.submitterEmail}
                          onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pricing Model
                        </label>
                        <select
                          value={formData.pricing}
                          onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select pricing model</option>
                          <option value="Free">Free</option>
                          <option value="Freemium">Freemium</option>
                          <option value="Paid">Paid</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Model Type
                        </label>
                        <input
                          type="text"
                          value={formData.modelType}
                          onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., GPT-4, Custom Model, etc."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GitHub Repository
                        </label>
                        <div className="relative">
                          <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.github || ''}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://github.com/username/repository"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Documentation URL
                        </label>
                        <div className="relative">
                          <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.documentation || ''}
                            onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://docs.yourtool.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Endpoint
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={formData.apiEndpoint || ''}
                          onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://api.yourtool.com/v1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tech Stack
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={techStackInput}
                          onChange={(e) => setTechStackInput(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add technology (e.g., React, Python, TensorFlow)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('techStack', techStackInput, setTechStackInput))}
                        />
                        <button
                          type="button"
                          onClick={() => addToArray('techStack', techStackInput, setTechStackInput)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.techStack?.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeFromArray('techStack', index)}
                              className="ml-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Integrations
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={integrationsInput}
                          onChange={(e) => setIntegrationsInput(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add integration (e.g., Slack, Discord, Zapier)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('integrations', integrationsInput, setIntegrationsInput))}
                        />
                        <button
                          type="button"
                          onClick={() => addToArray('integrations', integrationsInput, setIntegrationsInput)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.integrations?.map((integration, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                          >
                            {integration}
                            <button
                              type="button"
                              onClick={() => removeFromArray('integrations', index)}
                              className="ml-2 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        Free Plan Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={freePlanFeature}
                            onChange={(e) => setFreePlanFeature(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Add feature"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFreePlanFeature())}
                          />
                          <button
                            type="button"
                            onClick={addFreePlanFeature}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={freePlanLimit}
                            onChange={(e) => setFreePlanLimit(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Add limit"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFreePlanLimit())}
                          />
                          <button
                            type="button"
                            onClick={addFreePlanLimit}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {formData.pricingDetails.free.features.map((feature, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFreePlanFeature(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Limits</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {formData.pricingDetails.free.limits?.map((limit, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{limit}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFreePlanLimit(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-purple-500" />
                        Use Cases
                      </h3>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={useCaseInput}
                          onChange={(e) => setUseCaseInput(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add use case"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('useCases', useCaseInput, setUseCaseInput))}
                        />
                        <button
                          type="button"
                          onClick={() => addToArray('useCases', useCaseInput, setUseCaseInput)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.useCases?.map((useCase, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{useCase}</span>
                            <button
                              type="button"
                              onClick={() => removeFromArray('useCases', index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Screenshots (Max 5)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          id="screenshot-upload"
                          disabled={screenshots.length >= 5}
                        />
                        <label htmlFor="screenshot-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Click to upload screenshots or drag and drop
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            PNG, JPG up to 10MB each
                          </p>
                        </label>
                      </div>
                      {previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeScreenshot(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Setup Instructions
                      </label>
                      <textarea
                        value={formData.setupInstructions}
                        onChange={(e) => setFormData({ ...formData, setupInstructions: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={4}
                        placeholder="Provide step-by-step setup instructions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Requirements
                      </label>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={requirementInput}
                          onChange={(e) => setRequirementInput(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add requirement"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('requirements', requirementInput, setRequirementInput))}
                        />
                        <button
                          type="button"
                          onClick={() => addToArray('requirements', requirementInput, setRequirementInput)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.requirements?.map((requirement, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{requirement}</span>
                            <button
                              type="button"
                              onClick={() => removeFromArray('requirements', index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                        placeholder="Any additional information about your tool..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submission Progress */}
              {isSubmitting && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Submitting your tool...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {submissionProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${submissionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center px-6 py-3 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex items-center px-6 py-3 rounded-lg text-white transition-colors ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Submit Tool
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-gray-700 border-l border-gray-200 dark:border-gray-600 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* AI Suggestions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </h3>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start">
                        <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Tools */}
              {similarTools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Similar Tools
                  </h3>
                  <div className="space-y-3">
                    {similarTools.map((tool, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center">
                          <img
                            src={tool.image}
                            alt={tool.name}
                            className="w-8 h-8 rounded object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {tool.name}
                            </p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {tool.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Validation Errors
                  </h3>
                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>{error.field}:</strong> {error.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help & Tips */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-green-500" />
                  Tips for Success
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Clear Description:</strong> Explain what your tool does and its key benefits in simple terms.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Quality Screenshots:</strong> Include high-quality screenshots showing your tool in action.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Complete Information:</strong> Fill out as many fields as possible for better visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Tool Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formData.name || 'Tool Name'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.category || 'Category'}
                    </p>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300">
                    {formData.description || 'Tool description will appear here...'}
                  </p>

                  {formData.techStack && formData.techStack.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Tech Stack</h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.useCases && formData.useCases.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Use Cases</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.useCases.map((useCase, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {previewUrls.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Screenshots</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {previewUrls.slice(0, 4).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Helper functions
  const addFreePlanFeature = () => {
    if (freePlanFeature.trim()) {
      setFormData({
        ...formData,
        pricingDetails: {
          ...formData.pricingDetails,
          free: {
            ...formData.pricingDetails.free,
            features: [...formData.pricingDetails.free.features, freePlanFeature.trim()]
          }
        }
      });
      setFreePlanFeature('');
    }
  };

  const addFreePlanLimit = () => {
    if (freePlanLimit.trim()) {
      setFormData({
        ...formData,
        pricingDetails: {
          ...formData.pricingDetails,
          free: {
            ...formData.pricingDetails.free,
            limits: [...(formData.pricingDetails.free.limits || []), freePlanLimit.trim()]
          }
        }
      });
      setFreePlanLimit('');
    }
  };

  const removeFreePlanFeature = (index: number) => {
    setFormData({
      ...formData,
      pricingDetails: {
        ...formData.pricingDetails,
        free: {
          ...formData.pricingDetails.free,
          features: formData.pricingDetails.free.features.filter((_, i) => i !== index)
        }
      }
    });
  };

  const removeFreePlanLimit = (index: number) => {
    setFormData({
      ...formData,
      pricingDetails: {
        ...formData.pricingDetails,
        free: {
          ...formData.pricingDetails.free,
          limits: (formData.pricingDetails.free.limits || []).filter((_, i) => i !== index)
        }
      }
    });
  };
};

export default SubmitTool;