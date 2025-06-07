import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Play, Pause, Square, Save, Download, Upload, Share2, Settings, 
  Zap, Database, Globe, Code, Brain, Image, Music, Video, PenTool, 
  BarChart, Clock, Users, Star, Target, Lightbulb, ArrowRight, 
  CheckCircle, AlertCircle, Info, Trash2, Copy, Edit3, Eye,
  GitBranch, Workflow, Cpu, Shield, Sparkles, TrendingUp,
  Activity, Monitor, FileText, MessageSquare, Mail, Calendar,
  Search, Filter, MoreVertical, Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { AITool } from '../types';
import toast from 'react-hot-toast';

interface WorkflowBuilderProps {
  tools: AITool[];
}

interface WorkflowNode {
  id: string;
  type: 'tool' | 'trigger' | 'action' | 'condition' | 'output';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: { x: number; y: number };
  data: any;
  inputs: string[];
  outputs: string[];
  status: 'idle' | 'running' | 'completed' | 'error';
  executionTime?: number;
  tool?: AITool;
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  estimatedTime: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  usageCount: number;
  rating: number;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration: number;
  data?: any;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ tools }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [workflowStats, setWorkflowStats] = useState({
    totalNodes: 0,
    totalConnections: 0,
    estimatedTime: '0s',
    efficiency: 0,
    lastRun: null as Date | null
  });
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [draggedTool, setDraggedTool] = useState<AITool | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    nodesExecuted: 0,
    totalExecutionTime: 0,
    successRate: 100,
    throughput: 0
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const nodeTypes = [
    { type: 'trigger', name: 'Trigger', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { type: 'action', name: 'Action', icon: Settings, color: 'from-blue-500 to-indigo-500' },
    { type: 'condition', name: 'Condition', icon: GitBranch, color: 'from-purple-500 to-pink-500' },
    { type: 'output', name: 'Output', icon: Target, color: 'from-green-500 to-emerald-500' }
  ];

  const categories = ['All', 'Content Creation', 'Data Processing', 'Communication', 'Analytics', 'Automation'];

  useEffect(() => {
    generateTemplates();
    updateWorkflowStats();
  }, [nodes, connections]);

  useEffect(() => {
    if (isExecuting) {
      const interval = setInterval(() => {
        setRealTimeMetrics(prev => ({
          ...prev,
          throughput: prev.throughput + Math.random() * 10,
          totalExecutionTime: prev.totalExecutionTime + 1
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isExecuting]);

  const generateTemplates = () => {
    const sampleTemplates: WorkflowTemplate[] = [
      {
        id: '1',
        name: 'Content Creation Pipeline',
        description: 'Generate blog posts, create images, and publish to social media',
        category: 'Content Creation',
        nodes: [],
        connections: [],
        estimatedTime: '5-10 min',
        complexity: 'Intermediate',
        usageCount: 1247,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Data Analysis Workflow',
        description: 'Process data, generate insights, and create visualizations',
        category: 'Data Processing',
        nodes: [],
        connections: [],
        estimatedTime: '15-20 min',
        complexity: 'Advanced',
        usageCount: 892,
        rating: 4.6
      },
      {
        id: '3',
        name: 'Customer Support Automation',
        description: 'Automate customer inquiries and generate responses',
        category: 'Communication',
        nodes: [],
        connections: [],
        estimatedTime: '2-5 min',
        complexity: 'Beginner',
        usageCount: 2156,
        rating: 4.9
      }
    ];
    setTemplates(sampleTemplates);
  };

  const updateWorkflowStats = () => {
    setWorkflowStats({
      totalNodes: nodes.length,
      totalConnections: connections.length,
      estimatedTime: `${Math.max(1, nodes.length * 2)}s`,
      efficiency: Math.min(100, Math.max(0, 100 - (connections.length * 5))),
      lastRun: isExecuting ? new Date() : workflowStats.lastRun
    });
  };

  const addNode = useCallback((type: string, position: { x: number; y: number }, tool?: AITool) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      name: tool ? tool.name : `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      description: tool ? tool.description : `A ${type} node`,
      icon: getNodeIcon(type),
      position,
      data: tool ? { tool } : {},
      inputs: type === 'trigger' ? [] : ['input'],
      outputs: type === 'output' ? [] : ['output'],
      status: 'idle',
      tool
    };

    setNodes(prev => [...prev, newNode]);
    toast.success(`${newNode.name} added to workflow`);
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return Zap;
      case 'action': return Settings;
      case 'condition': return GitBranch;
      case 'output': return Target;
      default: return Brain;
    }
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes to execute the workflow');
      return;
    }

    setIsExecuting(true);
    setShowExecutionPanel(true);
    setExecutionLogs([]);
    setExecutionProgress(0);
    setRealTimeMetrics({
      nodesExecuted: 0,
      totalExecutionTime: 0,
      successRate: 100,
      throughput: 0
    });

    try {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Update node status
        setNodes(prev => prev.map(n => 
          n.id === node.id ? { ...n, status: 'running' } : n
        ));

        // Simulate execution time
        const executionTime = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, executionTime));

        // Random success/failure
        const success = Math.random() > 0.1; // 90% success rate
        const status = success ? 'completed' : 'error';

        // Update node status
        setNodes(prev => prev.map(n => 
          n.id === node.id ? { 
            ...n, 
            status: status as any,
            executionTime: executionTime 
          } : n
        ));

        // Add execution log
        const log: ExecutionLog = {
          id: `log-${Date.now()}-${i}`,
          timestamp: new Date().toISOString(),
          nodeId: node.id,
          nodeName: node.name,
          status: success ? 'success' : 'error',
          message: success 
            ? `${node.name} executed successfully`
            : `${node.name} failed to execute`,
          duration: executionTime,
          data: success ? { result: 'Sample output data' } : { error: 'Sample error message' }
        };

        setExecutionLogs(prev => [...prev, log]);
        setExecutionProgress((i + 1) / nodes.length * 100);
        setRealTimeMetrics(prev => ({
          ...prev,
          nodesExecuted: i + 1,
          successRate: success ? prev.successRate : Math.max(0, prev.successRate - 10)
        }));

        if (!success) {
          toast.error(`Workflow failed at ${node.name}`);
          break;
        }
      }

      toast.success('Workflow executed successfully!');
    } catch (error) {
      toast.error('Workflow execution failed');
    } finally {
      setIsExecuting(false);
      setExecutionProgress(100);
    }
  };

  const stopWorkflow = () => {
    setIsExecuting(false);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    toast.info('Workflow execution stopped');
  };

  const clearWorkflow = () => {
    setNodes([]);
    setConnections([]);
    setExecutionLogs([]);
    setSelectedNode(null);
    toast.success('Workflow cleared');
  };

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      connections,
      stats: workflowStats,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Workflow saved successfully');
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    // Generate sample nodes for the template
    const sampleNodes: WorkflowNode[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Webhook Trigger',
        description: 'Triggers when data is received',
        icon: Zap,
        position: { x: 100, y: 100 },
        data: {},
        inputs: [],
        outputs: ['output'],
        status: 'idle'
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Process Data',
        description: 'Processes the incoming data',
        icon: Settings,
        position: { x: 300, y: 100 },
        data: {},
        inputs: ['input'],
        outputs: ['output'],
        status: 'idle'
      },
      {
        id: 'output-1',
        type: 'output',
        name: 'Send Result',
        description: 'Sends the processed result',
        icon: Target,
        position: { x: 500, y: 100 },
        data: {},
        inputs: ['input'],
        outputs: [],
        status: 'idle'
      }
    ];

    setNodes(sampleNodes);
    setConnections([]);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTool || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (e.clientX - rect.left - canvasOffset.x) / zoom,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom
    };

    addNode('action', position, draggedTool);
    setDraggedTool(null);
  }, [draggedTool, canvasOffset, zoom, addNode]);

  const filteredTools = tools.filter(tool =>
    (selectedCategory === 'All' || tool.category === selectedCategory) &&
    (searchQuery === '' || tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'error': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'max-w-7xl mx-auto'} bg-white dark:bg-gray-900`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              <Workflow className="w-8 h-8 mr-3" />
              Workflow Builder
            </h2>
            <p className="text-purple-100">Create powerful AI workflows with drag-and-drop simplicity</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
              <Workflow className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{workflowStats.totalNodes}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Nodes</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-3">
              <GitBranch className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{workflowStats.totalConnections}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Connections</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{workflowStats.estimatedTime}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Est. Time</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{workflowStats.efficiency}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Efficiency</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {isExecuting ? 'Running' : 'Idle'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Controls */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Controls</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={executeWorkflow}
                  disabled={isExecuting || nodes.length === 0}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    isExecuting || nodes.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Running...' : 'Execute'}
                </button>
                <button
                  onClick={stopWorkflow}
                  disabled={!isExecuting}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    !isExecuting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </button>
                <button
                  onClick={saveWorkflow}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={clearWorkflow}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </button>
              </div>
            </div>

            {/* Execution Panel Toggle */}
            <div>
              <button
                onClick={() => setShowExecutionPanel(!showExecutionPanel)}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  showExecutionPanel
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                }`}
              >
                <Monitor className="w-4 h-4 mr-2" />
                {showExecutionPanel ? 'Hide' : 'Show'} Execution Panel
              </button>
            </div>

            {/* Node Types */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Node Types</h3>
              <div className="space-y-2">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <button
                      key={nodeType.type}
                      onClick={() => addNode(nodeType.type, { x: 200, y: 200 })}
                      className={`w-full flex items-center p-3 rounded-lg bg-gradient-to-r ${nodeType.color} text-white hover:shadow-lg transition-all`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{nodeType.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Tools */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Tools</h3>
              
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredTools.slice(0, 10).map((tool) => (
                  <div
                    key={tool.id}
                    draggable
                    onDragStart={() => setDraggedTool(tool)}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="w-8 h-8 rounded object-cover mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-100 dark:bg-gray-900 relative"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              transform: `scale(${zoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`
            }}
          >
            {/* Nodes */}
            <AnimatePresence>
              {nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 cursor-move ${
                      selectedNode?.id === node.id
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${getStatusColor(node.status)}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: 200,
                      minHeight: 120
                    }}
                    onClick={() => setSelectedNode(node)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div className="flex items-center space-x-1">
                          {node.status === 'running' && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                          )}
                          {node.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {node.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {node.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {node.description}
                      </p>
                      {node.executionTime && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Executed in {(node.executionTime / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>

                    {/* Input/Output handles */}
                    {node.inputs.map((input, index) => (
                      <div
                        key={`input-${index}`}
                        className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                      />
                    ))}
                    {node.outputs.map((output, index) => (
                      <div
                        key={`output-${index}`}
                        className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                      />
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    Drag tools from the sidebar or add nodes to get started
                  </p>
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Templates
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Execution Panel */}
        <AnimatePresence>
          {showExecutionPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Execution Monitor
                  </h3>
                  <button
                    onClick={() => setShowExecutionPanel(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Real-time Metrics */}
                {isExecuting && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Real-time Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {realTimeMetrics.nodesExecuted}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Nodes Executed</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {realTimeMetrics.successRate}%
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Success Rate</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {realTimeMetrics.totalExecutionTime}s
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Total Time</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {realTimeMetrics.throughput.toFixed(1)}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Throughput</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {executionProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${executionProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Execution Logs */}
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Execution Logs
                  </h4>
                  <div className="h-full overflow-y-auto space-y-2">
                    {executionLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No execution logs yet
                        </p>
                      </div>
                    ) : (
                      executionLogs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${
                            log.status === 'success'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : log.status === 'error'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.nodeName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {log.message}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {(log.duration / 1000).toFixed(2)}s
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Workflow Templates
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.complexity === 'Beginner'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : template.complexity === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {template.complexity}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {template.usageCount.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {template.rating}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowBuilder;