import { promisify } from 'util';
import child_process from 'child_process';
import fs from 'fs';
import LRU from 'nanolru';

interface InvokeArgs {
  args: string[];
}

interface MessageContent {
  mtime: number;
  messages: Record<string, string>;
}

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const exec = promisify(child_process.exec);

const messageEnFiles = new LRU<string, string[]>({
  max: 50,
  maxAge: 5 * 60 * 1000,
});
const messagesContent = new LRU<string, MessageContent>({
  max: 50,
  maxAge: 60 * 60 * 1000,
});

async function getMsgPaths(rootPath: string) {
  let msgPaths = messageEnFiles.get(rootPath);
  if (!msgPaths) {
    msgPaths = (await exec(`fd messages_en.json ${rootPath}`)).stdout
      .split('\n')
      .filter((fn) => fn.length);
    messageEnFiles.set(rootPath, msgPaths);
  }
  return msgPaths;
}

async function getMessages(msgPaths: string[]) {
  const messagesList = [];
  for (const msgFileName of msgPaths) {
    const mtime = (await stat(msgFileName)).mtimeMs;
    const info = messagesContent.get(msgFileName);

    if (info && info.mtime === mtime) {
      messagesList.push(info.messages);
    } else {
      const messages = JSON.parse(
        await readFile(msgFileName, { encoding: 'utf8' }),
      ) as Record<string, string>;
      messagesList.push(messages);
      messagesContent.set(msgFileName, { mtime, messages });
    }
  }
  return messagesList;
}

function collectUsedString(
  messagesList: Record<string, string>[],
  text: string,
) {
  let response = '';

  for (const [lineNo, line] of text.split('\n').entries()) {
    for (const m of line.matchAll(/["']([\w\.\-]*)["']/g)) {
      const key = m[1];

      if (m.index) {
        for (const messages of messagesList) {
          if (messages[key] && m.index)
            response += `${lineNo + 1}:${m.index + 2}:${
              m.index + key.length + 2
            } en: ${messages[key]}\n`;
        }
      }
    }
  }

  return response;
}

async function run(
  _cwd: string,
  args: string[],
  text: string,
): Promise<string> {
  const msgPaths = await getMsgPaths(args[0] || process.cwd());

  if (!msgPaths || msgPaths.length === 0) {
    return '';
  }

  const messagesList = await getMessages(msgPaths);

  return collectUsedString(messagesList, text);
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
  run(
    cwd,
    args.args.filter((a) => !a.startsWith('-')),
    text,
  )
    .then((resp) => void cb(undefined, resp))
    .catch((error) => void cb(error));
}

export function getStatus() {
  let status = '\n\n';
  status += 'Paths cached by root\n';
  status += '--------------------\n\n';

  for (const key of messageEnFiles.keys) {
    status += `Root: ${key}\n\n\t- `;
    const files = messageEnFiles.get(key) || [];
    if (files.length) {
      status += files.join('\n\t- ') + '\n\n';
    } else {
      status += 'No cached files\n\n';
    }
  }

  return status;
}
