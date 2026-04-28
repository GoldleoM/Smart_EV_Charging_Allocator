const fs = require('fs');

const files = [
	'consumer-app/src/components/Map/LiveMap.tsx',
	'consumer-app/src/components/Map/StationMarker.tsx',
	'consumer-app/src/components/Map/VehicleMarker.tsx',
	'consumer-app/src/components/MobileView.tsx',
	'consumer-app/src/components/StationPanel.tsx',
	'frontend/src/App.tsx',
	'frontend/src/components/Map/LiveMap.tsx',
	'frontend/src/components/Map/StationMarker.tsx',
	'frontend/src/components/Map/VehicleMarker.tsx',
	'frontend/src/components/Panels/StationSummary.tsx',
	'frontend/src/components/Panels/VehicleQueue.tsx',
	'src/models/Station.ts',
	'src/models/Vehicle.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Simple regex to replace conflict markers with the HEAD content
  // Since some are add/add conflicts, they might be complex.
  // Actually, a robust regex for this:
  // Match <<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]+\n
  const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> [^\r\n]+/g;
  
  content = content.replace(regex, (match, headContent, theirsContent) => {
    return headContent;
  });
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Resolved', file);
}
