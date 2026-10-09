import { evaluateHubScore } from './scoring';
import { HUB_FIXTURES, DEFAULT_WEIGHTS } from '../data/fixtures';

console.log("=== CHARGESYNC INDIA SCORING ENGINE TESTS ===");

HUB_FIXTURES.forEach((fixture) => {
  if (!fixture.signals) {
    console.log(`\nHub: ${fixture.name} (${fixture.id}) - Unassessed (Directory Only)`);
    return;
  }
  const result = evaluateHubScore(fixture.signals, DEFAULT_WEIGHTS);
  console.log(`\nHub: ${fixture.name} (${fixture.id})`);
  console.log(`  Raw CSDS: ${result.csdsRaw}%`);
  console.log(`  ECS Confidence Score: ${result.ecsScore}%`);
  console.log(`  Is Suppressed (ECS < 55): ${result.isSuppressed}`);
  console.log(`  Display CSDS: ${result.displayCSDS}`);
  console.log(`  Friction Level: ${result.frictionLevel}`);
});
