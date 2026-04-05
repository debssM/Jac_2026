async function jacPost(walker: string, body: object = {}) {
  const res = await fetch(`/walker/${walker}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`${walker} returned ${res.status}`);
  }

  const data = await res.json();
  return data.reports ?? [];
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string ?? '');
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function inferDocType(filename: string): string {
  if (filename.endsWith('.csv')) return 'billing';
  if (filename.endsWith('.eml') || filename.toLowerCase().includes('email')) return 'email';
  return 'document';
}

export async function analyzeCase(files: File[]) {
  const fileData = await Promise.all(
    files.map(async (f) => ({
      filename: f.name,
      doc_type: inferDocType(f.name),
      content: await readFileAsText(f),
    }))
  );

  const [result] = await jacPost('analyze_case', { files: fileData });
  return result ?? null;
}

export async function getScores() {
  const [result] = await jacPost('get_scores', {});
  return result ?? null;
}

export async function getEvidence() {
  return jacPost('get_evidence', {});
}

export async function getTimeline() {
  const [result] = await jacPost('get_timeline', {});
  return result ?? null;
}

export async function resetCase() {
  await jacPost('reset_case', {});
}
