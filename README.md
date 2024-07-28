# jsonai-validator

`jsonai-validator` is an NPM package that validates and generates JSON schemas using TypeScript and Zod for type safety, and leverages AI (Groq LLM) for response generation.

## Installation

To install the package, run:

```bash
npm install jsonai-validator
```

## Usage
Here’s a simple example of how to use jsonai-validator in your project.

```bash
import { validateAndGenerateJSON } from 'jsonai-validator';

async function main() {
  const data = { name: 'xyz', age: 50, lovesCoding: true };
  const schema = {
    name: { type: 'string' },
    age: { type: 'number' },
    lovesCoding: { type: 'boolean' }
  };

  try {
    const json = await validateAndGenerateJSON(data, schema);
    console.log('Generated JSON:', json);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```


# API
```bash
validateAndGenerateJSON(data: any, schema: any): Promise<any>
```
Validates the input data against the provided schema and generates a JSON response using AI.

## data: The input data to be validated.
## schema: The schema defining the expected types of the input data.
## returns: A promise that resolves to the generated JSON response.

### Parameters
### data: object - The data to be validated and transformed.
### schema: object - The schema describing the structure and types of the data. Each key should have a type property which can be string, number, boolean, array, or object.

## Example:
```bash
import { validateAndGenerateJSON } from 'jsonai-validator';

const data = {
  name: 'John Doe',
  age: 30,
  isActive: true,
  skills: ['JavaScript', 'TypeScript']
};

const schema = {
  name: { type: 'string' },
  age: { type: 'number' },
  isActive: { type: 'boolean' },
  skills: { type: 'array' }
};

validateAndGenerateJSON(data, schema).then(response => {
  console.log('Generated JSON:', response);
}).catch(error => {
  console.error('Validation or AI Error:', error);
});
```

## Development

## Setup
### Clone the repository:

```bash
git clone https://github.com/your-username/jsonai-validator.git
cd jsonai-validator
```

### Install dependencies:

```bash
npm install
```

## Build the project:

```bash
npm run build
```

## Running Tests
To run tests, use the following command:

```bash
npm test
```

## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
