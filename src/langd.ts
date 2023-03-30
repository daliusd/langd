import fs from 'fs';
import { promisify } from 'util';

// @ts-ignore
import { version } from '../package.json';
import { displayHelp } from './args';

const readFile = promisify(fs.readFile);
const validCommands = ['restart', 'start', 'status', 'stop'];

type Action = 'PRINT_VERSION' | 'INVOKE_CORE_D' | 'PRINT_HELP';

function processArgs(args: string[]): [Action, string] {
  const flagsToAction: { [flag: string]: Action | undefined } = {
    '--version': 'PRINT_VERSION',
    '-v': 'PRINT_VERSION',
    '--help': 'PRINT_HELP',
    '-h': 'PRINT_HELP',
  };

  for (const arg of args) {
    const action = flagsToAction[arg];
    if (action) {
      return [action, ''];
    }
  }

  return ['INVOKE_CORE_D', args[0]];
}

async function main(args: string[]): Promise<void> {
  const [action, cmdOrFilename] = processArgs(args);

  switch (action) {
    case 'PRINT_VERSION':
      console.log(`langd ${version}\n`);
      return;
    case 'PRINT_HELP':
      displayHelp();
      return;
  }

  const title = 'langd';

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve('./service');
  process.env.CORE_D_DOTFILE = `.${title}`;

  const core_d = require('core_d');

  if (validCommands.includes(cmdOrFilename)) {
    core_d[cmdOrFilename]();
    return;
  }

  const text = await readFile(process.stdin.fd, { encoding: 'utf-8' });

  core_d.invoke({ args }, text);
}

main(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
