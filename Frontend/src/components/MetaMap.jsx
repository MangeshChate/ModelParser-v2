import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MetaMap = () => {
  const [allModelsData, setAllModelsData] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [currentModelData, setCurrentModelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);

  // Camera controls
  const controlsRef = useRef({
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    targetRotationX: 0,
    targetRotationY: 0,
    currentRotationX: 0,
    currentRotationY: 0,
    cameraDistance: 25,
    targetCameraDistance: 25,
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authorization token found");

        const response = await fetch("http://localhost:8080/api/metadata", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch metadata");

        const data = await response.json();
        console.log("Fetched server metadata:", data);

        setAllModelsData(data);

        // Set first model as selected by default
        if (data.length > 0) {
          setSelectedModel(data[0].file_name);
          setCurrentModelData(data[0].metadata_json);
        }
      } catch (err) {
        console.error("Error fetching model metadata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

 const getLayerDimensions = (layer) => {
  // Default values
  let width = 1;
  let height = 1;
  let depth = 1;
  
  // Safely check for attributes
  const layerAttributes = layer.attributes || [];
  const isConv = layerAttributes.includes('kernel_shape');
  const isActivation = layerAttributes.length === 0 && 
                      layer.inputs?.length === 1 && 
                      layer.outputs?.length === 1;

  if (isConv) {
    // Conv layers - make them wider
    width = 4;
    height = 2;
    depth = 1.5;
  } else if (isActivation) {
    // Activation layers - make them thin
    width = 2;
    height = 2;
    depth = 0.2;
  } else {
    // Other layers
    width = 3;
    height = 3;
    depth = 1;
  }

  return { width, height, depth };
};

const getLayerColor = (layer, index) => {
  // Safely check for attributes
  const layerAttributes = layer.attributes || [];
  const isConv = layerAttributes.includes('kernel_shape');
  const isActivation = layerAttributes.length === 0 && 
                      layer.inputs?.length === 1 && 
                      layer.outputs?.length === 1;

  const colors = {
    conv: [0x2196F3, 0x42A5F5],      // Blue shades for Conv
    activation: [0xFF9800, 0xFFB74D], // Orange shades for Activation
    default: [0x808080, 0x9E9E9E]     // Gray for others
  };

  if (isConv) return colors.conv[index % 2];
  if (isActivation) return colors.activation[index % 2];
  return colors.default[index % 2];
};

const createLayerTexture = (layer, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // Fix color conversion
  const hexColor = '#' + Math.floor(color).toString(16).padStart(6, '0');
  const darkerColor = '#' + Math.floor(color * 0.7).toString(16).padStart(6, '0');
  
  // Create gradient background
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, hexColor);
  gradient.addColorStop(1, darkerColor);
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  
  // Add pattern based on layer type
  context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  context.lineWidth = 2;
  
  const layerAttributes = layer.attributes || [];
  const isConv = layerAttributes.includes('kernel_shape');
  
  if (isConv) {
    // Grid pattern for conv layers
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        context.strokeRect(i * 64, j * 64, 64, 64);
      }
    }
  } else {
    // Dot pattern for other layers
    context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        context.beginPath();
        context.arc(i * 32 + 16, j * 32 + 16, 4, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

  const createNeuralNetworkVisualization = () => {
    if (!currentModelData || !containerRef.current) return;

    // Clear previous scene
    if (
      rendererRef.current &&
      containerRef.current.contains(rendererRef.current.domElement)
    ) {
      containerRef.current.removeChild(rendererRef.current.domElement);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1000 / 600, 0.1, 1000);
    camera.position.set(0, 5, 25);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(1000, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0a0a0a, 1);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.9);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 0.6, 50);
    pointLight1.position.set(-20, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.4, 50);
    pointLight2.position.set(20, -10, 10);
    scene.add(pointLight2);

    // Create layers
    const layers = currentModelData.layers || [];
    const layerSpacing = 3;
    const startZ = (-(layers.length - 1) * layerSpacing) / 2;

    const layerMeshes = [];

   layers.forEach((layer, index) => {
  // Safely get layer properties
  const layerAttributes = layer.attributes || [];
  const layerInputs = layer.inputs || [];
  const layerOutputs = layer.outputs || [];
  
  // Determine layer type
  let layerType = 'Operation';
  if (layerAttributes.includes('kernel_shape')) {
    layerType = 'Conv';
  } else if (layerAttributes.length === 0 && layerInputs.length === 1 && layerOutputs.length === 1) {
    layerType = 'Activation';
  }

  const z = startZ + index * layerSpacing;
  const dimensions = getLayerDimensions({
    ...layer,
    type: layerType
  });
  const color = getLayerColor(layer, index);

  // Create layer geometry
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );

  // Create material with texture
  const texture = createLayerTexture({
    ...layer,
    type: layerType
  }, color);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    shininess: 100,
    specular: 0x111111,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Add subtle animation
  mesh.userData = {
    originalPosition: { x: 0, y: 0, z: z },
    animationOffset: index * 0.5,
    layer: {
      ...layer,
      type: layerType
    },
  };

  scene.add(mesh);
  layerMeshes.push(mesh);

  // Create connections between layers
  if (index < layers.length - 1) {
    const connectionGeometry = new THREE.CylinderGeometry(
      0.02,
      0.02,
      layerSpacing * 0.8
    );
    const connectionMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.6,
    });
    const connection = new THREE.Mesh(
      connectionGeometry,
      connectionMaterial
    );
    connection.rotation.x = Math.PI / 2;
    connection.position.set(0, 0, z + layerSpacing / 2);
    scene.add(connection);
  }

  // Add layer labels
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  context.fillStyle = "rgba(0, 0, 0, 0.8)";
  context.fillRect(0, 0, 512, 128);

  context.fillStyle = "white";
  context.font = "bold 24px Arial";
  context.textAlign = "center";

  // Use layer ID if name not available
  const layerName = layer.name || `Layer ${layer.id}`;
  context.fillText(layerName, 256, 40);

  context.font = "18px Arial";
  context.fillText(layerType, 256, 65);

  // Show inputs/outputs count
  context.font = "14px Arial";
  context.fillText(`Inputs: ${layerInputs.length}`, 150, 90);
  context.fillText(`Outputs: ${layerOutputs.length}`, 350, 90);

  // Show additional attributes if available
  if (layerAttributes.length > 0) {
    context.fillText(`Attributes: ${layerAttributes.join(', ')}`, 256, 110);
  }

  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const labelGeometry = new THREE.PlaneGeometry(4, 1);
  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  label.position.set(0, -dimensions.height / 2 - 1, z);
  scene.add(label);
});

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Smooth camera controls
      const controls = controlsRef.current;
      controls.currentRotationX +=
        (controls.targetRotationX - controls.currentRotationX) * 0.05;
      controls.currentRotationY +=
        (controls.targetRotationY - controls.currentRotationY) * 0.05;
      controls.cameraDistance +=
        (controls.targetCameraDistance - controls.cameraDistance) * 0.1;

      // Update camera position
      const x =
        Math.sin(controls.currentRotationY) *
        Math.cos(controls.currentRotationX) *
        controls.cameraDistance;
      const y = Math.sin(controls.currentRotationX) * controls.cameraDistance;
      const z =
        Math.cos(controls.currentRotationY) *
        Math.cos(controls.currentRotationX) *
        controls.cameraDistance;

      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);

      // Animate layers
      layerMeshes.forEach((mesh, index) => {
        const time = Date.now() * 0.001;
        mesh.rotation.y = Math.sin(time + mesh.userData.animationOffset) * 0.1;
        mesh.position.y =
          mesh.userData.originalPosition.y +
          Math.sin(time * 0.5 + mesh.userData.animationOffset) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();
  };

  // Mouse and keyboard event handlers
  const handleMouseDown = (event) => {
    const controls = controlsRef.current;
    controls.isMouseDown = true;
    controls.mouseX = event.clientX;
    controls.mouseY = event.clientY;
  };

  const handleMouseMove = (event) => {
    const controls = controlsRef.current;
    if (!controls.isMouseDown) return;

    const deltaX = event.clientX - controls.mouseX;
    const deltaY = event.clientY - controls.mouseY;

    controls.targetRotationY += deltaX * 0.01;
    controls.targetRotationX -= deltaY * 0.01;

    // Clamp vertical rotation
    controls.targetRotationX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, controls.targetRotationX)
    );

    controls.mouseX = event.clientX;
    controls.mouseY = event.clientY;
  };

  const handleMouseUp = () => {
    controlsRef.current.isMouseDown = false;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const controls = controlsRef.current;
    controls.targetCameraDistance += event.deltaY * 0.01;
    controls.targetCameraDistance = Math.max(
      5,
      Math.min(50, controls.targetCameraDistance)
    );
  };

  const handleKeyDown = (event) => {
    const controls = controlsRef.current;
    const speed = 2;

    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        controls.targetCameraDistance -= speed;
        break;
      case "s":
      case "arrowdown":
        controls.targetCameraDistance += speed;
        break;
      case "a":
      case "arrowleft":
        controls.targetRotationY -= 0.1;
        break;
      case "d":
      case "arrowright":
        controls.targetRotationY += 0.1;
        break;
    }

    controls.targetCameraDistance = Math.max(
      5,
      Math.min(50, controls.targetCameraDistance)
    );
  };

  useEffect(() => {
    const handleKeyDownGlobal = (event) => handleKeyDown(event);

    window.addEventListener("keydown", handleKeyDownGlobal);

    return () => {
      window.removeEventListener("keydown", handleKeyDownGlobal);
    };
  }, []);

  useEffect(() => {
    createNeuralNetworkVisualization();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [currentModelData, selectedModel]);

const handleModelChange = (event) => {
  const fileName = event.target.value;
  setSelectedModel(fileName);
  const selectedModelData = allModelsData.find(
    (model) => model.file_name === fileName
  );
  if (selectedModelData) {
    // Transform ONNX data to expected format
    const modelData = {
      ...selectedModelData,
      layers: (selectedModelData.layers || []).map(layer => ({
        ...layer,
        attributes: layer.attributes || [],
        inputs: layer.inputs || [],
        outputs: layer.outputs || [],
        type: (layer.attributes || []).includes('kernel_shape') ? 'Conv' : 
              ((layer.attributes || []).length === 0 ? 'Activation' : 'Operation')
      }))
    };
    setCurrentModelData(modelData);
  }
};

  const resetCamera = () => {
    const controls = controlsRef.current;
    controls.targetRotationX = 0;
    controls.targetRotationY = 0;
    controls.targetCameraDistance = 25;
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <h1 style={{ marginBottom: "20px", color: "#333" }}>
        3D Neural Network Visualization
      </h1>

      {loading ? (
        <p>Loading models...</p>
      ) : allModelsData.length === 0 ? (
        <p>No models available or failed to load models.</p>
      ) : (
        <>
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <select
              value={selectedModel}
              onChange={handleModelChange}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select a model</option>
              {allModelsData.map((model) => (
                <option key={model.id} value={model.file_name}>
                  {model.file_name}
                </option>
              ))}
            </select>

            <button
              onClick={resetCamera}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                border: "1px solid #007bff",
                borderRadius: "4px",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
              }}
            >
              Reset View
            </button>
          </div>

          {selectedModel && (
            <h2 style={{ color: "#333", marginBottom: "20px" }}>
              {selectedModel} - TensorSpace Style Visualization
            </h2>
          )}

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            tabIndex={0}
            style={{
              width: "1000px",
              height: "600px",
              border: "2px solid #333",
              borderRadius: "12px",
              boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
              cursor: controlsRef.current?.isMouseDown ? "grabbing" : "grab",
              position: "relative",
              overflow: "hidden",
              outline: "none",
              background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              color: "#666",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Controls:</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginTop: "10px",
              }}
            >
              <div>
                <h4>Mouse Controls:</h4>
                <ul
                  style={{ lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}
                >
                  <li>
                    <strong>Drag:</strong> Rotate camera around model
                  </li>
                  <li>
                    <strong>Wheel:</strong> Zoom in/out
                  </li>
                </ul>
              </div>
              <div>
                <h4>Keyboard Controls:</h4>
                <ul
                  style={{ lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}
                >
                  <li>
                    <strong>W/↑:</strong> Move forward
                  </li>
                  <li>
                    <strong>S/↓:</strong> Move backward
                  </li>
                  <li>
                    <strong>A/←:</strong> Rotate left
                  </li>
                  <li>
                    <strong>D/→:</strong> Rotate right
                  </li>
                </ul>
              </div>
            </div>

            <h4 style={{ marginTop: "15px" }}>Layer Features:</h4>
            <ul style={{ lineHeight: "1.6", margin: 0, paddingLeft: "20px" }}>
              <li>
                Layers are visualized as textured 3D blocks similar to
                TensorSpace.js
              </li>
              <li>Each layer type has distinct colors and patterns</li>
              <li>Connections show data flow between layers</li>
              <li>Hover effects and smooth animations</li>
              <li>Layer information displayed below each block</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default MetaMap;
