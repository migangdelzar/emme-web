import { normalizeClientName, type Client } from '@emme/domain';
import type { ClientRepository, UpdateClientInput } from './ports/client-repository.js';

interface UpdateClientDependencies {
  clients: ClientRepository;
}

interface UpdateClientCommand {
  id: string;
  input: UpdateClientInput;
}

export function updateClient(dependencies: UpdateClientDependencies) {
  return async function execute(command: UpdateClientCommand): Promise<Client> {
    const input = command.input.name
      ? { ...command.input, name: normalizeClientName(command.input.name) }
      : command.input;

    return dependencies.clients.update(command.id, input);
  };
}
