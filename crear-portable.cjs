const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = __dirname;
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n?/g, '\n');
const css = read('estilos.css');
const scripts = ['modelo.js', 'interfaz.js'].map(read);
const hashes = scripts.map(code => "'sha256-" + createHash('sha256').update(code).digest('base64') + "'");
const policy = "default-src 'none'; script-src " + hashes.join(' ') + "; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";

let page = read('clasico.html').replace(/(<meta http-equiv="Content-Security-Policy" content=")[^"]+/, '$1' + policy);
page = page.replace('<link rel="stylesheet" href="estilos.css">', () => '<style>' + css + '</style>');
// Los scripts incrustados se ejecutan después de que exista el contenido de la página.
page = page.replace(/\s*<script defer src="(?:modelo|interfaz)\.js"><\/script>/g, '');
page = page.replace('</body>', () => scripts.map(code => '<script>' + code + '</script>').join('\n') + '\n</body>');
const destination = path.resolve(process.argv[2] || 'Terreno-Ops.html');
fs.writeFileSync(destination, page);
console.log(destination);


