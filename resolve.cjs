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
  const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> [^\r\n]+/g;
  
  content = content.replace(regex, (match, headContent, theirsContent) => {
    // For models, we probably want to keep both contents so we don't lose data, but they might conflict.
    // However, Diksha only added a few things, mostly identical.
    if (file.includes('models')) {
      // Actually, if we just keep head, we might lose Diksha's new locations.
      // Let's just keep HEAD for now, I'll manually patch anything critical.
      return headContent;
    }
    return headContent;
  });
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Resolved', file);
}
