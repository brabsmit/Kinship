
// Mock data
const mockData = [
  { id: '1', name: 'Person A', story: { notes: 'Has a story' }, vital_stats: { born_date: '1900' } },
  { id: '2', name: 'Person B', story: { notes: '' }, vital_stats: { born_date: '1905' } },
  { id: '3', name: 'Person C', story: { notes: 'Another story' }, vital_stats: { born_date: '1910' } },
];

// Mock Dagre
const dagre = {
  graphlib: {
    Graph: class {
      constructor() { this.nodes = {}; this.edges = []; }
      setDefaultEdgeLabel() {}
      setGraph() {}
      setNode(id, opts) { this.nodes[id] = opts; }
      setEdge() {}
      node(id) { return { x: 0, y: 0 }; }
    }
  },
  layout: () => {}
};

// Logic to test
const buildGenealogyGraph = (data, searchText, storyMode) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 50 });

  const nodes = [];

  data.forEach((person) => {
    const bornYear = person.vital_stats.born_date || '????';
    const hasStory = !!person.story?.notes;

    // Search Logic
    const isMatch = !searchText || person.name.toLowerCase().includes(searchText.toLowerCase());

    // Visual Logic
    let opacity = 1;
    let border = '1px solid #ddd';
    let boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

    // Dimming logic
    const dimOpacity = 0.2;

    if (searchText && !isMatch) {
        opacity = dimOpacity;
    } else if (storyMode && !hasStory) {
        opacity = dimOpacity;
    }

    // Highlighting logic (Story Mode)
    if (storyMode && hasStory) {
        border = '2px solid #F59E0B'; // Gold
        boxShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
    }

    dagreGraph.setNode(person.id, { width: 200, height: 60 });
    nodes.push({
      id: person.id,
      data: { label: person.name, year: bornYear, hasStory }, // Mocking label as string for test
      style: {
        background: '#fff',
        border,
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'center',
        width: 200,
        boxShadow,
        opacity,
        transition: 'all 0.3s ease'
      },
    });
  });

  return nodes;
};

// Test Cases
console.log("--- Test Case 1: Default ---");
console.log(JSON.stringify(buildGenealogyGraph(mockData, '', false), null, 2));

console.log("\n--- Test Case 2: Search 'Person A' ---");
console.log(JSON.stringify(buildGenealogyGraph(mockData, 'Person A', false), null, 2));

console.log("\n--- Test Case 3: Story Mode ON ---");
console.log(JSON.stringify(buildGenealogyGraph(mockData, '', true), null, 2));

console.log("\n--- Test Case 4: Search 'Person' + Story Mode ON ---");
console.log(JSON.stringify(buildGenealogyGraph(mockData, 'Person', true), null, 2));

console.log("\n--- Test Case 5: Search 'Person B' (No Story) + Story Mode ON ---");
console.log(JSON.stringify(buildGenealogyGraph(mockData, 'Person B', true), null, 2));
