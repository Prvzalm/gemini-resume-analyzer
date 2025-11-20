declare module "pdf-parse" {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdf(data: Buffer): Promise<PDFParseResult>;
  export = pdf;
}
