interface Command {
  command: string;
  description: string;
}

/**
 * Note: today this is an array that is only used to display the help menu,
 * but the plan is to improve later to be an array where commands will be defined.
 *
 * TODO: improve the way of displaying the help menu so that no longer need all the "\t's"
 * (as today it just strings the (\t) is used to keep all descriptions aligned.)
 */
const commands: Command[] = [
  {
    command: '--help',
    description: 'Show CLI usage.',
  },
  {
    command: '--version\t',
    description: 'Print langd version and exit.',
  },
  {
    command: 'start\t\t',
    description: 'Start the langd.',
  },
  {
    command: 'stop\t\t',
    description: 'Stop the langd.',
  },
  {
    command: 'restart\t',
    description: 'Restart the langd.',
  },
  {
    command: 'status\t\t',
    description: 'Get the langd status.',
  },
  {
    command: 'invoke\t\t',
    description: 'Invoke the langd.',
  },
];

export function displayHelp() {
  for (let i = 0, length = commands.length; i < length; i++) {
    console.log(` ${commands[i].command}\t${commands[i].description}\n`);
  }
}
