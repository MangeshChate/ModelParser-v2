import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Arrow } from "react-konva";
import ELK from "elkjs/lib/elk.bundled.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Constants
const NODE_WIDTH = 200;
const NODE_HEIGHT = 120;
const INPUT_NODE_WIDTH = 140;
const INPUT_NODE_HEIGHT = 80;
const OUTPUT_NODE_WIDTH = 140;
const OUTPUT_NODE_HEIGHT = 80;

const getNodeColor = (nodeType) => {
  const colors = {
    Conv: { fill: "#3498db", shadow: "#2980b9" },
    ReLU: { fill: "#e74c3c", shadow: "#c0392b" },
    MaxPool: { fill: "#f39c12", shadow: "#e67e22" },
    BatchNorm: { fill: "#9b59b6", shadow: "#8e44ad" },
    Linear: { fill: "#1abc9c", shadow: "#16a085" },
    Dropout: { fill: "#95a5a6", shadow: "#7f8c8d" },
    Input: { fill: "#2ecc71", shadow: "#27ae60" },
    Output: { fill: "#e67e22", shadow: "#d35400" },
    default: { fill: "#34495e", shadow: "#2c3e50" },
  };
  return colors[nodeType] || colors.default;
};

const Map = () => {
  const [graph, setGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1600, height: 800 });
  const [allModelsData, setAllModelsData] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [currentModelData, setCurrentModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Fetch all models metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authorization token found");
        }

        const response = await fetch("http://localhost:8080/api/metadata", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched models data:", data);
        setAllModelsData(data);

        if (data.length > 0) {
          setSelectedModel(data[0].file_name);
          setCurrentModelData(data[0].metadata_json);
        }
        console.log(data[0].metadata_json);
      } catch (err) {
        console.error("Error fetching model metadata:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);
  const getLayerType = (layer) => {
    // Since your data doesn't include operation type, we'll need to infer it
    // You might need to adjust this based on your actual data structure
    if (layer.attributes?.includes("kernel_shape")) {
      return "Conv";
    }
    if (layer.attributes?.includes("perm")) {
      return "Transpose";
    }
    if (layer.attributes?.includes("value")) {
      return "Constant";
    }
    if (layer.inputs?.length === 1 && layer.outputs?.length === 1) {
      return "ReLU"; // Could be activation
    }
    return "default";
  };
  // Process and layout graph when model data changes
  useEffect(() => {
    if (!currentModelData) return;

    console.log("Current model data:", currentModelData);
    console.log("Graph structure:", currentModelData.graph);
    console.log("Nodes:", currentModelData.graph?.nodes);
    console.log("Inputs:", currentModelData.graph?.inputs);
    console.log("Outputs:", currentModelData.graph?.outputs);

  const layoutGraph = async () => {
  try {
    const elk = new ELK();

    // Helper function to get operation type and details
    const getLayerDetails = (layer) => {
      const hasConvAttribs = layer.attributes?.some(attr => 
        ['kernel_shape', 'dilations', 'pads', 'strides'].includes(attr)
      );
      const hasTransposeAttribs = layer.attributes?.includes('perm');
      const hasConstantAttribs = layer.attributes?.includes('value');
      
      if (hasConvAttribs) return { type: 'Conv', height: 140 };
      if (hasTransposeAttribs) return { type: 'Transpose', height: 100 };
      if (hasConstantAttribs) return { type: 'Constant', height: 80 };
      if (layer.inputs?.length === 1 && layer.outputs?.length === 1 && !layer.attributes?.length) {
        return { type: 'ReLU', height: 80 };
      }
      return { type: 'Reshape', height: 100 };
    };

    // Create nodes with detailed information
    const nodes = currentModelData.layers?.map((layer) => {
      const details = getLayerDetails(layer);
      
      return {
        id: `layer_${layer.id}`,
        width: NODE_WIDTH,
        height: details.height,
        labels: [{ text: details.type }],
        nodeType: details.type,
        originalNode: layer,
        layerDetails: {
          weights: layer.inputs?.filter(input => 
            input.includes('weight') || input.includes('conv')
          ),
          biases: layer.inputs?.filter(input => input.includes('bias')),
          attributes: layer.attributes || [],
          inputs: layer.inputs || [],
          outputs: layer.outputs || []
        }
      };
    }) || [];

    // Create input node (only the main input, not weights/biases)
    const mainInputs = currentModelData.inputs?.filter(input => 
      !input.includes('weight') && !input.includes('bias')
    ) || [];
    
    const inputs = mainInputs.map((input) => ({
      id: input,
      width: INPUT_NODE_WIDTH,
      height: INPUT_NODE_HEIGHT,
      labels: [{ text: input }],
      nodeType: "Input",
    }));

    const outputs = currentModelData.outputs?.map((output) => ({
      id: output,
      width: OUTPUT_NODE_WIDTH,
      height: OUTPUT_NODE_HEIGHT,
      labels: [{ text: output }],
      nodeType: "Output",
    })) || [];

    // Create tensor to node mapping
    const tensorToNodeMap = new globalThis.Map();
    
    // Map layer outputs to their nodes
    nodes.forEach(node => {
      if (node.originalNode?.outputs) {
        node.originalNode.outputs.forEach(output => {
          tensorToNodeMap.set(output, node.id);
        });
      }
    });

    // Map inputs
    inputs.forEach(input => {
      tensorToNodeMap.set(input.id, input.id);
    });

    const edges = [];

    // Create edges for data flow (not weight/bias connections)
    currentModelData.layers?.forEach((layer) => {
      const targetNodeId = `layer_${layer.id}`;
      
      // Only connect data tensors, not weight/bias tensors
      const dataInputs = layer.inputs?.filter(input => 
        !input.includes('weight') && !input.includes('bias')
      ) || [];
      
      dataInputs.forEach((inputTensor) => {
        const sourceNodeId = tensorToNodeMap.get(inputTensor);
        if (sourceNodeId && targetNodeId && sourceNodeId !== targetNodeId) {
          edges.push({
            id: `${sourceNodeId}->${targetNodeId}`,
            sources: [sourceNodeId],
            targets: [targetNodeId],
          });
        }
      });
    });

    // Connect to outputs
    currentModelData.outputs?.forEach((output) => {
      const sourceLayer = currentModelData.layers?.find((layer) =>
        layer.outputs?.includes(output)
      );
      if (sourceLayer) {
        const sourceNodeId = `layer_${sourceLayer.id}`;
        edges.push({
          id: `${sourceNodeId}->${output}`,
          sources: [sourceNodeId],
          targets: [output],
        });
      }
    });

    const elkGraph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "50",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.spacing.edgeNode": "30",
      },
      children: [...inputs, ...nodes, ...outputs],
      edges,
    };

    const layout = await elk.layout(elkGraph);
    
    if (!layout.children || layout.children.length === 0) {
      setError('No nodes found in the model graph');
      return;
    }
    
    setGraph(layout);
    setDebugInfo(
      `Graph created with ${layout.children?.length || 0} nodes and ${
        layout.edges?.length || 0
      } edges`
    );
  } catch (err) {
    console.error("Graph layout error:", err);
    setError(`Failed to layout graph: ${err.message}`);
  }
};
    layoutGraph();
  }, [currentModelData]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(800, rect.width - 40),
          height: Math.max(600, rect.height - 40),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handle model selection change
  const handleModelChange = (fileName) => {
    const selected = allModelsData.find(
      (model) => model.file_name === fileName
    );
    if (selected) {
      setSelectedModel(fileName);
      setCurrentModelData(selected.metadata_json);
    }
  };

  // Node component
const NodeComponent = ({ node, isHovered, isSelected }) => {
  const colors = getNodeColor(node.nodeType);
  const details = node.layerDetails;

  return (
    <Group
      x={node.x}
      y={node.y}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
      onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
    >
      <Rect
        width={node.width}
        height={node.height}
        fill={colors.fill}
        cornerRadius={8}
        stroke={isSelected ? "#fff" : isHovered ? "#ffff00" : "transparent"}
        strokeWidth={2}
        shadowColor={colors.shadow}
        shadowBlur={8}
        shadowOpacity={0.6}
      />
      
      {/* Layer type header */}
      <Text
        text={node.labels[0].text}
        x={10}
        y={10}
        fontSize={14}
        fontStyle="bold"
        fill="#fff"
        width={node.width - 20}
        align="center"
      />
      
      {/* Display detailed information for different node types */}
      {details && (
        <>
          {/* Weights info */}
          {details.weights?.length > 0 && (
            <Text
              text={`W (${details.weights[0].split('.')[0]})`}
              x={10}
              y={35}
              fontSize={11}
              fill="#fff"
              width={node.width - 20}
            />
          )}
          
          {/* Biases info */}
          {details.biases?.length > 0 && (
            <Text
              text={`B (${details.biases[0].split('.')[0]})`}
              x={10}
              y={50}
              fontSize={11}
              fill="#fff"
              width={node.width - 20}
            />
          )}
          
          {/* Attributes for Conv layers */}
          {node.nodeType === 'Conv' && details.attributes?.length > 0 && (
            <>
              <Text
                text="dilations = 1, 1"
                x={10}
                y={70}
                fontSize={10}
                fill="#fff"
                width={node.width - 20}
              />
              <Text
                text="kernel_shape = 3, 3"
                x={10}
                y={85}
                fontSize={10}
                fill="#fff"
                width={node.width - 20}
              />
              <Text
                text="pads = 1, 1, 1, 1"
                x={10}
                y={100}
                fontSize={10}
                fill="#fff"
                width={node.width - 20}
              />
              <Text
                text="strides = 1, 1"
                x={10}
                y={115}
                fontSize={10}
                fill="#fff"
                width={node.width - 20}
              />
            </>
          )}
          
          {/* For Reshape nodes */}
          {node.nodeType === 'Reshape' && (
            <Text
              text="shape (?)"
              x={10}
              y={50}
              fontSize={11}
              fill="#fff"
              width={node.width - 20}
            />
          )}
          
          {/* For Transpose nodes */}
          {node.nodeType === 'Transpose' && (
            <Text
              text="perm = 0, 1, 4, 2, ..."
              x={10}
              y={50}
              fontSize={11}
              fill="#fff"
              width={node.width - 20}
            />
          )}
        </>
      )}
    </Group>
  );
};

  // Arrow component
  const ArrowComponent = ({ edge, fromNode, toNode }) => {
    if (!fromNode || !toNode || !fromNode.x || !toNode.x) {
      console.warn("Arrow component missing node positions:", {
        fromNode: fromNode?.id,
        toNode: toNode?.id,
      });
      return null;
    }

    const fromX = fromNode.x + fromNode.width;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x;
    const toY = toNode.y + toNode.height / 2;

    return (
      <Arrow
        points={[fromX, fromY, toX, toY]}
        stroke="#666"
        strokeWidth={2}
        fill="#666"
        pointerLength={10}
        pointerWidth={8}
      />
    );
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleResetView = () => {
    setScale(1);
    // Center the graph in the view
    if (graph && graph.children && graph.children.length > 0) {
      const bounds = graph.children.reduce(
        (acc, node) => ({
          minX: Math.min(acc.minX, node.x || 0),
          minY: Math.min(acc.minY, node.y || 0),
          maxX: Math.max(acc.maxX, (node.x || 0) + (node.width || 0)),
          maxY: Math.max(acc.maxY, (node.y || 0) + (node.height || 0)),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      const centerX =
        (dimensions.width - (bounds.maxX - bounds.minX)) / 2 - bounds.minX;
      const centerY =
        (dimensions.height - (bounds.maxY - bounds.minY)) / 2 - bounds.minY;

      setPosition({ x: centerX, y: centerY });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden shadow-2xl border-r">
      {/* Debug Panel */}
      <div className="p-4 bg-blue-100 border-b overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm font-mono">Debug: {debugInfo}</div>
          <div className="text-sm">
            Nodes: {graph?.children?.length || 0} | Edges:{" "}
            {graph?.edges?.length || 0} | Scale: {scale.toFixed(2)} | Position:
            ({position.x.toFixed(0)}, {position.y.toFixed(0)})
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zoom Out
          </button>
          <button
            onClick={handleResetView}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reset View
          </button>
        </div>

        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {allModelsData.map((model) => (
              <SelectItem key={model.id} value={model.file_name}>
                {model.file_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-white">
        {graph && graph.children && graph.children.length > 0 ? (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            ref={stageRef}
            draggable
            onDragEnd={(e) => {
              const newPos = { x: e.target.x(), y: e.target.y() };
              setPosition(newPos);
            }}
            onWheel={(e) => {
              e.evt.preventDefault();
              const scaleBy = 1.05;
              const stage = e.target.getStage();
              const oldScale = stage.scaleX();
              const mousePointTo = {
                x:
                  stage.getPointerPosition().x / oldScale -
                  stage.x() / oldScale,
                y:
                  stage.getPointerPosition().y / oldScale -
                  stage.y() / oldScale,
              };
              const newScale =
                e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
              const boundedScale = Math.max(0.1, Math.min(3, newScale));

              setScale(boundedScale);
              setPosition({
                x:
                  -(
                    mousePointTo.x -
                    stage.getPointerPosition().x / boundedScale
                  ) * boundedScale,
                y:
                  -(
                    mousePointTo.y -
                    stage.getPointerPosition().y / boundedScale
                  ) * boundedScale,
              });
            }}
          >
            <Layer>
              {/* Render edges first (behind nodes) */}
              {graph.edges?.map((edge) => {
                const fromNode = graph.children.find(
                  (n) => n.id === edge.sources[0]
                );
                const toNode = graph.children.find(
                  (n) => n.id === edge.targets[0]
                );
                return (
                  <ArrowComponent
                    key={edge.id}
                    edge={edge}
                    fromNode={fromNode}
                    toNode={toNode}
                  />
                );
              })}

              {/* Render nodes on top */}
              {graph.children?.map((node) => (
                <NodeComponent
                  key={node.id}
                  node={node}
                  isHovered={hoveredNode === node.id}
                  isSelected={selectedNode === node.id}
                />
              ))}
            </Layer>
          </Stage>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg mb-2">No graph visualization available</p>
            <p className="text-sm">Model: {selectedModel}</p>
            <p className="text-sm">Graph exists: {!!graph}</p>
            <p className="text-sm">
              Children count: {graph?.children?.length || 0}
            </p>
            <p className="text-sm">
              Current model data exists: {!!currentModelData}
            </p>
            {currentModelData && (
              <div className="mt-4 text-xs">
                <p>
                  Available data keys:{" "}
                  {Object.keys(currentModelData).join(", ")}
                </p>
                {currentModelData.graph && (
                  <p>
                    Graph keys: {Object.keys(currentModelData.graph).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="absolute top-20 right-4 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-lg mb-2">Node Details</h3>
          <p>
            <strong>ID:</strong> {selectedNode}
          </p>
          <p>
            <strong>Hovered:</strong> {hoveredNode || "None"}
          </p>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;
