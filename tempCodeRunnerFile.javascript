const { spawnSync } = require('child_process');
const result = spawnSync('python', ['-c', 'print("Hello, World!")'], { encoding: 'utf-8' });
console.log(result.stdout); // Should print "Hello, World!"