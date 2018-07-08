import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function sample(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const name = options.name || 'Unknown';

    if (!options.quiet) {
      context.logger.info(`Hello ${name}`);
    }

    return tree;
  };
}
