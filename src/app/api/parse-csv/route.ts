import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';

export interface ParsedLesson {
  id: string;
  name: string;  // This is the skill text from CSV
  index: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const result = parseCSV(content, file.name);

    if (result.errors.length > 0 && result.skills.length === 0) {
      return NextResponse.json(
        { error: result.errors.join('; ') },
        { status: 400 }
      );
    }

    // Convert parsed skills to lessons (just names for now)
    const lessons: ParsedLesson[] = result.skills.map((skill, index) => ({
      id: skill.id,
      name: skill.text,
      index,
    }));

    return NextResponse.json({
      lessons,
      totalCount: lessons.length,
      sourceFile: result.sourceFile,
    });
  } catch (error) {
    console.error('Parse CSV error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse CSV' },
      { status: 500 }
    );
  }
}
