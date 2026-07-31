import fs from 'fs';

fs.chmodSync('./build/index.js', '755');
fs.chmodSync('./build/http.js', '755');
