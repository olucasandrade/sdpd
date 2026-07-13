import { describe, expect, it } from 'vitest';
import { gradeDesign } from './builderGrader';
import type { BuilderChallenge, PlacedComponent, PlacedConnection } from '../types/builder';
import challenge01 from '../data/builder/challenges-01.json';
import challenge02 from '../data/builder/challenges-02.json';

const rushHour = challenge01 as unknown as BuilderChallenge;
const evidenceMedia = challenge02 as unknown as BuilderChallenge;

function component(instanceId: string, kind: PlacedComponent['kind']): PlacedComponent {
  return { instanceId, kind, position: { x: 0, y: 0 } };
}

function connection(id: string, from: string, to: string): PlacedConnection {
  return { id, from, to };
}

describe('gradeDesign', () => {
  it('fails a concept when a requiredAll component is missing', () => {
    // c1 needs client + loadBalancer + api; leave out loadBalancer.
    const components = [component('1', 'client'), component('2', 'api')];
    const result = gradeDesign(rushHour, components, []);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    expect(c1.status).toBe('fail');
    expect(c1.missingRequiredAll).toEqual(['loadBalancer']);
    expect(result.passed).toBe(false);
  });

  it('fails a concept when no requiredAnyOf component is present', () => {
    // c2 needs cache OR cdn; supply neither.
    const components = [component('1', 'client'), component('2', 'loadBalancer'), component('3', 'api')];
    const result = gradeDesign(rushHour, components, []);

    const c2 = result.concepts.find((c) => c.conceptId === 'c2')!;
    expect(c2.status).toBe('fail');
    expect(c2.missingRequiredAnyOf).toEqual(['cache', 'cdn']);
  });

  it('marks a concept partial when required components are present but a preferred connection is missing', () => {
    const components = [component('1', 'client'), component('2', 'loadBalancer'), component('3', 'api')];
    // Only wire client -> loadBalancer, not loadBalancer -> api.
    const connections = [connection('e1', '1', '2')];
    const result = gradeDesign(rushHour, components, connections);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    expect(c1.status).toBe('partial');
    expect(c1.missingRequiredAll).toEqual([]);
    expect(c1.missingConnections).toEqual([{ from: 'loadBalancer', to: 'api' }]);
  });

  it('passes a concept when required components and connections are all satisfied', () => {
    const components = [component('1', 'client'), component('2', 'loadBalancer'), component('3', 'api')];
    const connections = [connection('e1', '1', '2'), connection('e2', '2', '3')];
    const result = gradeDesign(rushHour, components, connections);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    expect(c1.status).toBe('pass');
  });

  it('is direction-sensitive for preferred connections', () => {
    const components = [component('1', 'client'), component('2', 'loadBalancer'), component('3', 'api')];
    // Reversed direction: loadBalancer -> client instead of client -> loadBalancer.
    const connections = [connection('e1', '2', '1'), connection('e2', '2', '3')];
    const result = gradeDesign(rushHour, components, connections);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    expect(c1.status).toBe('partial');
    expect(c1.missingConnections).toEqual([{ from: 'client', to: 'loadBalancer' }]);
  });

  it('does not penalize extra, unrelated components', () => {
    const components = [
      component('1', 'client'),
      component('2', 'loadBalancer'),
      component('3', 'api'),
      component('4', 'database'),
      component('5', 'cache'),
      component('6', 'blobStorage'),
      component('7', 'worker'), // unrelated extra, not required by any concept
    ];
    const connections = [
      connection('e1', '1', '2'),
      connection('e2', '2', '3'),
      connection('e3', '3', '5'),
      connection('e4', '3', '4'),
      connection('e5', '3', '6'),
    ];
    const result = gradeDesign(rushHour, components, connections);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    const c2 = result.concepts.find((c) => c.conceptId === 'c2')!;
    const c3 = result.concepts.find((c) => c.conceptId === 'c3')!;
    expect(c1.status).toBe('pass');
    expect(c2.status).toBe('pass');
    expect(c3.status).toBe('pass');
    expect(result.passed).toBe(true);
  });

  it('reports orphan components that are placed but never connected', () => {
    const components = [
      component('1', 'client'),
      component('2', 'loadBalancer'),
      component('3', 'api'),
      component('4', 'database'),
    ];
    const connections = [connection('e1', '1', '2'), connection('e2', '2', '3')];
    const result = gradeDesign(rushHour, components, connections);

    expect(result.orphanComponentIds).toEqual(['4']);
  });

  it('demotes a concept to partial when a discouraged component is used, even if required components are present', () => {
    // Evidence Media Service c1: requires api + blobStorage, discourages database.
    const components = [component('1', 'api'), component('2', 'blobStorage'), component('3', 'database')];
    const connections = [connection('e1', '1', '2')];
    const result = gradeDesign(evidenceMedia, components, connections);

    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    expect(c1.status).toBe('partial');
    expect(c1.discouragedPresent).toEqual(['database']);
  });

  it('full pass/partial/fail scenario against the real Rush Hour API challenge', () => {
    const components = [
      component('1', 'client'),
      component('2', 'loadBalancer'),
      component('3', 'api'),
      component('4', 'cache'),
    ];
    const connections = [
      connection('e1', '1', '2'),
      connection('e2', '2', '3'),
      // c2's preferred connection (api -> cache) intentionally omitted.
    ];
    const result = gradeDesign(rushHour, components, connections);

    expect(result.passed).toBe(false);
    const c1 = result.concepts.find((c) => c.conceptId === 'c1')!;
    const c2 = result.concepts.find((c) => c.conceptId === 'c2')!;
    expect(c1.status).toBe('pass');
    expect(c2.status).toBe('partial');
    expect(c2.missingConnections).toEqual([{ from: 'api', to: 'cache' }]);
  });

  it('fails everything on an empty design', () => {
    const result = gradeDesign(rushHour, [], []);
    expect(result.passed).toBe(false);
    expect(result.concepts.every((c) => c.status === 'fail')).toBe(true);
  });
});
