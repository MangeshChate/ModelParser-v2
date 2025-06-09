
import React, { createContext, useState, useContext } from 'react';
import { parseONNXModelComplete } from '../onnxparser'

const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [rawModelData, setRawModelData] = useState(null);
  const [filteredModelData, setFilteredModelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);



  const filterModelData = (raw) => {
    if (!raw || !raw.graph) return null;

    const inputs = raw.graph.inputs?.map(i => i.name) || [];
    const outputs = raw.graph.outputs?.map(o => o.name) || [];
    const layers = raw.graph.nodes?.map((node, index) => ({
      id: index + 1,
      inputs: node.input,
      outputs: node.output,
      attributes: node.attribute?.map(attr => attr.name) || [],
    })) || [];

    return {
      fileName: raw.file?.name,
      fileSize: raw.file?.sizeFormatted,
      producer: raw.model?.producerName,
      version: raw.model?.producerVersion,
      inputs,
      outputs,
      layers,
      analysis: raw.analysis || null,
      parsingMethod: raw.parsingMethod || null,
    };
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = await parseONNXModelComplete(file);
      setRawModelData(parsedData);
      const filtered = filterModelData(parsedData);
      setFilteredModelData(filtered);
    } catch (err) {
      setError("Failed to parse the ONNX model. Please make sure the file is valid.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <ModelContext.Provider
      value={{
        rawModelData,
        filteredModelData,
        handleFileUpload,
        isLoading,
        error,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => useContext(ModelContext);
