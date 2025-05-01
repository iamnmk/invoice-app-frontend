'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SignaturePad from 'react-signature-canvas';
import { Save, Trash2, RefreshCw } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  initialData?: string;
}

const SignatureCanvas = ({ onSave, initialData }: SignatureCanvasProps) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sigCanvas = useRef<SignaturePad>(null);

  // Load initial signature data if provided
  useEffect(() => {
    if (initialData && sigCanvas.current) {
      // Need to wait a bit for the canvas to be fully initialized
      const timer = setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.fromDataURL(initialData);
          setIsEmpty(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsLoading(true);
      const signatureData = sigCanvas.current.toDataURL('image/png');
      onSave(signatureData);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full border border-zinc-700 rounded-md bg-white mb-4">
        <SignaturePad
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-40",
            style: { 
              width: '100%', 
              height: '160px',
              backgroundColor: 'white',
              borderRadius: '0.375rem'
            }
          }}
          onEnd={() => setIsEmpty(false)}
        />
      </div>
      
      <div className="flex items-center space-x-3 w-full">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center px-3 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-md text-sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </button>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty || isLoading}
          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
            isEmpty || isLoading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
          }`}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Saving...' : 'Save Signature'}
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas; 