import React, { useState, useCallback, useRef, version } from "react";
import {
  Menu,
  Settings,
  Database,
  Play,
  MessageSquarePlus,
  Brain,
  Target,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Move,
  Terminal,
  MousePointer,
  Type,
  Image,
  Trash2,
  Copy,
  Edit,
  Plus,
  Undo2,
  Redo2,
} from "lucide-react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
  addEdge,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import ImageNode from "./components/ImageNode";
import TextNode from "./components/TextNode";
import BlockNode from "./components/BlockNode";
import ActionBar from "./components/ActionBar";
import RightPanel from "./components/RightPanel";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import CustomEdge from "./components/CustomEdge";

const ContextMenu = ({ x, y, onClose, onDelete, onCreateComponent }) => {
  return (
    <div
      className="fixed bg-white rounded-md shadow-lg py-1 min-w-[180px] text-sm z-50"
      style={{
        left: x,
        top: y,
      }}
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center space-x-2"
        onClick={onCreateComponent}
      >
        <Plus size={14} />
        <span>Create component</span>
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center space-x-2"
        onClick={onDelete}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
};

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  blockNode: BlockNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function FlowCanvas({ onStepSelect, onStepUpdate }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [interactionMode, setInteractionMode] = useState("select");
  const [contextMenu, setContextMenu] = useState(null);
  const [pendingImagePosition, setPendingImagePosition] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { project, undo, redo, canUndo, canRedo } = useReactFlow();
  const selectedNodesRef = useRef([]);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      selectedNodesRef.current = nodes;
    },
  });

  // const onConnect = useCallback(
  //   (params: Connection) => {
  //     console.log(params);
  //     const sourceHasConnection = edges.some(
  //       (edge) =>
  //         edge.source === params.source &&
  //         edge.sourceHandle === params.sourceHandle
  //     );

  //     if (sourceHasConnection) {
  //       setEdges((eds) =>
  //         eds.filter(
  //           (edge) =>
  //             !(
  //               edge.source === params.source &&
  //               edge.sourceHandle === params.sourceHandle
  //             )
  //         )
  //       );
  //     }

  //     const newEdge = {
  //       ...params,
  //       type: "custom",
  //       animated: false,
  //       style: {
  //         stroke: "#2563eb",
  //         strokeWidth: 2,
  //       },
  //     };

  //     setEdges((eds) => addEdge(newEdge, eds));
  //   },
  //   [edges, setEdges]
  // );

  const onConnect = useCallback(
    (params: Connection) => {
      const isStepConnection =
        params.sourceHandle?.startsWith("step-source-") ||
        params.targetHandle?.startsWith("step-target-");

      if (isStepConnection) {
        // for step
        const sourceStepId = params.sourceHandle?.replace("step-source-", "");
        const targetStepId = params.targetHandle?.replace("step-target-", "");

        const newEdge = {
          ...params,
          type: "custom",
          animated: true,
          style: {
            stroke: "#10b981",
            strokeWidth: 1.5,
            strokeDasharray: "5,5",
          },
          data: {
            connectionType: "step",
            sourceStepId,
            targetStepId,
          },
        };

        setEdges((eds) => addEdge(newEdge, eds));
      } else {
        // for block
        const sourceHasConnection = edges.some(
          (edge) =>
            edge.source === params.source &&
            edge.sourceHandle === params.sourceHandle
        );

        if (sourceHasConnection) {
          setEdges((eds) =>
            eds.filter(
              (edge) =>
                !(
                  edge.source === params.source &&
                  edge.sourceHandle === params.sourceHandle
                )
            )
          );
        }

        const newEdge = {
          ...params,
          type: "custom",
          animated: false,
          style: {
            stroke: "#2563eb",
            strokeWidth: 20,
            zIndex: "0 !important",
          },
          data: {
            connectionType: "block",
          },
        };

        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [edges, setEdges]
  );

  const handlePaneClick = useCallback(
    (event) => {
      if (contextMenu) {
        setContextMenu(null);
        return;
      }

      const bounds = event.target.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      if (interactionMode === "text") {
        const newNode = {
          id: `text-${Date.now()}`,
          type: "textNode",
          position,
          data: {
            text: "",
            onChange: (newText) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === `text-${Date.now()}`
                    ? { ...node, data: { ...node.data, text: newText } }
                    : node
                )
              );
            },
            onContextMenu: (e) => handleContextMenu(e),
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setInteractionMode("select");
      } else if (interactionMode === "image") {
        setPendingImagePosition(position);
        fileInputRef.current?.click();
      }
    },
    [interactionMode, project, setNodes, contextMenu]
  );

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (selectedNodesRef.current.length > 0) {
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    }
  }, []);

  const handleDelete = useCallback(() => {
    setNodes((nds) =>
      nds.filter(
        (node) => !selectedNodesRef.current.find((n) => n.id === node.id)
      )
    );
    setContextMenu(null);
  }, [setNodes]);

  const handleCreateComponent = useCallback(() => {
    const position = selectedNodesRef.current[0]?.position || { x: 0, y: 0 };
    const newNode = {
      id: `text-${Date.now()}`,
      type: "textNode",
      position: {
        x: position.x + 100,
        y: position.y,
      },
      data: {
        text: "",
        onChange: (newText) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === `text-${Date.now()}`
                ? { ...node, data: { ...node.data, text: newText } }
                : node
            )
          );
        },
        onContextMenu: (e) => handleContextMenu(e),
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setContextMenu(null);
  }, [setNodes]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && pendingImagePosition) {
        const imageUrl = URL.createObjectURL(file);
        const newNode = {
          id: `image-${Date.now()}`,
          type: "imageNode",
          position: pendingImagePosition,
          data: {
            imageUrl,
            width: 200,
            height: 150,
            onContextMenu: (e) => handleContextMenu(e),
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setPendingImagePosition(null);
        event.target.value = "";
        setInteractionMode("select");
      }
    },
    [pendingImagePosition, setNodes]
  );

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const handleAddBlock = useCallback(
    (position) => {
      const newBlockId = `block-${Date.now()}`;
      const newNode = {
        id: newBlockId,
        type: "blockNode",
        position,
        data: {
          label: "New Block",
          steps: [],
          updateNodeInternals: () => updateNodeInternals(newBlockId),
          onAddStep: (stepType) => {
            const newStep = {
              id: `step-${Date.now()}`,
              type: stepType,
            };
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newBlockId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        steps: [...node.data.steps, newStep],
                      },
                    }
                  : node
              )
            );
          },
          onDeleteStep: (stepId) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newBlockId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        steps: node.data.steps.filter(
                          (step) => step.id !== stepId
                        ),
                      },
                    }
                  : node
              )
            );
          },
          onDeleteBlock: () => {
            setNodes((nds) => nds.filter((node) => node.id !== newBlockId));
          },
          onReorderSteps: (newSteps) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newBlockId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        steps: newSteps,
                      },
                    }
                  : node
              )
            );
          },
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const interactionTools = [
    { icon: MousePointer, mode: "select", label: "Select" },
    { icon: Move, mode: "move", label: "Move" },
    { icon: Type, mode: "text", label: "Add Text" },
    { icon: Image, mode: "image", label: "Add Image" },
    {
      icon: Plus,
      mode: "block",
      label: "Add Block",
      onClick: () => {
        const center = {
          x: window.innerWidth / 2 - 150,
          y: window.innerHeight / 2 - 100,
        };
        handleAddBlock(center);
      },
    },
  ];

  console.log(edges);
  return (
    <div
      className="relative flex-1 bg-gray-100"
      onContextMenu={handleContextMenu}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            zIndex: node.id === draggingNodeId ? 5000 : 1,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={(e, node) => setDraggingNodeId(node.id)}
        onNodeDragStop={(e, node) => setDraggingNodeId(null)}
        onPaneClick={handlePaneClick}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: "custom",
        }}
        fitView
        panOnDrag={interactionMode === "move"}
        selectNodesOnDrag={interactionMode === "select"}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        selectionMode={SelectionMode.Partial}
        selectionOnDrag={true}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Control"
      >
        <Background />
        <Controls />
        <MiniMap />

        <Panel position="top-left" className="ml-2 mt-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            {interactionTools.map((tool) => (
              <button
                key={tool.mode}
                onClick={() =>
                  tool.onClick ? tool.onClick() : setInteractionMode(tool.mode)
                }
                className={`p-2 rounded-md w-full flex items-center space-x-2 mb-1 last:mb-0 ${
                  interactionMode === tool.mode
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title={tool.label}
              >
                <tool.icon size={16} />
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel position="top" className="flex justify-center mt-2">
          <div className="history-buttons">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-md ${
                canUndo ? "text-gray-600 hover:bg-gray-50" : "text-gray-300"
              }`}
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-md ${
                canRedo ? "text-gray-600 hover:bg-gray-50" : "text-gray-300"
              }`}
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDelete}
          onCreateComponent={handleCreateComponent}
        />
      )}

      <button
        onClick={() => setShowLogs(!showLogs)}
        className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-lg border border-gray-200 hover:bg-gray-50"
      >
        <Terminal size={20} className="text-gray-600" />
      </button>

      {showLogs && (
        <div className="absolute bottom-16 right-4 w-96 h-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium">Logs</span>
            <button
              onClick={() => setShowLogs(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="p-4 h-full overflow-auto bg-gray-900 text-gray-300 font-mono text-sm">
            <div>Flow initialized</div>
            <div>Waiting for actions...</div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedStep, setSelectedStep] = useState(null);
  const [variables, setVariables] = useState([
    { name: "FLOW.guest_name", value: "" },
    { name: "VISITOR.name", value: "" },
    { name: "FLOW.check_in", value: "" },
  ]);

  const handleStepSelect = useCallback((step) => {
    setSelectedStep(step);
  }, []);

  const handleStepUpdate = useCallback((stepId, content) => {
    console.log("Step update:", stepId, content);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <TopBar toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        <div className="flex-1 flex flex-col">
          <ActionBar />
          <ReactFlowProvider>
            <FlowCanvas
              onStepSelect={handleStepSelect}
              onStepUpdate={handleStepUpdate}
            />
          </ReactFlowProvider>
        </div>
        <RightPanel
          selectedStep={selectedStep}
          variables={variables}
          onUpdateStep={handleStepUpdate}
        />
      </div>
    </div>
  );
}

export default App;
