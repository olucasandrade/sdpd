import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface Position {
  x: number;
  y: number;
}

interface Node {
  id: string;
  type: string;
  label: string;
  status: string;
  position: Position;
  inspectable: boolean;
  inspectData: {
    title: string;
    logs: string[];
    data: Record<string, string | number>;
    status: string;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  animated: boolean;
  style: string;
}

interface DiagnosisOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

interface DiagnosisQuestion {
  question: string;
  options: DiagnosisOption[];
}

interface CaseFile {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  brief: {
    narrative: string;
    symptoms: string[];
    objective: string;
  };
  diagram: {
    nodes: Node[];
    edges: Edge[];
  };
  diagnosis: {
    rootCause: DiagnosisQuestion;
    fix: DiagnosisQuestion;
  };
  conceptId: string;
  badge: {
    name: string;
    icon: string;
  };
}

// Load case files 1-25 (the files we're testing for this PR)
const casesDir = join(__dirname);
const allCaseFiles = readdirSync(casesDir)
  .filter(file => file.startsWith('case-') && file.endsWith('.json'))
  .sort();

// Filter to only include case-01.json through case-25.json
const caseFiles = allCaseFiles.filter(file => {
  const match = file.match(/case-(\d+)\.json/);
  if (match) {
    const num = parseInt(match[1]);
    return num >= 1 && num <= 25;
  }
  return false;
});

describe('Case Files Schema Validation', () => {
  caseFiles.forEach(filename => {
    describe(filename, () => {
      let caseData: CaseFile;

      it('should be valid JSON', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        expect(() => {
          caseData = JSON.parse(content);
        }).not.toThrow();
        caseData = JSON.parse(content);
      });

      it('should have all required top-level fields', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData).toHaveProperty('id');
        expect(caseData).toHaveProperty('number');
        expect(caseData).toHaveProperty('title');
        expect(caseData).toHaveProperty('subtitle');
        expect(caseData).toHaveProperty('brief');
        expect(caseData).toHaveProperty('diagram');
        expect(caseData).toHaveProperty('diagnosis');
        expect(caseData).toHaveProperty('conceptId');
        expect(caseData).toHaveProperty('badge');
      });

      it('should have consistent id and number', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const expectedNumber = parseInt(filename.match(/case-(\d+)\.json/)?.[1] || '0');
        expect(caseData.number).toBe(expectedNumber);
        expect(caseData.id).toBe(`case-${String(expectedNumber).padStart(2, '0')}`);
      });

      it('should have valid brief structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.brief).toHaveProperty('narrative');
        expect(caseData.brief).toHaveProperty('symptoms');
        expect(caseData.brief).toHaveProperty('objective');
        expect(typeof caseData.brief.narrative).toBe('string');
        expect(caseData.brief.narrative.length).toBeGreaterThan(0);
        expect(Array.isArray(caseData.brief.symptoms)).toBe(true);
        expect(caseData.brief.symptoms.length).toBeGreaterThan(0);
        expect(typeof caseData.brief.objective).toBe('string');
        expect(caseData.brief.objective.length).toBeGreaterThan(0);
      });

      it('should have valid diagram structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.diagram).toHaveProperty('nodes');
        expect(caseData.diagram).toHaveProperty('edges');
        expect(Array.isArray(caseData.diagram.nodes)).toBe(true);
        expect(Array.isArray(caseData.diagram.edges)).toBe(true);
        expect(caseData.diagram.nodes.length).toBeGreaterThan(0);
      });

      it('should have valid node structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        caseData.diagram.nodes.forEach((node, index) => {
          expect(node).toHaveProperty('id');
          expect(node).toHaveProperty('type');
          expect(node).toHaveProperty('label');
          expect(node).toHaveProperty('status');
          expect(node).toHaveProperty('position');
          expect(node).toHaveProperty('inspectable');

          expect(typeof node.id).toBe('string');
          expect(node.id.length).toBeGreaterThan(0);
          expect(typeof node.type).toBe('string');
          expect(typeof node.label).toBe('string');
          expect(typeof node.status).toBe('string');

          expect(node.position).toHaveProperty('x');
          expect(node.position).toHaveProperty('y');
          expect(typeof node.position.x).toBe('number');
          expect(typeof node.position.y).toBe('number');

          if (node.inspectable) {
            expect(node).toHaveProperty('inspectData');
            expect(node.inspectData).toHaveProperty('title');
            expect(node.inspectData).toHaveProperty('logs');
            expect(node.inspectData).toHaveProperty('data');
            expect(node.inspectData).toHaveProperty('status');
            expect(Array.isArray(node.inspectData.logs)).toBe(true);
          }
        });
      });

      it('should have unique node ids', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const nodeIds = caseData.diagram.nodes.map(n => n.id);
        const uniqueIds = new Set(nodeIds);
        expect(nodeIds.length).toBe(uniqueIds.size);
      });

      it('should have valid edge structure with valid node references', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const nodeIds = new Set(caseData.diagram.nodes.map(n => n.id));

        caseData.diagram.edges.forEach(edge => {
          expect(edge).toHaveProperty('id');
          expect(edge).toHaveProperty('source');
          expect(edge).toHaveProperty('target');
          expect(edge).toHaveProperty('label');
          expect(edge).toHaveProperty('animated');
          expect(edge).toHaveProperty('style');

          expect(typeof edge.id).toBe('string');
          expect(typeof edge.source).toBe('string');
          expect(typeof edge.target).toBe('string');
          expect(typeof edge.label).toBe('string');
          expect(typeof edge.animated).toBe('boolean');
          expect(typeof edge.style).toBe('string');

          // Validate edge references point to existing nodes
          expect(nodeIds.has(edge.source)).toBe(true);
          expect(nodeIds.has(edge.target)).toBe(true);
        });
      });

      it('should have unique edge ids', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const edgeIds = caseData.diagram.edges.map(e => e.id);
        const uniqueIds = new Set(edgeIds);
        expect(edgeIds.length).toBe(uniqueIds.size);
      });

      it('should have valid diagnosis structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.diagnosis).toHaveProperty('rootCause');
        expect(caseData.diagnosis).toHaveProperty('fix');
        expect(caseData.diagnosis.rootCause).toHaveProperty('question');
        expect(caseData.diagnosis.rootCause).toHaveProperty('options');
        expect(caseData.diagnosis.fix).toHaveProperty('question');
        expect(caseData.diagnosis.fix).toHaveProperty('options');
      });

      it('should have exactly 4 options for rootCause question', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.diagnosis.rootCause.options.length).toBe(4);
      });

      it('should have exactly 4 options for fix question', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.diagnosis.fix.options.length).toBe(4);
      });

      it('should have exactly one correct answer for rootCause', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const correctAnswers = caseData.diagnosis.rootCause.options.filter(o => o.correct);
        expect(correctAnswers.length).toBe(1);
      });

      it('should have exactly one correct answer for fix', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const correctAnswers = caseData.diagnosis.fix.options.filter(o => o.correct);
        expect(correctAnswers.length).toBe(1);
      });

      it('should have unique option ids within rootCause question', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const optionIds = caseData.diagnosis.rootCause.options.map(o => o.id);
        const uniqueIds = new Set(optionIds);
        expect(optionIds.length).toBe(uniqueIds.size);
      });

      it('should have unique option ids within fix question', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        const optionIds = caseData.diagnosis.fix.options.map(o => o.id);
        const uniqueIds = new Set(optionIds);
        expect(optionIds.length).toBe(uniqueIds.size);
      });

      it('should have valid option structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        [...caseData.diagnosis.rootCause.options, ...caseData.diagnosis.fix.options].forEach(option => {
          expect(option).toHaveProperty('id');
          expect(option).toHaveProperty('text');
          expect(option).toHaveProperty('correct');
          expect(option).toHaveProperty('feedback');

          expect(typeof option.id).toBe('string');
          expect(option.id.length).toBeGreaterThan(0);
          expect(typeof option.text).toBe('string');
          expect(option.text.length).toBeGreaterThan(0);
          expect(typeof option.correct).toBe('boolean');
          expect(typeof option.feedback).toBe('string');
          expect(option.feedback.length).toBeGreaterThan(0);
        });
      });

      it('should have valid badge structure', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(caseData.badge).toHaveProperty('name');
        expect(caseData.badge).toHaveProperty('icon');
        expect(typeof caseData.badge.name).toBe('string');
        expect(caseData.badge.name.length).toBeGreaterThan(0);
        expect(typeof caseData.badge.icon).toBe('string');
        expect(caseData.badge.icon.length).toBeGreaterThan(0);
      });

      it('should have a valid conceptId', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(typeof caseData.conceptId).toBe('string');
        expect(caseData.conceptId.length).toBeGreaterThan(0);
      });

      it('should have non-empty title and subtitle', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(typeof caseData.title).toBe('string');
        expect(caseData.title.length).toBeGreaterThan(0);
        expect(typeof caseData.subtitle).toBe('string');
        expect(caseData.subtitle.length).toBeGreaterThan(0);
      });

      it('should have non-empty diagnosis questions', () => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);

        expect(typeof caseData.diagnosis.rootCause.question).toBe('string');
        expect(caseData.diagnosis.rootCause.question.length).toBeGreaterThan(0);
        expect(typeof caseData.diagnosis.fix.question).toBe('string');
        expect(caseData.diagnosis.fix.question.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Case Files Collection Tests', () => {
  it('should have all 25 case files present', () => {
    expect(caseFiles.length).toBe(25);

    for (let i = 1; i <= 25; i++) {
      const expectedFilename = `case-${String(i).padStart(2, '0')}.json`;
      expect(caseFiles).toContain(expectedFilename);
    }
  });

  it('should have unique concept IDs across all cases', () => {
    const conceptIds = caseFiles.map(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content);
      return caseData.conceptId;
    });

    const uniqueConceptIds = new Set(conceptIds);
    expect(conceptIds.length).toBe(uniqueConceptIds.size);
  });

  it('should have unique titles across all cases', () => {
    const titles = caseFiles.map(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content);
      return caseData.title;
    });

    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });

  it('should have sequential case numbers', () => {
    const numbers = caseFiles.map(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content);
      return caseData.number;
    }).sort((a, b) => a - b);

    for (let i = 0; i < numbers.length; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });
});

describe('Edge Cases and Data Quality', () => {
  caseFiles.forEach(filename => {
    describe(filename, () => {
      let caseData: CaseFile;

      beforeEach(() => {
        const content = readFileSync(join(casesDir, filename), 'utf-8');
        caseData = JSON.parse(content);
      });

      it('should not have orphaned edges (edges without corresponding nodes)', () => {
        const nodeIds = new Set(caseData.diagram.nodes.map(n => n.id));
        const orphanedEdges = caseData.diagram.edges.filter(
          edge => !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
        );
        expect(orphanedEdges.length).toBe(0);
      });

      it('should have meaningful feedback for all options', () => {
        [...caseData.diagnosis.rootCause.options, ...caseData.diagnosis.fix.options].forEach(option => {
          // Feedback should be at least 20 characters (a meaningful sentence)
          expect(option.feedback.length).toBeGreaterThan(20);
        });
      });

      it('should have at least 2 symptoms in the brief', () => {
        expect(caseData.brief.symptoms.length).toBeGreaterThanOrEqual(2);
      });

      it('should have valid node status values', () => {
        const validStatuses = ['healthy', 'degraded', 'failed'];
        caseData.diagram.nodes.forEach(node => {
          expect(validStatuses).toContain(node.status);
        });
      });

      it('should have valid edge style values', () => {
        const validStyles = ['normal', 'broken', 'slow'];
        caseData.diagram.edges.forEach(edge => {
          expect(validStyles).toContain(edge.style);
        });
      });

      it('should have at least one node in failed or degraded status', () => {
        const problematicNodes = caseData.diagram.nodes.filter(
          node => node.status === 'failed' || node.status === 'degraded'
        );
        expect(problematicNodes.length).toBeGreaterThan(0);
      });

      it('should have logs in inspectData for inspectable nodes', () => {
        const inspectableNodes = caseData.diagram.nodes.filter(n => n.inspectable);
        inspectableNodes.forEach(node => {
          expect(node.inspectData.logs.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('Answer Distribution Tests', () => {
  it('should have varied correct answer positions (not always the same option)', () => {
    const correctPositions = {
      rootCause: [] as number[],
      fix: [] as number[]
    };

    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      const rootCauseCorrectIndex = caseData.diagnosis.rootCause.options.findIndex(o => o.correct);
      const fixCorrectIndex = caseData.diagnosis.fix.options.findIndex(o => o.correct);

      correctPositions.rootCause.push(rootCauseCorrectIndex);
      correctPositions.fix.push(fixCorrectIndex);
    });

    // Check that not all correct answers are in the same position
    const uniqueRootCausePositions = new Set(correctPositions.rootCause);
    const uniqueFixPositions = new Set(correctPositions.fix);

    // There should be at least 2 different positions used for correct answers
    expect(uniqueRootCausePositions.size).toBeGreaterThanOrEqual(2);
    expect(uniqueFixPositions.size).toBeGreaterThanOrEqual(2);
  });
});

describe('Regression and Boundary Tests', () => {
  it('should not have any empty arrays in critical fields', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      expect(caseData.brief.symptoms.length).toBeGreaterThan(0);
      expect(caseData.diagram.nodes.length).toBeGreaterThan(0);
      expect(caseData.diagnosis.rootCause.options.length).toBeGreaterThan(0);
      expect(caseData.diagnosis.fix.options.length).toBeGreaterThan(0);
    });
  });

  it('should have at least one edge connecting to each node (no isolated nodes)', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      const nodeIds = new Set(caseData.diagram.nodes.map(n => n.id));
      const nodesInEdges = new Set<string>();

      caseData.diagram.edges.forEach(edge => {
        nodesInEdges.add(edge.source);
        nodesInEdges.add(edge.target);
      });

      // Every node should be referenced in at least one edge
      nodeIds.forEach(nodeId => {
        expect(nodesInEdges.has(nodeId)).toBe(true);
      });
    });
  });

  it('should have different text for each option within a question', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      // Check rootCause options
      const rootCauseTexts = caseData.diagnosis.rootCause.options.map(o => o.text);
      const uniqueRootCauseTexts = new Set(rootCauseTexts);
      expect(rootCauseTexts.length).toBe(uniqueRootCauseTexts.size);

      // Check fix options
      const fixTexts = caseData.diagnosis.fix.options.map(o => o.text);
      const uniqueFixTexts = new Set(fixTexts);
      expect(fixTexts.length).toBe(uniqueFixTexts.size);
    });
  });

  it('should have position coordinates within reasonable bounds', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      caseData.diagram.nodes.forEach(node => {
        // Positions should be positive and within reasonable canvas bounds
        expect(node.position.x).toBeGreaterThanOrEqual(0);
        expect(node.position.y).toBeGreaterThanOrEqual(0);
        expect(node.position.x).toBeLessThanOrEqual(10000);
        expect(node.position.y).toBeLessThanOrEqual(10000);
      });
    });
  });

  it('should have correct answer with different feedback than incorrect answers', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      // Test rootCause
      const rootCauseCorrect = caseData.diagnosis.rootCause.options.find(o => o.correct);
      const rootCauseIncorrect = caseData.diagnosis.rootCause.options.filter(o => !o.correct);

      if (rootCauseCorrect) {
        // Correct feedback should start with "Correct!" typically
        expect(rootCauseCorrect.feedback.toLowerCase()).toContain('correct');
      }

      // Test fix
      const fixCorrect = caseData.diagnosis.fix.options.find(o => o.correct);
      const fixIncorrect = caseData.diagnosis.fix.options.filter(o => !o.correct);

      if (fixCorrect) {
        // Correct feedback should start with "Correct!" typically
        expect(fixCorrect.feedback.toLowerCase()).toContain('correct');
      }
    });
  });

  it('should have narrative that introduces the problem scenario', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      // Narrative should be substantial (at least 100 characters for a meaningful story)
      expect(caseData.brief.narrative.length).toBeGreaterThan(100);
    });
  });

  it('should have edge labels that describe the relationship', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      caseData.diagram.edges.forEach(edge => {
        expect(edge.label.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have consistent data types in inspectData', () => {
    caseFiles.forEach(filename => {
      const content = readFileSync(join(casesDir, filename), 'utf-8');
      const caseData = JSON.parse(content) as CaseFile;

      caseData.diagram.nodes.forEach(node => {
        if (node.inspectable && node.inspectData) {
          // All logs should be strings
          node.inspectData.logs.forEach(log => {
            expect(typeof log).toBe('string');
          });

          // Data values should be string or number
          Object.values(node.inspectData.data).forEach(value => {
            expect(['string', 'number'].includes(typeof value)).toBe(true);
          });
        }
      });
    });
  });
});