import process from 'process';

const baseUrl = process.env.PERF_BASE_URL || 'http://localhost:5000';
const runs = Number(process.env.PERF_RUNS || 30);

const endpoints = ['/', '/api/health'];

const timeRequest = async (url) => {
  const started = performance.now();
  const response = await fetch(url);
  const ended = performance.now();
  return {
    ok: response.ok,
    status: response.status,
    durationMs: ended - started
  };
};

const stats = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return {
    min: sorted[0],
    avg,
    p95: sorted[p95Index],
    max: sorted[sorted.length - 1]
  };
};

const run = async () => {
  console.log(`Running performance smoke test against ${baseUrl}`);
  console.log(`Requests per endpoint: ${runs}`);

  for (const endpoint of endpoints) {
    const durations = [];
    const url = `${baseUrl}${endpoint}`;

    for (let i = 0; i < runs; i += 1) {
      const result = await timeRequest(url);
      if (!result.ok) {
        throw new Error(`${endpoint} failed with status ${result.status}`);
      }
      durations.push(result.durationMs);
    }

    const metric = stats(durations);
    console.log(`\n${endpoint}`);
    console.log(`  min: ${metric.min.toFixed(2)} ms`);
    console.log(`  avg: ${metric.avg.toFixed(2)} ms`);
    console.log(`  p95: ${metric.p95.toFixed(2)} ms`);
    console.log(`  max: ${metric.max.toFixed(2)} ms`);
  }
};

run().catch((error) => {
  console.error('Performance smoke test failed:', error.message);
  process.exit(1);
});
