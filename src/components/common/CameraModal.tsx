"use client";

import React, { useRef, useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Icon } from "./Icons";
import { useToast } from "@/lib/context/ToastContext";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen) {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setCameraError(
            "Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada browser."
          );
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const stopAndClose = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    onClose();
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      onCapture(dataUrl);
      showToast("Foto berhasil diambil.");
      stopAndClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={stopAndClose} title="Ambil Foto Nota / Struk">
      <div className="mt-2">
        {cameraError ? (
          <div className="bg-red-50 text-brand-red p-4 rounded-smarta-md text-sm border border-red-200">
            {cameraError}
          </div>
        ) : (
          <div className="rounded-smarta-md overflow-hidden bg-black aspect-video flex items-center justify-center border border-brand-line">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2.5 justify-end mt-5 flex-wrap">
        <button
          type="button"
          onClick={stopAndClose}
          className="px-4 py-2 text-sm font-semibold rounded-full border border-brand-line bg-white hover:border-brand-green text-[#111111] transition-all"
        >
          Batal
        </button>
        {!cameraError && (
          <button
            type="button"
            onClick={handleCapture}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-brand-deep hover:bg-brand-green text-white flex items-center gap-2 transition-all"
          >
            <Icon name="camera" size="sm" />
            Jepret
          </button>
        )}
      </div>
    </Modal>
  );
};
