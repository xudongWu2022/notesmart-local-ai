import React, { useState, useCallback } from 'react';
import { FiShare2, FiPlay } from 'react-icons/fi';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { askQuestion } from '../../ai/services/aiService';

const NODE_STYLES = {
  root: {
    background: 'var(--color-surface-elevated)',
    fontSize: '18px',
    fontWeight: 'bold',
    minWidth: '280px',
  },
  topic: {
    background: 'var(--color-surface-hover)',
    fontSize: '16px',
    fontWeight: 'semibold',
    minWidth: '240px',
  },
  detail: {
    background: 'var(--color-surface-card)',
    fontSize: '14px',
    minWidth: '200px',
  },
  base: {
    color: 'var(--color-text-primary)',
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid var(--color-border-default)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};

const MindmapPanel = ({ noteContent }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getNodeStyle = (level) => ({
    ...NODE_STYLES.base,
    ...(level === 1 ? NODE_STYLES.root : level === 2 ? NODE_STYLES.topic : NODE_STYLES.detail),
  });

  const convertToNodesAndEdges = (markdownContent) => {
    const lines = markdownContent.split('\n').filter(line => line.trim());
    const nodes = [];
    const edges = [];
    let nodeId = 1;
    let previousIds = [0];
    
    // Calculate vertical spacing
    const levelNodes = {};
    lines.forEach(line => {
      const level = line.startsWith('#') 
        ? line.match(/^#+/)[0].length
        : line.startsWith('-') ? 3 : 1;
      levelNodes[level] = (levelNodes[level] || 0) + 1;
    });

    let levelCounters = {};
    lines.forEach((line) => {
      const level = line.startsWith('#') 
        ? line.match(/^#+/)[0].length
        : line.startsWith('-') ? 3 : 1;

      const text = line.replace(/^[#\s-]+/, '').trim();
      levelCounters[level] = (levelCounters[level] || 0) + 1;

      // Calculate position
      const xPos = level * 350; // Increased horizontal spacing
      const totalInLevel = levelNodes[level];
      const currentIndex = levelCounters[level];
      const yPos = (currentIndex - (totalInLevel + 1) / 2) * 120;

      nodes.push({
        id: nodeId.toString(),
        data: { label: text },
        position: { x: xPos, y: yPos },
        style: getNodeStyle(level),
      });

      if (nodeId > 1) {
        edges.push({
          id: `e${previousIds[level - 1]}-${nodeId}`,
          source: previousIds[level - 1].toString(),
          target: nodeId.toString(),
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--color-border-default)', strokeWidth: 3 },
        });
      }

      previousIds[level] = nodeId;
      nodeId++;
    });

    return { nodes, edges };
  };

  const generateMindmap = async () => {
    setIsLoading(true);
    try {
      let finalResponse = '';
      await askQuestion(
        noteContent,
        `Create a hierarchical mindmap in markdown format that summarizes the key points. Use this exact format with no additional text:
# ${noteContent.split(' ').slice(0, 3).join(' ')}...
## Key Finding 1
- Supporting Evidence
- Important Detail
## Key Finding 2
- Supporting Evidence
- Important Detail
## Key Finding 3
- Supporting Evidence
- Important Detail`,
        (chunk) => {
          finalResponse += chunk;
        },
      );

      const { nodes: newNodes, edges: newEdges } = convertToNodesAndEdges(finalResponse);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error generating mindmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView({ padding: 0.3 });
  }, []);

  return (
    <div className="h-full bg-gradient-mindmap overflow-x-hidden">
      {/* Header */}
      <div className="bg-surface-card/50 backdrop-blur-sm border-b border-border-subtle">
        <div style={{ maxWidth: '56rem' }} className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FiShare2 className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-content-primary to-content-secondary
                         bg-clip-text text-transparent">
                Mindmap
              </h2>
            </div>

            <button
              onClick={generateMindmap}
              disabled={isLoading}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                text-white shadow-lg shadow-blue-500/20 transition-all duration-200
                hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiPlay className="w-4 h-4 text-white" />
              )}
              <span className="font-medium">Generate Mindmap</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-transparent custom-scrollbar" style={{ height: 'calc(100% - 73px)' }}>
        <div className="w-full h-[750px] glass-card rounded-xl mt-6 p-1">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={onInit}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultZoom={0.8}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Controls className="glass-card rounded-lg" />
              <MiniMap 
                style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                className="glass-card rounded-lg"
                nodeColor={(node) => node.style.background}
              />
              <Background color="#e8f1ff" gap={16} size={1} />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 
                             flex items-center justify-center shadow-lg shadow-blue-500/20 
                             ring-4 ring-surface-card/50">
                  <FiShare2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-content-primary to-content-secondary
                             bg-clip-text text-transparent mb-4">
                  {isLoading ? 'Generating Mindmap' : 'No Mindmap Yet'}
                </h3>
                <p className="text-content-secondary mb-8 text-lg">
                  {isLoading 
                    ? 'Please wait while we analyze your note...'
                    : 'Click "Generate Mindmap" to visualize your note content.'}
                </p>
                {isLoading && (
                  <div className="w-10 h-10 mx-auto border-3 border-blue-500/30 border-t-blue-500 
                               rounded-full animate-spin" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindmapPanel;
