"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // 🔹 Start scanning - let getUserMedia handle permissions
  const handleStartScanning = () => {
    setCameraError(null);
    setIsScanning(true);
  };

  // 🔹 Handle QR scan success
  const handleScan = (result) => {
    if (result && result[0]) {
      const qrText = result[0].rawValue;
      setScannedData(qrText);
      setIsScanning(false);
    }
  };

  // 🔹 Handle camera errors
  const handleError = (error) => {
    console.error("Camera error:", error);
    setIsScanning(false);
    
    // Check error types for mobile
    if (error?.name === "NotAllowedError") {
      setCameraError("camera_denied");
    } else if (error?.name === "NotFoundError") {
      setCameraError("no_camera");
    } else if (error?.name === "NotReadableError") {
      setCameraError("camera_in_use");
    } else {
      setCameraError("unknown");
    }
  };

  // 🔹 Mock validation (replace with real API)
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const data = {
        name: "Ketan Gaikwad",
        id: "60004210035",
        email: "ketangaikwad035@gmail.com",
        department: "CSE-DS",
        year: "S.Y. B.Tech",
      };
      setStudentData(data);
    } catch (error) {
      alert("Error validating student data");
    } finally {
      setIsValidating(false);
    }
  };

  // 🔹 Reset
  const handleRescan = () => {
    setScannedData("");
    setStudentData(null);
    setCameraError(null);
    setIsScanning(true);
  };

  // 🔹 Render error messages based on error type
  const renderErrorMessage = () => {
    if (!cameraError) return null;

    const errorMessages = {
      camera_denied: {
        title: "📷 Camera Access Blocked",
        message: "Please allow camera access in your browser settings:",
        instructions: [
          "Tap the lock icon 🔒 or info icon ⓘ in the address bar",
          "Find 'Camera' permissions",
          "Select 'Allow' or 'Ask'",
          "Refresh this page"
        ]
      },
      no_camera: {
        title: "📷 No Camera Found",
        message: "No camera detected on your device.",
        instructions: []
      },
      camera_in_use: {
        title: "📷 Camera Busy",
        message: "Camera is being used by another app. Please close other apps using the camera and try again.",
        instructions: []
      },
      unknown: {
        title: "❌ Camera Error",
        message: "Unable to access camera. Please try again.",
        instructions: []
      }
    };

    const error = errorMessages[cameraError];

    return (
      <div className="w-full max-w-md bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-4">
        <h3 className="text-red-700 font-bold text-lg mb-2">{error.title}</h3>
        <p className="text-red-600 mb-3">{error.message}</p>
        {error.instructions.length > 0 && (
          <ol className="list-decimal list-inside space-y-1 text-red-600 text-sm mb-3">
            {error.instructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        )}
        <button
          onClick={handleStartScanning}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-8 bg-gradient-to-br from-indigo-500 to-purple-600 font-sans">
      <h1 className="text-white text-3xl font-bold mb-6 text-center">
        📱 QR Code Scanner
      </h1>

      {/* Show error messages */}
      {renderErrorMessage()}

      {/* Start Scanning Button */}
      {!isScanning && !scannedData && !cameraError && (
        <button
          onClick={handleStartScanning}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl mb-6 text-lg"
        >
          📷 Start Scanning
        </button>
      )}

      {/* Scanner Component */}
      {isScanning && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 mb-6">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{ 
              facingMode: "environment",
              aspectRatio: 1 
            }}
            formats={["qr_code"]}
            components={{ 
              audio: true, 
              finder: true,
              tracker: true 
            }}
            styles={{
              container: { 
                width: "100%", 
                height: "auto",
                position: "relative"
              },
              video: {
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
              },
            }}
          />
          <p className="text-center text-gray-600 mt-3 text-sm">
            Point your camera at a QR code
          </p>
        </div>
      )}

      {/* Scanned Data */}
      {scannedData && (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 mb-4 animate-fade-in">
          <h2 className="text-indigo-600 font-semibold text-lg mb-2 flex items-center">
            <span className="mr-2">✅</span> Scanned QR Code:
          </h2>
          <p className="break-words bg-gray-50 border-l-4 border-indigo-500 text-gray-800 p-3 rounded-md font-mono text-sm">
            {scannedData}
          </p>
        </div>
      )}

      {/* Validate Button */}
      {scannedData && !studentData && (
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className={`w-full max-w-md py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all duration-300 ${
            isValidating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:-translate-y-1 hover:shadow-xl"
          }`}
        >
          {isValidating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Validating...
            </span>
          ) : (
            "✓ Validate"
          )}
        </button>
      )}

      {/* Student Info */}
      {studentData && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mt-6 animate-fade-in">
          <h2 className="text-indigo-600 font-bold text-xl mb-4 flex items-center">
            <span className="mr-2">🎓</span> Student Information
          </h2>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl space-y-3 text-gray-800 border border-indigo-100">
            <div className="flex flex-col sm:flex-row">
              <strong className="text-indigo-600 w-full sm:w-32 mb-1 sm:mb-0">Name:</strong> 
              <span className="font-medium">{studentData.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <strong className="text-indigo-600 w-full sm:w-32 mb-1 sm:mb-0">ID:</strong> 
              <span className="font-mono text-sm">{studentData.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <strong className="text-indigo-600 w-full sm:w-32 mb-1 sm:mb-0">Email:</strong> 
              <span className="text-sm break-all">{studentData.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <strong className="text-indigo-600 w-full sm:w-32 mb-1 sm:mb-0">Department:</strong> 
              <span>{studentData.department}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <strong className="text-indigo-600 w-full sm:w-32 mb-1 sm:mb-0">Year:</strong> 
              <span>{studentData.year}</span>
            </div>
          </div>

          <button
            onClick={handleRescan}
            className="w-full mt-5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            🔁 Scan Another QR Code
          </button>
        </div>
      )}
    </div>
  );
}

export default QRScanner