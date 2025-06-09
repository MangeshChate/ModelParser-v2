import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Brain,
  Layers,
  Network,
  BarChart3,
  Target,
  Settings,
} from "lucide-react";

const ModelDashboard = () => {
  const [allModelsData, setAllModelsData] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [currentModelData, setCurrentModelData] = useState(null);
  const [processedChartData, setProcessedChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Process metadata to extract chart data
  const processModelData = (metadata) => {
    if (!metadata) return null;

    // Extract operator frequency from metadata
    const operatorFrequency = metadata.analysis?.operatorFrequency || {};
    const layers = metadata.layers || [];
    const totalNodes = metadata.analysis?.totalNodes || 0;
    const totalInitializers = metadata.analysis?.totalInitializers || 0;
    const inputs = metadata.analysis?.totalInputs || 0;
    const outputs = metadata.analysis?.totalOutputs || 0;

    // Convert operator frequency to chart data
    const operatorChartData = Object.entries(operatorFrequency).map(
      ([name, count]) => ({
        name,
        count,
        percentage: ((count / totalNodes) * 100).toFixed(1),
      })
    );

    return {
      operatorFrequency: operatorChartData,
      inputsOutputs: [
        { name: "Inputs", value: inputs, color: "#8884d8" },
        { name: "Outputs", value: outputs, color: "#82ca9d" },
      ],
      layers: layers.map((layer) => ({
        id: layer.id,
        type: "Unknown", // You might want to add type detection logic
        attributes: layer.attributes?.join(", ") || "None",
        kernelShape: layer.attributes?.includes("kernel_shape")
          ? "Present"
          : null, // Adjust based on actual kernel shape data
      })),
      complexity: {
        totalNodes,
        totalInitializers,
        inputOutputRatio: `${inputs}:${outputs}`,
      },
    };
  };

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
          setProcessedChartData(processModelData(data[0].metadata_json));
        }
      } catch (err) {
        console.error("Error fetching model metadata:", err);
        // For demo purposes, you can add some fallback here
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleModelChange = (fileName) => {
    setSelectedModel(fileName);
    const selectedModelData = allModelsData.find(
      (model) => model.file_name === fileName
    );
    if (selectedModelData) {
      setCurrentModelData(selectedModelData.metadata_json);
      setProcessedChartData(processModelData(selectedModelData.metadata_json));
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const JsonViewer = ({ data, title }) => {
    const renderValue = (value, key = "") => {
      if (value === null) return <span className="text-gray-500">null</span>;
      if (typeof value === "boolean")
        return <span className="text-blue-600">{value.toString()}</span>;
      if (typeof value === "number")
        return <span className="text-green-600">{value}</span>;
      if (typeof value === "string")
        return <span className="text-red-600">"{value}"</span>;
      if (Array.isArray(value)) {
        return (
          <div className="ml-4">
            <span className="text-gray-600">[</span>
            {value.map((item, index) => (
              <div key={index} className="ml-4">
                {renderValue(item)}
                {index < value.length - 1 && ","}
              </div>
            ))}
            <span className="text-gray-600">]</span>
          </div>
        );
      }
      if (typeof value === "object") {
        return (
          <div className="ml-4">
            <span className="text-gray-600">{"{"}</span>
            {Object.entries(value).map(([k, v], index, arr) => (
              <div key={k} className="ml-4">
                <span className="text-purple-600">"{k}"</span>
                <span className="text-gray-600">: </span>
                {renderValue(v, k)}
                {index < arr.length - 1 && (
                  <span className="text-gray-600">,</span>
                )}
              </div>
            ))}
            <span className="text-gray-600">{"}"}</span>
          </div>
        );
      }
      return String(value);
    };

    return (
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
            {renderValue(data)}
            sdf
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Model Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  Comprehensive model analysis and visualization
                </p>
              </div>
            </div>
            <div className="w-64">
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full">
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
          </div>
        </div>

        {processedChartData && currentModelData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Charts Section */}
            <div className="space-y-6">
              {/* Operator Distribution */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Operator Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of operators in the model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedChartData.operatorFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inputs/Outputs Donut Chart */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Inputs vs Outputs
                  </CardTitle>
                  <CardDescription>
                    Model input/output distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={processedChartData.inputsOutputs}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {processedChartData.inputsOutputs.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              

              {/* Complexity Metrics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Complexity Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {processedChartData.complexity.totalNodes}
                      </div>
                      <div className="text-sm text-gray-600">Total Nodes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {processedChartData.complexity.totalInitializers}
                      </div>
                      <div className="text-sm text-gray-600">Initializers</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {processedChartData.complexity.inputOutputRatio}
                      </div>
                      <div className="text-sm text-gray-600">I/O Ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* JSON Data Section */}
            <div className="space-y-6">
              <JsonViewer
                data={currentModelData}
                title="Model Metadata (JSON)"
              />
              {/* Layer Attributes Table */}
              <Card className="shadow-lg ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Layer Details
                  </CardTitle>
                  <CardDescription>
                    Detailed layer information and attributes
                  </CardDescription>
                </CardHeader>
                <CardContent >
                  <div className="overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Attributes</th>
                          <th className="text-left p-2">Kernel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedChartData.layers.map((layer) => (
                          <tr
                            key={layer.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">{layer.id}</td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  layer.type === "Conv"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {layer.type}
                              </Badge>
                            </td>
                            <td className="p-2 text-gray-600">
                              {layer.attributes}
                            </td>
                            <td className="p-2">
                              {layer.kernelShape && (
                                <Badge variant="outline">
                                  {layer.kernelShape}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelDashboard;
