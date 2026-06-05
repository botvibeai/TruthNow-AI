export interface FaceAttributes {
  glassesDetected: boolean;
  facialHairDetected: boolean;
  makeupDetected: boolean;
  lightingQuality: string;
}

export interface RelativeCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceData {
  confidenceScore: number;
  estimatedAge: number;
  ageRange: string;
  ageCategory: string;
  genderPresentation: string;
  genderConfidence: number;
  minorAppearanceSafetyCode: "PASS_ADULT_APPEARANCE" | "ALERT_MINOR_APPEARANCE" | "SURE_MINOR";
  minorSafetyReasoning: string;
  expression: string;
  expressionConfidence: number;
  attributes: FaceAttributes;
  relativeCoordinates: RelativeCoordinates;
}

export interface GeoCompliance {
  country: string;
  jurisdiction: string;
  scannerComplianceCode: string;
  mandatoryRetentionLimitHours: number;
  dataPolicyNote: string;
}

export interface ScanResponse {
  success: boolean;
  usingSimulation: boolean;
  facesDetected: number;
  faces: FaceData[];
  geoCompliance: GeoCompliance;
  processedAt: string;
  isAiGenerated?: boolean;
  aiConfidence?: number;
  aiReason?: string;
  seoMetrics: {
    keywordsActive: string[];
    score: number;
  };
}

export interface ClientReview {
  id: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarSeed: string;
  text: string;
  verifiedQuery: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  keywordRelation?: string;
}

export interface DevApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  status: "active" | "revoked";
  callsCount: number;
}
