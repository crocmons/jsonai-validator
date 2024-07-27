export const EXAMPLE_PROMPT = `DATA: \n"my name is Orni.. I'm 23 years old and self taught developer and she love to learn new tech stack"\n\n-----------\nExpected JSON format:
{"name": {"type": "string"}, "age": {"type": "number"}} 
{
  "name": { "type": "string" },
  "age": { "type": "number" },
  "isStudent": { "type": "boolean" },
  "courses": {
    "type": "array",
    "items": { "type": "string" },
  },
}
\n\n-----------\nValid JSON output in expected format:`

export const EXAMPLE_ANSWER = `{
name: Orni,
age: 23,
isStudent: true,
courses: ["self taught developer"],
}`