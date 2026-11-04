import {talentUIRegistry} from './TalentUIRegistry';
import {RenderHtmlTalentUI} from './RenderHtmlTalentUI';

let registered = false;

// Separate from registerDefaultTalents so the talent UI (which pulls the
// bottom-sheet tree) is never in the module graph of engine-logic consumers.
export function registerDefaultTalentUIs(): void {
  if (registered) {
    return;
  }
  talentUIRegistry.register(new RenderHtmlTalentUI());
  registered = true;
}

export function resetRegisteredTalentUIsFlag(): void {
  registered = false;
}
