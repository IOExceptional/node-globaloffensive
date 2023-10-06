const ChildProcess = require('child_process');
const FS = require('fs');
const Path = require('path');

const PBJS_BINARY_PATH = Path.join(__dirname, '..', 'node_modules', 'protobufjs', 'dist', 'protobuf');
const PROTO_FILE_PATH = Path.join(__dirname, '..', 'protobufs', '%s.proto');
const DESTINATION_PATH = Path.join(__dirname, '..', 'protobufs', 'generated', '%s.js');
const PBJS_COMMAND_LINE = `node "${PBJS_BINARY_PATH}" --target static-module --out "${DESTINATION_PATH}" --keep-case "${PROTO_FILE_PATH}"`;
const GENERATED_DIR = __dirname + '/../protobufs/generated';

let loader = "// Auto-generated by generate-protos script on " + (new Date()).toString() + "\n\n";
loader += "const Schema = module.exports;\n\n";

if (!FS.existsSync(GENERATED_DIR)) {
	FS.mkdirSync(GENERATED_DIR);
}

FS.readdirSync(__dirname + '/../protobufs').forEach((filename) => {
	if (!filename.match(/\.proto$/)) {
		return;
	}

	let filenameWithoutExtension = filename.replace('.proto', '');
	let cmdLine = PBJS_COMMAND_LINE.replace(/%s/g, filenameWithoutExtension);
	console.log(cmdLine);

	ChildProcess.execSync(cmdLine);
	loader += `mergeObjects(Schema, require('./${filenameWithoutExtension}.js'));\n`;
});

console.log("Generating _load.js");
loader += "\n" + mergeObjects.toString() + "\n";
FS.writeFileSync(GENERATED_DIR + '/_load.js', loader);

function mergeObjects(destinationObject, sourceObject) {
	for (let i in sourceObject) {
		if (sourceObject.hasOwnProperty(i)) {
			destinationObject[i] = sourceObject[i];
		}
	}
}
