import Papa from 'papaparse';
import type { ParsedSkill, ParseResult } from '@/types/csv';

interface ParseOptions {
  profileColumn?: string;
}

function generateSkillId(text: string, index: number): string {
  // Simple hash-like ID based on text and index
  const hash = text
    .split('')
    .reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);
  return `skill_${Math.abs(hash).toString(16).slice(0, 8)}_${index}`;
}

export function parseCSV(
  content: string,
  fileName: string,
  options: ParseOptions = {}
): ParseResult {
  const errors: string[] = [];
  const skills: ParsedSkill[] = [];

  // Check for empty content
  if (!content.trim()) {
    return {
      skills: [],
      sourceFile: fileName,
      totalRows: 0,
      selectedRows: 0,
      errors: ['Файл пустой или повреждён'],
    };
  }

  // Parse CSV with auto-detected delimiter
  const parseResult = Papa.parse<string[]>(content, {
    delimiter: '', // Auto-detect
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    const parseErrors = parseResult.errors.map(
      (e) => `Строка ${e.row}: ${e.message}`
    );
    return {
      skills: [],
      sourceFile: fileName,
      totalRows: 0,
      selectedRows: 0,
      errors: ['Не удалось прочитать CSV, проверьте формат файла', ...parseErrors],
    };
  }

  const rows = parseResult.data;

  // Check minimum columns
  if (rows.length === 0 || rows[0].length < 2) {
    return {
      skills: [],
      sourceFile: fileName,
      totalRows: rows.length,
      selectedRows: 0,
      errors: ['CSV должен содержать минимум 2 колонки (текст скилла и маркер профиля)'],
    };
  }

  // Skip header row, process data rows
  const dataRows = rows.slice(1);
  const profileColumn = options.profileColumn || 'A';

  let selectedCount = 0;

  dataRows.forEach((row, index) => {
    if (row.length < 2) return;

    const skillText = row[0]?.trim();
    const marker = row[1]?.trim().toUpperCase();

    if (!skillText) return;

    if (marker === 'X') {
      selectedCount++;
      skills.push({
        id: generateSkillId(skillText, index),
        text: skillText,
        profileColumn,
      });
    }
  });

  if (skills.length === 0) {
    errors.push('В выбранной колонке нет ни одной отметки X. Генерировать нечего.');
  }

  return {
    skills,
    sourceFile: fileName,
    totalRows: dataRows.length,
    selectedRows: selectedCount,
    errors,
  };
}
