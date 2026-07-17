// The published package's identity, read from its own package.json — the file
// the release bump writes to — so the header can never advertise a version the
// registry doesn't have. Keep the reach outside the docs app in this one module
// rather than spreading the relative path around.
import pkg from '../../../../packages/ui/package.json';

export const packageName: string = pkg.name;
export const packageVersion: string = pkg.version;
export const npmUrl = `https://www.npmjs.com/package/${pkg.name}`;
