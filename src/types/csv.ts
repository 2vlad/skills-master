export interface RawSkillRow {
  text: string;
  marker: string;
}

export interface ParsedSkill {
  id: string;
  text: string;
  profileColumn: string;
}

export interface ParseResult {
  skills: ParsedSkill[];
  sourceFile: string;
  totalRows: number;
  selectedRows: number;
  errors: string[];
}

export interface GenerationRequest {
  csvContent: string;
  fileName: string;
  modelId: string;
  profileName: string;
}
