import { useEffect, useState } from "react";
import axios from "axios";
import { useModel } from "@/context/ModelContext"; // Make sure this path is correct
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload } from "lucide-react";

export default function Home() {
  const [serverModels, setServerModels] = useState([]);
  const [models, setModels] = useState([]);

  const {
    handleFileUpload,
    filteredModelData,
    isLoading,
    error,
    rawModelData,
  } = useModel();

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".onnx")) {
      alert("Please upload a valid ONNX model (.onnx)");
      return;
    }

    await handleFileUpload(file);

    const newModel = {
      id: Date.now().toString(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      version: "1.0.0",
    };

    setModels((prev) => [...prev, newModel]);

    event.target.value = "";
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authorization token found");

        const response = await fetch("http://localhost:8080/api/metadata", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch metadata");

        const data = await response.json();
        console.log("Fetched server metadata:", data);

        setServerModels(data);
      } catch (err) {
        console.error("Error fetching model metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Upload filteredModelData to backend
  const uploadMetadata = async () => {
    if (!filteredModelData || !models.length) {
      alert("No model or metadata to upload");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      
      const lastModel = models[models.length - 1];

      const payload = {
        file_name: lastModel.name,
        metadata: filteredModelData,
      };

      const response = await axios.post(
        "http://localhost:8080/api/metadata",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Metadata uploaded successfully!");
      
    } catch (error) {
      console.error("Error uploading metadata:", error.response || error.message);
      alert("Failed to upload metadata.");
    }
  };

  const deleteMetadata = async (id) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authorization token found");

    const response = await fetch(`http://localhost:8080/api/metadata/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete metadata");

    // Update UI state
    setServerModels((prev) => prev.filter((model) => model.id !== id));
  } catch (err) {
    console.error("Error deleting model metadata:", err);
    alert("Failed to delete model");
  }
};


  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload ONNX Model</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".onnx" onChange={handleChange} />
          <Button
            className="mt-4"
            onClick={uploadMetadata}
            disabled={!filteredModelData || !models.length}
            leftIcon={<Upload />}
          >
            Upload Metadata
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Models</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your uploaded ONNX models.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Model Name</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serverModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.file_name}</TableCell>
                  <TableCell>
                    {new Date(model.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                       
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMetadata(model.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isLoading && <p>Loading model metadata...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
    </div>
  );
}
