import { Rule, SchematicContext, Tree, SchematicsException, apply, url, 
         chain, branchAndMerge, mergeWith, noop, filter, template, move } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { Schema } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function sample(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException('Name is required.');
    }

    const templateSource = apply(url('./files'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        ...options
      }),
      move(options.path || '')
    ]);

    const rule = chain([
      branchAndMerge(
        chain([
          mergeWith(templateSource)
        ])
      )
    ]);

    return rule(tree, context);
  };
}
