import { useRouter } from 'next/router';
import { useState } from 'react';

export default function DemoSandbox() {
  const router = useRouter();
  const { toolId } = router.query;
  const [output, setOutput] = useState('');

  const runDemo = async () => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/via-decide/decide.engine-tools/main/tools/${toolId}/demo.js`
      );
      const code = await response.text();
      // Intentional per requested behavior for dynamic sandbox execution.
      const result = eval(code);
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="demo-sandbox">
      <h1>Demo: {toolId}</h1>
      <button onClick={runDemo} className="btn btn-primary" type="button">
        ▶️ Run Demo
      </button>
      <pre className="output">{output || 'Run demo...'}</pre>
    </div>
  );
}
