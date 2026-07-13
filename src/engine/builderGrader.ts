import type {
  BuilderChallenge,
  ComponentKind,
  ConceptResult,
  GradingResult,
  PlacedComponent,
  PlacedConnection,
} from '../types/builder';

/**
 * Pure grading engine for System Builder mode. Given a challenge and a
 * player's design (placed components + connections between them), returns
 * a structured, per-concept verdict the UI can render without any extra
 * interpretation.
 *
 * Rules (per concept):
 * - requiredAll: every listed kind must have >= 1 placed instance.
 * - requiredAnyOf: at least one listed kind must have a placed instance.
 * - preferredConnections: for each {from, to}, some connection must exist
 *   whose source instance is of kind `from` and target instance is of kind
 *   `to`. Direction-sensitive; any matching instance pair satisfies it.
 * - discouragedComponents: presence of any listed kind prevents a "pass"
 *   even when required components/connections are otherwise satisfied.
 *
 * Status:
 * - 'fail'    — required components missing.
 * - 'partial' — required components present, but preferred connections are
 *               missing and/or a discouraged component was used.
 * - 'pass'    — required components present, all preferred connections
 *               satisfied, no discouraged components used.
 *
 * Extra components beyond what a concept asks for are never penalized.
 */
export function gradeDesign(
  challenge: BuilderChallenge,
  components: PlacedComponent[],
  connections: PlacedConnection[],
): GradingResult {
  const placedKinds = new Set<ComponentKind>(components.map((c) => c.kind));
  const componentById = new Map(components.map((c) => [c.instanceId, c]));

  const concepts: ConceptResult[] = challenge.concepts.map((concept) => {
    const missingRequiredAll = (concept.requiredAll ?? []).filter((kind) => !placedKinds.has(kind));

    const anyOfList = concept.requiredAnyOf ?? [];
    const hasRequiredAnyOf = anyOfList.length === 0 || anyOfList.some((kind) => placedKinds.has(kind));
    const missingRequiredAnyOf = hasRequiredAnyOf ? [] : anyOfList;

    const discouragedPresent = (concept.discouragedComponents ?? []).filter((kind) => placedKinds.has(kind));

    const missingConnections = (concept.preferredConnections ?? []).filter((rule) => {
      return !connections.some((connection) => {
        const from = componentById.get(connection.from);
        const to = componentById.get(connection.to);
        return from?.kind === rule.from && to?.kind === rule.to;
      });
    });

    const requiredMet = missingRequiredAll.length === 0 && hasRequiredAnyOf;

    let status: ConceptResult['status'];
    if (!requiredMet) {
      status = 'fail';
    } else if (missingConnections.length > 0 || discouragedPresent.length > 0) {
      status = 'partial';
    } else {
      status = 'pass';
    }

    return {
      conceptId: concept.id,
      title: concept.title,
      description: concept.description,
      status,
      missingRequiredAll,
      missingRequiredAnyOf,
      missingConnections,
      discouragedPresent,
    };
  });

  const connectedInstanceIds = new Set<string>();
  for (const connection of connections) {
    connectedInstanceIds.add(connection.from);
    connectedInstanceIds.add(connection.to);
  }
  const orphanComponentIds = components
    .filter((c) => !connectedInstanceIds.has(c.instanceId))
    .map((c) => c.instanceId);

  const passed = concepts.every((c) => c.status === 'pass');

  return { passed, concepts, orphanComponentIds };
}
