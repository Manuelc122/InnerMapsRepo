export function sanitizeJson(text: string): string {
  // Extract JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }

  let json = jsonMatch[0];

  // Clean up the JSON string
  json = json
    // Remove all newlines and extra whitespace
    .replace(/[\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    // Ensure property names are quoted
    .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
    // Properly escape quotes in values
    .replace(/:\s*"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      return match.replace(/\\(?!["\\/bfnrt])/g, '\\\\');
    });

  // Validate JSON structure
  try {
    JSON.parse(json);
  } catch (e) {
    throw new Error('Invalid JSON structure after sanitization');
  }

  return json;
}