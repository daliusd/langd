import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';

const readFile = promisify(fs.readFile);
const exec = promisify(child_process.exec);

type InvokeArgs = {
  args: string[];
};

async function run(
  _cwd: string,
  { args }: InvokeArgs,
  text: string,
): Promise<string> {
  const msgPath = (await exec(`fd messages_en.json ${args[0]}`)).stdout.split(
    '\n',
  )[0];
  if (!msgPath) {
    return '';
  }

  const msg = JSON.parse(await readFile(msgPath, { encoding: 'utf8' }));
  let response = '';

  for (const [lineNo, line] of text.split('\n').entries()) {
    for (const m of line.matchAll(/["']([\w\.\-]*)["']/g)) {
      const key = m[1];

      if (msg[key] && m.index) {
        response += `${lineNo + 1}:${m.index + 2}:${
          m.index + key.length + 2
        } en: ${msg[key]}\n`;
      }
    }
  }

  return response;
}

export function invoke(
  cwd: string,
  args: InvokeArgs | [string, InvokeArgs],
  text: string,
  cb: (_err?: string, _resp?: string) => void,
): void {
  if (Array.isArray(args)) {
    args = { ...args[1], args: [args[0], ...args[1].args] };
  }
  run(cwd, args, text)
    .then((resp) => void cb(undefined, resp))
    .catch((error) => void cb(error));
}
