import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  UploadCloud,
  FileText,
  Image,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react-native";
import { useUploadDocument } from "../../hooks/useQueries";
import { notificationSuccess, notificationError, impactMedium } from "../../lib/haptics";
import { showSuccess, showError } from "../../lib/toast";
import { api } from "../../services/api";

const MAX_BYTES = 10 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/bmp",
  "image/tiff",
];

type UploadPhase =
  | "idle"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "done"
  | "error";

interface AnalysisResult {
  document_id: string;
  title: string;
  summary: string;
  document_type: string;
  risk_flags: string[];
  key_clauses: Array<{
    heading: string;
    summary: string;
    risk_level: "high" | "medium" | "low";
  }>;
}

const RISK_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  high: { bg: "bg-red-900/25", text: "text-red-400", dot: "bg-red-500" },
  medium: {
    bg: "bg-yellow-900/25",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  low: { bg: "bg-gray-900/25", text: "text-gray-400", dot: "bg-gray-500" },
};

function ProgressDots() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View className="flex-row gap-1.5 mt-3">
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={{ opacity }}
          className="w-2.5 h-2.5 rounded-full bg-accent"
        />
      ))}
    </View>
  );
}

export default function DocumentUploadScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    size: number;
    mimeType: string;
    isImage: boolean;
  } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedClauses, setExpandedClauses] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadMutation = useUploadDocument();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase === "analyzing") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [phase]);

  const pickPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      if (asset.size && asset.size > MAX_BYTES) {
        Alert.alert("File Too Large", "Maximum file size is 10 MB.");
        return;
      }
      setFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size || 0,
        mimeType: asset.mimeType || "application/pdf",
        isImage: false,
      });
      setErrorMsg("");
    } catch {
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Denied", "Camera roll access is required.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        Alert.alert("File Too Large", "Maximum file size is 10 MB.");
        return;
      }
      if (!SUPPORTED_IMAGE_TYPES.includes(asset.mimeType || "")) {
        Alert.alert(
          "Unsupported Format",
          "Supported formats: PNG, JPEG, WebP, BMP, TIFF."
        );
        return;
      }
      setFile({
        uri: asset.uri,
        name: asset.fileName || "image.jpg",
        size: asset.fileSize || 0,
        mimeType: asset.mimeType || "image/jpeg",
        isImage: true,
      });
      setErrorMsg("");
    } catch {
      Alert.alert("Error", "Could not open image picker.");
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Denied", "Camera access is required.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync();
      if (res.canceled) return;
      const asset = res.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        Alert.alert("File Too Large", "Maximum file size is 10 MB.");
        return;
      }
      setFile({
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        size: asset.fileSize || 0,
        mimeType: asset.mimeType || "image/jpeg",
        isImage: true,
      });
      setErrorMsg("");
    } catch {
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!file) return;

    setPhase("uploading");
    setStatusText("Uploading...");
    setErrorMsg("");

    try {
      setStatusText("Extracting text...");
      setPhase("extracting");
      await new Promise((r) => setTimeout(r, 600));

      setStatusText("Analyzing with AI...");
      setPhase("analyzing");

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);

      const response = await uploadMutation.mutateAsync(formData);

      setPhase("done");
      setResult(response);
      notificationSuccess();
      showSuccess("Analysis Complete", `${response.title} analyzed successfully.`);
      impactMedium();
    } catch (err: any) {
      if (err.response?.status === 413 || err.message?.includes("413")) {
        setErrorMsg("File too large for server. Maximum 10 MB.");
      } else if (err.response?.status === 415) {
        setErrorMsg("Unsupported file format. Use PDF or common image types.");
      } else if (err.code === "ECONNABORTED") {
        setErrorMsg("Request timed out. Try a smaller file.");
      } else {
        setErrorMsg(err.message || "Upload failed. Check your connection.");
      }
      showError("Upload Failed", err.response?.data?.detail || err.message);
      notificationError();
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setFile(null);
    setResult(null);
    setExpandedClauses(false);
    setErrorMsg("");
  };

  if (phase === "done" && result) {
    const riskCount = result.risk_flags?.length || 0;
    const clauses = result.key_clauses || [];

    return (
      <ScrollView className="flex-1 bg-background px-4">
        <View className="mt-6 mb-8">
          <View className="flex-row items-center gap-3 mb-1">
            <CheckCircle2 size={22} color="#22c55e" />
            <Text className="text-white text-lg font-bold tracking-wide">
              Analysis Complete
            </Text>
          </View>
          <Text className="text-muted text-xs mt-1">Your document has been analyzed by AI.</Text>
        </View>

        <View className="bg-surface/85 border border-border/40 rounded-2xl p-5 mb-4 shadow-2xl">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-white text-base font-bold flex-1 pr-2" numberOfLines={2}>
              {result.title}
            </Text>
            {result.document_type && (
              <View className="bg-primary/30 border border-accent/30 px-3 py-1 rounded">
                <Text className="text-accent text-[10px] font-bold tracking-wider uppercase">
                  {result.document_type}
                </Text>
              </View>
            )}
          </View>

          {riskCount > 0 && (
            <View className="bg-red-900/15 border border-red-500/30 rounded-xl p-3 mb-3 flex-row items-start gap-2">
              <AlertTriangle size={16} color="#f87171" className="mt-0.5" />
              <Text className="text-red-400 text-xs font-semibold flex-1">
                {riskCount} risk flag{riskCount > 1 ? "s" : ""} identified. Review the flags below.
              </Text>
            </View>
          )}

          <Text className="text-muted text-sm leading-5">{result.summary}</Text>
        </View>

        {clauses.length > 0 && (
          <View className="bg-surface/85 border border-border/40 rounded-2xl p-5 mb-4 shadow-2xl">
            <TouchableOpacity
              onPress={() => setExpandedClauses(!expandedClauses)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-white font-bold text-sm tracking-wide uppercase">
                Key Clauses ({clauses.length})
              </Text>
              {expandedClauses ? (
                <ChevronUp size={18} color="#c9a84c" />
              ) : (
                <ChevronDown size={18} color="#c9a84c" />
              )}
            </TouchableOpacity>
            {expandedClauses && (
              <View className="mt-3 border-t border-border/30 pt-3">
                {clauses.map((clause, i) => {
                  const style =
                    RISK_STYLES[clause.risk_level] || RISK_STYLES.low;
                  return (
                    <View
                      key={i}
                      className="mb-3 pb-3 border-b border-border/20 last:border-0 last:mb-0 last:pb-0"
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <Text className="text-white font-semibold text-sm flex-1">
                          {clause.heading}
                        </Text>
                      </View>
                      <Text className="text-muted text-xs leading-4 ml-4">
                        {clause.summary}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {result.risk_flags && result.risk_flags.length > 0 && (
          <View className="bg-surface/85 border border-border/40 rounded-2xl p-5 mb-4 shadow-2xl">
            <Text className="text-white font-bold text-sm tracking-wide uppercase mb-3">
              Risk Flags
            </Text>
            {result.risk_flags.map((flag, i) => (
              <View
                key={i}
                className="flex-row items-start gap-2 mb-2 pb-2 border-b border-border/20 last:border-0 last:mb-0 last:pb-0"
              >
                <AlertTriangle size={14} color="#f87171" className="mt-0.5" />
                <Text className="text-red-300 text-xs flex-1 leading-4">{flag}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/document/${result.document_id}`)}
          className="bg-accent rounded-xl py-3.5 items-center flex-row justify-center mb-3 shadow-lg shadow-accent/20"
        >
          <ExternalLink size={16} color="#0f1923" className="mr-2" />
          <Text className="text-background font-bold text-base tracking-widest uppercase">
            Start Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={reset}
          className="border border-border rounded-xl py-3.5 items-center mb-8"
        >
          <Text className="text-muted font-bold tracking-wider uppercase">
            Analyze Another
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4">
      <View className="mt-6 mb-6">
        <Text className="text-white text-lg font-bold tracking-wide">
          Upload & Analyze
        </Text>
        <Text className="text-muted text-sm mt-1 leading-5">
          Upload a PDF or image of a legal document. AI will extract clauses, flag risks, and
          prepare for chat.
        </Text>
      </View>

      {phase === "idle" || phase === "error" ? (
        <>
          {!file && (
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={pickPdf}
                className="flex-1 bg-surface/50 border border-dashed border-border/80 rounded-2xl py-8 items-center"
              >
                <View className="bg-primary/40 border border-accent/20 p-3 rounded-full mb-2">
                  <FileText size={26} color="#c9a84c" />
                </View>
                <Text className="text-white font-semibold text-sm">Pick PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={pickImage}
                className="flex-1 bg-surface/50 border border-dashed border-border/80 rounded-2xl py-8 items-center"
              >
                <View className="bg-primary/40 border border-accent/20 p-3 rounded-full mb-2">
                  <Image size={26} color="#c9a84c" />
                </View>
                <Text className="text-white font-semibold text-sm">Pick Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {!file && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={takePhoto}
              className="bg-surface/50 border border-dashed border-border/80 rounded-2xl py-6 items-center mb-5"
            >
              <UploadCloud size={28} color="#c9a84c" />
              <Text className="text-white font-semibold text-sm mt-1">Take Photo</Text>
            </TouchableOpacity>
          )}

          {file && (
            <View className="bg-surface/85 border border-border/40 rounded-2xl p-5 mb-5 shadow-2xl">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1 pr-3">
                  <Text className="text-white font-semibold text-sm" numberOfLines={2}>
                    {file.name}
                  </Text>
                  <Text className="text-muted text-xs mt-1">{formatSize(file.size)}</Text>
                </View>
                <TouchableOpacity onPress={reset} className="p-1">
                  <X size={18} color="#8fa3b5" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUpload}
                className="bg-accent rounded-xl py-3.5 items-center shadow-lg shadow-accent/20"
              >
                <Text className="text-background font-bold text-base tracking-widest uppercase">
                  Upload & Analyze
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === "error" && errorMsg && (
            <View className="bg-red-900/15 border border-red-500/30 rounded-xl p-4 mb-4 flex-row items-start gap-2">
              <AlertTriangle size={16} color="#f87171" className="mt-0.5" />
              <Text className="text-red-300 text-xs flex-1 leading-4">{errorMsg}</Text>
            </View>
          )}

          {!file && (
            <View className="bg-primary/20 border border-accent/20 rounded-xl p-4 flex-row items-start">
              <ShieldCheck size={16} color="#c9a84c" className="mr-2 mt-0.5" />
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">Secure Processing</Text>
                <Text className="text-muted text-xs leading-5 mt-1">
                  Files are encrypted, analyzed by GPT-4o, and stored in a private vector database.
                  Max file size: 10 MB.
                </Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View className="flex-1 items-center justify-center py-20">
          <Animated.View
            style={
              phase === "analyzing" ? { opacity: pulseAnim } : undefined
            }
            className="bg-primary/40 border border-accent/40 p-5 rounded-full mb-6"
          >
            {phase === "done" ? (
              <CheckCircle2 size={48} color="#22c55e" />
            ) : (
              <UploadCloud size={48} color="#c9a84c" />
            )}
          </Animated.View>
          <Text className="text-white text-base font-bold tracking-wide">{statusText}</Text>
          {phase !== "done" && <ProgressDots />}
        </View>
      )}
    </ScrollView>
  );
}
