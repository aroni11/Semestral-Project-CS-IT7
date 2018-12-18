import Path from '../pathfinders/path';

function getDiversity(shortest: Path, current: Path): number {
  const missingEdges = new Path();
  for (const edge of current.pathData) {
    if (shortest.pathData.indexOf(edge) === -1) {
      missingEdges.pathData.push(edge);
    }
  }
  const shortestLength = shortest.evaluate().getCost('distance');
  const notSharedLength = missingEdges.evaluate().getCost('distance');

  const diversity = notSharedLength / shortestLength;

  return diversity > 1 ? 1 : diversity;
 }

export function printDiversities(paths: Path[]): void {
  let maxDiversity = -1;
  let minDiversity = 2;
  let sumDiversity = 0;
  for (const path of paths.slice(1)) {
    const diversity = getDiversity(paths[0], path);
    if (diversity > maxDiversity) {
      maxDiversity = diversity;
    }
    if (diversity < minDiversity) {
      minDiversity = diversity;
    }
    sumDiversity = sumDiversity + diversity;
  }
  console.log('Diversities: ');
  console.log('Min: ' + minDiversity.toString());
  console.log('Max: ' + maxDiversity.toString());
  console.log('Avg: ' + (sumDiversity / (paths.length - 1)).toString());
}
