interface Command {
  command: string;
  description: string;
}

const commands: Command[] = [
  {
    command: '-h, --help',
    description: 'Show CLI usage.',
  },
  {
    command: '-v, --version',
    description: 'Print langd version and exit.',
  },
  {
    command: 'start',
    description: 'Start the langd.',
  },
  {
    command: 'stop',
    description: 'Stop the langd.',
  },
  {
    command: 'restart',
    description: 'Restart the langd.',
  },
  {
    command: 'status',
    description: 'Get the langd status.',
  },
  {
    command: 'invoke',
    description: 'Invoke the langd.',
  },
];

export function displayHelp() {
  console.log('Usage: langd [optional root path]\n');
  console.log('Give file content via standard input.\n');
  for (let i = 0, length = commands.length; i < length; i++) {
    console.log(` ${commands[i].command}\n\t${commands[i].description}\n`);
  }
}
