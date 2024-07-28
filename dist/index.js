import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from '@langchain/core/prompts';

const examples = [{
        input: `DATA: \n"my name is xyz.. I'm 23 years old and self taught developer and she love to learn new tech stack"\n\n-----------\nExpected JSON format:
{{"name": {{"type": "string"}}, "age": {{"type": "number"}},"isStudent": {{ "type": "boolean" }},
"courses": {{
  "type": "array",
  "items": {{ "type": "string" }},
}},
}} 
\n\n-----------\nValid JSON output in expected format:`,
        output: `{{
name: xyz,
age: 23,
isStudent: true,
courses: ["self taught developer"],
}}`
    }];

// Create few shot message tmeplate 
const examplePrompt = ChatPromptTemplate.fromTemplate(`Human: {input}
    AI: {output}`);
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
    prefix: "You are an AI agent that converts data into the attached JSON format. You respond with nothing but valid JSON based on the input data. Your output should DIRECTLY be valid JSON, nothing added before and after. You will begin with the opening curly brace and end with the closing curly brace. Only if you absolutely cannot determine a field, use the value null. Below is one example of this.",
    suffix: " Human: {input}, ",
    examplePrompt,
    examples,
    inputVariables: ["input"], // no input variables
});
// Get the API 
// Define the model
const model = new ChatGroq({
    temperature: 0.1,
    apiKey: process.env.GROQ_API_KEY,
    maxTokens: 8192,
    model: 'llama3-70b-8192'
});
const GET = () => {
    return new Response("OK");
};
const determineSchemaType = (schema) => {
    if (!schema.hasOwnProperty("type")) {
        if (Array.isArray(schema)) {
            return "array";
        }
        else {
            return typeof schema;
        }
    }
    return schema.type;
};
const jsonSchemaToZod = (schema) => {
    const type = determineSchemaType(schema);
    switch (type) {
        case "string":
            return z.string().nullable();
        case "number":
            return z.number().nullable();
        case "boolean":
            return z.boolean().nullable();
        case "array":
            return z.array(jsonSchemaToZod(schema.items)).nullable();
        case "object":
            const shape = {};
            for (const key in schema) {
                if (key !== "type") {
                    shape[key] = jsonSchemaToZod(schema[key]);
                }
            }
            return z.object(shape);
        default:
            throw new Error(`Unsupported data type: ${type}`);
    }
};
const POST = async (req) => {
    const body = await req.json();
    // step 1: make sure incoming request is valid
    const genericSchema = z.object({
        data: z.string(),
        format: z.object({}).passthrough(),
    });
    const { data, format } = genericSchema.parse(body);
    // step 2: create a schema from the expected user format
    const dynamicSchema = jsonSchemaToZod(format);
    class RetryablePromise extends Promise {
        static async retry(retries, executor) {
            return new RetryablePromise(executor).catch((error) => {
                console.error(`Retrying due to error: ${error}`);
                return retries > 0 ? RetryablePromise.retry(retries - 1, executor) : RetryablePromise.reject(error);
            });
        }
    }
    const validationResult = await RetryablePromise.retry(0, async (resolve, reject) => {
        try {
            // call  ai
            const text = `DATA: \n"${data}"\n\n-----------\nExpected JSON format: ${JSON.stringify(format, null, 2)}
\n\n-----------\nValid JSON output in expected format:   AI:`;
            const formattedPrompt = await fewShotPrompt.format({ input: text });
            const result = await model.invoke(formattedPrompt);
            console.log(result.content);
            //    validate json
            const validationResult = dynamicSchema.parse(JSON.parse(result.content.toLocaleString() || ""));
            return resolve(validationResult);
        }
        catch (error) {
            reject(error);
        }
    });
    return Response.json(validationResult, { status: 200 });
};

export { GET, POST };