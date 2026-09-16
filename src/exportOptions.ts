export type ExportFormat = "png" | "jpg";
export type ExportResolution = 1024 | 2048 | 3072 | 4096;

export interface ExportEstimate {
  width: number;
  height: number;
  estimate: string;
  scale: number;
}
