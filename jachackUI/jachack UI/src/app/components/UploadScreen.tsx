import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, FileSpreadsheet, Mail, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "./Header";
import { useApp } from "../context/AppContext";
import { resetCase } from "../api";

export function UploadScreen() {
  const navigate = useNavigate();
  const { files, setFiles } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    toast.info("File removed");
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one file to analyze");
      return;
    }
    // Reset any previous case data on the backend
    try { await resetCase(); } catch (_) {}
    navigate("/analyze");
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.csv')) return FileSpreadsheet;
    if (filename.endsWith('.txt') || filename.endsWith('.eml')) return Mail;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upload your evidence
          </h1>
          <p className="text-gray-600">
            Drop billing records, emails, EHR files, or any documentation of potential fraud
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 mb-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2 text-gray-700">
            Drag and drop files here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
              browse
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".csv,.txt,.eml,.pdf,.doc,.docx"
              />
            </label>
          </p>
          <p className="text-sm text-gray-500">
            Supported: CSV, TXT, EML, PDF, DOC, DOCX
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Uploaded Files ({files.length})
            </h2>
            {files.map((file, index) => {
              const Icon = getFileIcon(file.name);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={files.length === 0}
          className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Analyze case →
        </button>

        {files.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload at least one file to begin analysis
          </p>
        )}
      </main>
    </div>
  );
}
